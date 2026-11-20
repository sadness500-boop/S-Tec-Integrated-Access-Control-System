-- =====================================================================
--  S-Tec Integrated Access Control System(통합 출입관리 시스템) — 통합 로그인 서버 작업
--  Designed & Developed by Rat Rae Choi
--
--  ● 어디에 실행하나요?  통합 로그인 Supabase 프로젝트 → SQL Editor → 이 파일 전체 붙여넣기 → Run
--  ● 무엇을 하나요?
--    1) 통합관리 시스템 「프로그램 등록부」(program_registry)에 출입 관리(stac)를 11번째(맨 아래, sort 110)로 등록
--    2) 프로그램별 권한(app_access)에서 stac 지정 가능하게 함
--    3) 공유 출입 DATA 표 ac_records (방문자 people · 차량 cars · 회사 cos · 출입 기록 visits)
--       + 함수 ac_put · ac_list · ac_delete — 표 직접 접근은 막고(RLS, 정책 없음) 함수에서 권한 검사
--       - 제작자 · 관리자: 전체
--       - 사용자: 「프로그램별 권한」 stac 사용 + (지정 지사 기록) + (자기가 기록한 사업장 기록)
--    4) 기존 장비(차량번호인식 · 출입카드 서버) 수신: ac_tokens · ac_token_create(관리자) · ac_ingest(토큰)
--       - 토큰 원문은 만들 때 한 번만 돌려주고 서버에는 SHA-256 해시만 저장
--    5) ac_purge — 보유기간 지난 출입 기록 파기(관리자)
--  ● 기존 자료는 지우지 않습니다. 다시 실행해도 안전합니다.
-- =====================================================================
create extension if not exists pgcrypto with schema extensions;

do $$
declare c record;
begin
  if to_regclass('public.program_registry') is not null then
    insert into public.program_registry (code, name, full_name, url, icon, color, sort, uses_access, version, note)
    values ('stac', '통합 출입관리 시스템', 'S-Tec Integrated Access Control System',
            'https://sadness500-boop.github.io/S-Tec-Integrated-Access-Control-System/', 'assets/apps/stac.png', '#0C2350', 110, true, '1.0.0',
            '방문자 · 방문차량 출입 등록 · 초성 · 번호판 · 업체 통합 검색 · 누적 DATA')
    on conflict (code) do update set name = excluded.name, url = excluded.url, icon = excluded.icon, full_name = excluded.full_name,
      color = excluded.color, sort = excluded.sort, note = excluded.note;
  end if;
  if to_regclass('public.app_access') is not null then
    for c in select conname from pg_constraint
             where conrelid = 'public.app_access'::regclass and contype = 'c'
               and pg_get_constraintdef(oid) ilike '%(app = ANY%'
    loop
      execute format('alter table public.app_access drop constraint %I', c.conname);
    end loop;
  end if;
end $$;

-- 공유 출입 DATA ------------------------------------------------------------------
create table if not exists public.ac_records (
  kind       text not null check (kind in ('people','cars','cos','visits')),
  id         text not null,
  owner      uuid not null default auth.uid(),
  site       text not null default '',
  br         text not null default '',
  d          date,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (kind, id)
);
create index if not exists ac_records_d_idx on public.ac_records (kind, d);
create index if not exists ac_records_site_idx on public.ac_records (site);
create index if not exists ac_records_owner_idx on public.ac_records (owner);
alter table public.ac_records enable row level security;
-- 표에 직접 접근하는 정책은 두지 않습니다(anon · authenticated 모두 직접 조회 불가). 아래 함수로만 읽고 씁니다.
revoke all on public.ac_records from anon, authenticated;

create or replace function public._ac_scope() returns json
language plpgsql stable security definer set search_path = public as $$
declare pr public.profiles; br text[] := '{}'; ok boolean := false;
begin
  select * into pr from public.profiles where id = auth.uid();
  if not found or pr.status <> 'active' then return json_build_object('ok', false); end if;
  if pr.role in ('owner','admin') then return json_build_object('ok', true, 'all', true); end if;
  if to_regclass('public.app_access') is not null then
    execute 'select true, coalesce(branches, ''{}'') from public.app_access where user_id = $1 and app = ''stac'' and perm = ''use''' into ok, br using pr.id;
  end if;
  if not coalesce(ok, false) then return json_build_object('ok', false); end if;
  return json_build_object('ok', true, 'all', false, 'branches', coalesce(br, '{}'));
end $$;

create or replace function public._ac_sites() returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(distinct site), '{}') from public.ac_records where owner = auth.uid() and site <> '';
$$;

create or replace function public.ac_put(p_kind text, p_rows jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare r jsonb; n int := 0; sc json := public._ac_scope(); cur public.ac_records; mine text[] := public._ac_sites(); brs text[];
begin
  if not (sc->>'ok')::boolean then raise exception '출입관리(stac) 사용 권한이 있는 승인된 계정만 저장할 수 있습니다'; end if;
  if p_kind not in ('people','cars','cos','visits') then raise exception '종류가 올바르지 않습니다'; end if;
  if jsonb_typeof(p_rows) <> 'array' then raise exception '목록 형식이 아닙니다'; end if;
  if jsonb_array_length(p_rows) > 1000 or octet_length(p_rows::text) > 6000000 then raise exception '한 번에 올리는 자료가 너무 큽니다'; end if;
  select coalesce(array_agg(x), '{}') into brs from json_array_elements_text(coalesce(sc->'branches', '[]'::json)) x;
  for r in select * from jsonb_array_elements(p_rows) loop
    select * into cur from public.ac_records where kind = p_kind and id = r->>'id';
    if found and cur.owner <> auth.uid() and not coalesce((sc->>'all')::boolean, false)
       and not (cur.site = any(mine)) and not (cur.br = any(brs)) then continue; end if;
    insert into public.ac_records (kind, id, owner, site, br, d, data, updated_at)
    values (p_kind, r->>'id', coalesce(cur.owner, auth.uid()), coalesce(r->>'site',''), coalesce(r->>'br',''),
            nullif(r->>'d','')::date, r->'data', now())
    on conflict (kind, id) do update set site = excluded.site, br = excluded.br, d = excluded.d, data = excluded.data, updated_at = now();
    n := n + 1;
  end loop;
  return json_build_object('ok', true, 'count', n);
end $$;

create or replace function public.ac_list(p_kind text, p_from date default null, p_to date default null)
returns table (id text, data jsonb, updated_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare sc json := public._ac_scope(); brs text[]; mine text[] := public._ac_sites();
begin
  if not (sc->>'ok')::boolean then return; end if;
  select coalesce(array_agg(x), '{}') into brs from json_array_elements_text(coalesce(sc->'branches', '[]'::json)) x;
  return query select a.id, a.data, a.updated_at from public.ac_records a
    where a.kind = p_kind
      and (p_from is null or a.d is null or a.d >= p_from) and (p_to is null or a.d is null or a.d <= p_to)
      and (coalesce((sc->>'all')::boolean, false) or a.owner = auth.uid() or a.site = any(mine) or (array_length(brs,1) > 0 and a.br = any(brs)))
    order by a.d nulls first, a.updated_at limit 50000;
end $$;

create or replace function public.ac_delete(p_kind text, p_ids text[]) returns json
language plpgsql security definer set search_path = public as $$
declare sc json := public._ac_scope(); n int; mine text[] := public._ac_sites();
begin
  if not (sc->>'ok')::boolean then raise exception '승인된 계정만 지울 수 있습니다'; end if;
  delete from public.ac_records a where a.kind = p_kind and a.id = any(p_ids)
    and (a.owner = auth.uid() or coalesce((sc->>'all')::boolean, false) or a.site = any(mine));
  get diagnostics n = row_count;
  return json_build_object('ok', true, 'count', n);
end $$;

-- 기존 장비 수신 토큰 -----------------------------------------------------------------
create table if not exists public.ac_tokens (
  tid        uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  site       text not null default '',
  br         text not null default '',
  label      text not null default '',
  active     boolean not null default true,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  last_used  timestamptz
);
alter table public.ac_tokens enable row level security;
revoke all on public.ac_tokens from anon, authenticated;

create or replace function public.ac_token_create(p_site text, p_br text, p_label text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare pr public.profiles; t text;
begin
  select * into pr from public.profiles where id = auth.uid();
  if not found or pr.status <> 'active' or pr.role not in ('owner','admin') then raise exception '제작자 · 관리자만 수신 토큰을 만들 수 있습니다'; end if;
  t := 'stac_' || encode(extensions.gen_random_bytes(24), 'hex');
  insert into public.ac_tokens (token_hash, site, br, label) values (encode(extensions.digest(t, 'sha256'), 'hex'), coalesce(p_site,''), coalesce(p_br,''), left(coalesce(p_label,''), 80));
  return t;
end $$;

create or replace function public.ac_ingest(p_token text, p_rows jsonb) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare tk public.ac_tokens; r jsonb; n int := 0; vid text; dd date;
begin
  select * into tk from public.ac_tokens where token_hash = encode(extensions.digest(coalesce(p_token,''), 'sha256'), 'hex') and active;
  if not found then raise exception 'invalid token'; end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 500 then raise exception 'rows must be an array (max 500)'; end if;
  for r in select * from jsonb_array_elements(p_rows) loop
    begin dd := coalesce(nullif(r->>'date','')::date, (now() at time zone 'Asia/Seoul')::date); exception when others then continue; end;
    if coalesce(r->>'plate','') = '' and coalesce(r->>'name','') = '' then continue; end if;
    vid := 'i_' || md5(tk.tid::text || dd::text || coalesce(r->>'time_in','') || coalesce(r->>'plate','') || coalesce(r->>'name',''));
    insert into public.ac_records (kind, id, owner, site, br, d, data, updated_at)
    values ('visits', vid, tk.created_by, tk.site, tk.br, dd, jsonb_build_object(
      'id', vid, 'd', dd::text, 'tin', left(coalesce(r->>'time_in',''),5), 'tout', left(coalesce(r->>'time_out',''),5), 'out', coalesce(r->>'time_out','') <> '',
      'kind', case when coalesce(r->>'name','') = '' then 'v' else 'p' end, 'pid', '', 'cid', '',
      'name', left(coalesce(r->>'name',''),40), 'phone', left(coalesce(r->>'phone',''),20), 'plate', left(coalesce(r->>'plate',''),20),
      'co', left(coalesce(r->>'company',''),80), 'dept', left(coalesce(r->>'dept',''),60), 'purpose', left(coalesce(r->>'purpose',''),60),
      'gate', left(coalesce(r->>'gate',''),40), 'badge', left(coalesce(r->>'badge',''),30), 'site', tk.site, 'br', tk.br,
      'src', 'ingest:' || tk.label, 'at', now()), now())
    on conflict (kind, id) do update set data = excluded.data, updated_at = now();
    n := n + 1;
  end loop;
  update public.ac_tokens set last_used = now() where tid = tk.tid;
  return json_build_object('ok', true, 'count', n);
end $$;

create or replace function public.ac_purge(p_before date) returns json
language plpgsql security definer set search_path = public as $$
declare pr public.profiles; n int;
begin
  select * into pr from public.profiles where id = auth.uid();
  if not found or pr.status <> 'active' or pr.role not in ('owner','admin') then raise exception '제작자 · 관리자만 파기할 수 있습니다'; end if;
  delete from public.ac_records where kind = 'visits' and d < p_before;
  get diagnostics n = row_count;
  return json_build_object('ok', true, 'count', n);
end $$;

revoke all on function public._ac_scope() from public, anon, authenticated;
revoke all on function public._ac_sites() from public, anon, authenticated;
revoke all on function public.ac_put(text, jsonb) from public, anon;
revoke all on function public.ac_list(text, date, date) from public, anon;
revoke all on function public.ac_delete(text, text[]) from public, anon;
revoke all on function public.ac_token_create(text, text, text) from public, anon;
revoke all on function public.ac_purge(date) from public, anon;
revoke all on function public.ac_ingest(text, jsonb) from public;
grant execute on function public.ac_put(text, jsonb) to authenticated;
grant execute on function public.ac_list(text, date, date) to authenticated;
grant execute on function public.ac_delete(text, text[]) to authenticated;
grant execute on function public.ac_token_create(text, text, text) to authenticated;
grant execute on function public.ac_purge(date) to authenticated;
grant execute on function public.ac_ingest(text, jsonb) to anon, authenticated;

-- 확인: stac 한 줄 + ac_records 0건 이상이 보이면 완료
select code, name, sort from public.program_registry where code = 'stac';
select count(*) as ac_records from public.ac_records;
