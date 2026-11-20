/* =====================================================================
 * S-Tec Integrated Access Control System (에스텍 통합 출입관리 시스템) v1.0.0 — 핵심 로직
 *  · 방문자 · 방문차량 출입 등록 → 개인별 · 차량별 · 회사별 누적 DATA
 *  · 통합 검색: 초성(사람 · 부서 · 업무 · 회사) · 차량번호 숫자 앞 두 자리 · 업체명
 *  · 동명이인 구분(연락처 · 소속 이력) · 소속 회사 변경 이력(A사 퇴직 → B사 소속 방문)
 *  · 저장: 이 기기(localStorage) → 로그인 시 공유 서버(ac_* 표, 통합 로그인 Supabase)
 * Program & Design by Rat Rae Choi (제작자 서명 — 하드코딩)
 * ===================================================================== */
const APP = {
  name: 'S-Tec Integrated Access Control System',
  ko: '통합 출입관리 시스템',
  code: 'stac',
  version: 'v1.0.1',
  build: '2026-11-20',
  shareUrl: 'https://sadness500-boop.github.io/S-Tec-Integrated-Access-Control-System/',
  apkUrl: 'https://github.com/sadness500-boop/S-Tec-Integrated-Access-Control-System/releases/download/app-latest/stac-latest.apk',
  repo: 'https://github.com/sadness500-boop/S-Tec-Integrated-Access-Control-System',
  mainUrl: 'https://sadness500-boop.github.io/S-Tec-Operations-and-Sales-Integrated-Management-System/',
  maker: 'Rat Rae Choi',
  org: '에스텍 그룹',
  branch: '에스텍베스트 동부지사'
};

/* ---------- 유틸 ---------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const WKK = ['일', '월', '화', '수', '목', '금', '토'];
function kstNow() { const d = new Date(); return new Date(d.getTime() + (d.getTimezoneOffset() + 540) * 60000); }
function isoD(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parseD(s) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function fmtD(d) { if (typeof d === 'string') d = parseD(d); return d ? `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}(${WKK[d.getDay()]})` : '-'; }
function fmtDs(d) { if (typeof d === 'string') d = parseD(d); return d ? `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}` : '-'; }
const today = () => isoD(kstNow());
const nowHM = () => { const d = kstNow(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const nf = (n, dg = 0) => (n == null || isNaN(n)) ? '-' : Number(n).toLocaleString('ko-KR', { maximumFractionDigits: dg, minimumFractionDigits: 0 });
const pct = n => (n == null || isNaN(n)) ? '-' : nf(n, 1) + '%';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function toast(msg, ms = 2600) { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), ms); }
function busy(on, msg) { const b = $('#busy'); if (!b) return; b.classList.toggle('on', !!on); if (msg) $('#busyMsg').textContent = msg; }
function safeName(s) { return String(s || '').replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 50); }
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
function b64ToU8(b64) { const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
const dataUrlB64 = u => String(u).split(',')[1];
async function download(blob, name) {
  const P = window.Capacitor && window.Capacitor.Plugins;
  if (P && P.Filesystem) {
    try {
      const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });
      const w = await P.Filesystem.writeFile({ path: name, data: b64, directory: 'CACHE' });
      if (P.Share) await P.Share.share({ title: name, files: [w.uri], dialogTitle: '파일 저장·보내기' }); else toast('파일을 만들었습니다: ' + name);
      return;
    } catch (e) { if (e && /cancel/i.test(String(e.message || e))) return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
function shrinkPhoto(file, max = 640) {
  return new Promise((res, rej) => {
    const rd = new FileReader();
    rd.onload = () => { const im = new Image(); im.onload = () => { const r = Math.min(1, max / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = Math.round(im.width * r); c.height = Math.round(im.height * r); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.7)); }; im.onerror = rej; im.src = rd.result; };
    rd.onerror = rej; rd.readAsDataURL(file);
  });
}

/* =====================================================================
 * 한글 초성 검색 · 차량번호 검색
 * ===================================================================== */
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const isCho = ch => CHO.includes(ch);
function choOf(ch) { const c = ch.charCodeAt(0); return c >= 0xAC00 && c <= 0xD7A3 ? CHO[Math.floor((c - 0xAC00) / 588)] : ch; }
function chosung(s) { return [...String(s || '')].map(choOf).join(''); }
const norm = s => String(s || '').toLowerCase().replace(/[\s·.\-_/()㈜]/g, '').replace(/주식회사|유한회사|\(주\)/g, '');
/* 질의(초성 · 일부 글자 · 섞어 쓰기 모두)가 대상 안에 있는지 — 「ㅎㄱㄷ」「홍ㄱ」「길동」 → 홍길동 */
function hanMatch(target, q) {
  const t = [...norm(target)], s = [...norm(q)];
  if (!s.length) return true;
  if (!t.length || s.length > t.length) return false;
  outer: for (let i = 0; i <= t.length - s.length; i++) {
    for (let j = 0; j < s.length; j++) {
      const a = t[i + j], b = s[j];
      if (isCho(b)) { if (choOf(a) !== b && a !== b) continue outer; }
      else if (a !== b) continue outer;
    }
    return true;
  }
  return false;
}
/* 차량번호: 「12가3456」 → 숫자 「123456」, 앞자리 「12」, 뒷자리 「3456」 */
function plateNorm(p) { return String(p || '').replace(/[\s\-·.]/g, '').toUpperCase(); }
function plateParts(p) {
  const n = plateNorm(p), m = /^([가-힣]{0,3})(\d{2,3})([가-힣])(\d{4})$/.exec(n);
  const digits = n.replace(/\D/g, '');
  return m ? { region: m[1], front: m[2], mid: m[3], back: m[4], digits } : { region: '', front: digits.slice(0, Math.max(0, digits.length - 4)), mid: '', back: digits.slice(-4), digits };
}
function plateFmt(p) { const x = plateParts(p); return x.mid ? `${x.region}${x.front}${x.mid} ${x.back}` : plateNorm(p); }
function plateValid(p) { return /^([가-힣]{2,3})?\d{2,3}[가-힣]\d{4}$/.test(plateNorm(p)); }
/* 숫자 질의: 앞 두 자리부터 검색 — 번호 앞자리 · 뒷자리 · 전체 숫자 어디로 시작해도 찾음 */
function plateMatch(plate, q) {
  const d = String(q || '').replace(/\D/g, ''); if (d.length < 2) return false;
  const x = plateParts(plate);
  if (x.digits.startsWith(d) || x.front.startsWith(d) || x.back.startsWith(d)) return true;
  if (d.length >= 3 && x.digits.includes(d)) return true;
  const nq = plateNorm(q); return nq.length >= 3 && /[가-힣]/.test(nq) && plateNorm(plate).includes(nq);
}
const isPlateQuery = q => /^[\d가-힣\s]*\d{2}[\d가-힣\s]*$/.test(String(q || '').trim()) && /\d{2}/.test(q) && !/[ㄱ-ㅎ]/.test(q);
function maskPhone(p) { const d = String(p || '').replace(/\D/g, ''); if (!d) return ''; if (!AC.cfg.maskPhone) return phoneFmt(d); return d.length >= 8 ? `${d.slice(0, 3)}-****-${d.slice(-4)}` : '****' + d.slice(-2); }
function phoneFmt(p) { const d = String(p || '').replace(/\D/g, ''); if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`; if (d.length === 10) return d.startsWith('02') ? `02-${d.slice(2, 6)}-${d.slice(6)}` : `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`; return p || ''; }

/* =====================================================================
 * 저장소
 * ===================================================================== */
const AC_KEY = 'stec_ac_data';
const DEF_CFG = {
  site: { key: '', name: '', br: '' },
  gates: ['정문', '후문', '물류 출입구'],
  depts: ['총무팀', '인사팀', '생산팀', '품질팀', '구매팀', '설비보전팀', '환경안전팀', '연구소', '영업팀', '물류팀', '자재창고', '경영지원팀'],
  purposes: ['업무 협의', '납품', '공사 · 작업', '설비 점검 · A/S', '면접', '교육 · 견학', '회의', '택배 · 배송', '방문(개인)', '기타'],
  vtypes: ['승용', '승합', '화물(1톤 이하)', '화물(1톤 초과)', '특수 · 중장비', '탱크로리', '택배', '이륜'],
  labels: {}, required: { phone: false, host: false, badge: false },
  maskPhone: true, retainY: 3, lockMin: 0, pin: '', hook: { on: false, url: '', token: '', fmt: 'json' }, maps: {}, ingestTokens: []
};
let AC = { people: {}, cars: {}, cos: {}, visits: {}, cfg: JSON.parse(JSON.stringify(DEF_CFG)), ver: 1 };
try { const o = JSON.parse(localStorage.getItem(AC_KEY) || '{}'); AC = Object.assign(AC, o); AC.cfg = Object.assign(JSON.parse(JSON.stringify(DEF_CFG)), o.cfg || {}); } catch (e) { }
/* 웹훅 토큰처럼 기기 밖으로 나가면 안 되는 값은 별도 키(이 기기만) */
const LOCAL_SECRET = 'stec_ac_local';
let SECRET = {}; try { SECRET = JSON.parse(localStorage.getItem(LOCAL_SECRET) || '{}'); } catch (e) { }
function saveSecret() { try { localStorage.setItem(LOCAL_SECRET, JSON.stringify(SECRET)); } catch (e) { } }
function saveAC() {
  IDX.dirty = true;
  try { localStorage.setItem(AC_KEY, JSON.stringify(AC)); }
  catch (e) { toast('이 기기 저장 공간이 부족합니다 — 「⚙ 설정 › 백업」 후 오래된 기록을 정리하거나 공유 서버에 올려 두세요', 5000); }
}
function storeBytes() { try { return (localStorage.getItem(AC_KEY) || '').length * 2; } catch (e) { return 0; } }
const L = k => (AC.cfg.labels && AC.cfg.labels[k]) || ({ dept: '방문부서', host: '피방문자(담당)', purpose: '방문 목적(업무)', co: '소속 회사', badge: '출입증 번호', gate: '출입구', items: '반입 물품', name: '성명', plate: '차량번호' }[k] || k);

/* ---------- 사업장 ---------- */
let SITE_LIST = [];
function buildSites() { SITE_LIST = SITES.map(s => ({ key: 'b' + s.id, name: s.name, br: s.br, type: s.type, work: s.work, addr: s.addr })).filter(s => /보안|경비/.test(s.work) || /공장|물류|빌딩|대학|학교|병원/.test(s.type)); }
function siteName() { return AC.cfg.site && AC.cfg.site.name || '사업장 미지정'; }

/* =====================================================================
 * 회사 · 사람 · 차량 레지스트리
 * ===================================================================== */
function coKey(name) { return 'c_' + norm(name); }
function ensureCo(name) {
  name = String(name || '').trim(); if (!name) return null;
  const k = coKey(name);
  if (!AC.cos[k]) AC.cos[k] = { id: k, name, info: null, created: new Date().toISOString() };
  return AC.cos[k];
}
function coOf(name) { return AC.cos[coKey(name)] || null; }
function plateKey(p) { return 'v_' + plateNorm(p); }
function findPeopleByName(name) { const n = norm(name); return Object.values(AC.people).filter(p => norm(p.name) === n); }
function samePhone(a, b) { const x = String(a || '').replace(/\D/g, ''), y = String(b || '').replace(/\D/g, ''); return x && y && x === y; }
/* 소속 이력: 방문 기록의 회사 스냅샷을 시간순으로 묶어 「A사 2025.01~2025.08 → B사 2025.09~」 */
function coHistory(visits) {
  const out = []; visits.slice().sort((a, b) => (a.d + a.tin).localeCompare(b.d + b.tin)).forEach(v => {
    const last = out[out.length - 1];
    if (last && norm(last.co) === norm(v.co)) { last.to = v.d; last.n++; } else out.push({ co: v.co, from: v.d, to: v.d, n: 1 });
  });
  return out;
}
function visitsOfPerson(pid) { return Object.values(AC.visits).filter(v => v.pid === pid).sort(byTimeDesc); }
function visitsOfCar(cid) { return Object.values(AC.visits).filter(v => v.cid === cid).sort(byTimeDesc); }
function visitsOfCo(name) { const n = norm(name); return Object.values(AC.visits).filter(v => norm(v.co) === n).sort(byTimeDesc); }
const byTimeDesc = (a, b) => (b.d + b.tin).localeCompare(a.d + a.tin);
function peopleOfCo(name) { const n = norm(name), ids = new Set(); Object.values(AC.visits).forEach(v => { if (v.pid && norm(v.co) === n) ids.add(v.pid); }); Object.values(AC.people).forEach(p => { if (norm(p.company) === n) ids.add(p.id); }); return [...ids].map(i => AC.people[i]).filter(Boolean); }
function carsOfCo(name) { const n = norm(name), ids = new Set(); Object.values(AC.visits).forEach(v => { if (v.cid && norm(v.co) === n) ids.add(v.cid); }); Object.values(AC.cars).forEach(c => { if (norm(c.company) === n) ids.add(c.id); }); return [...ids].map(i => AC.cars[i]).filter(Boolean); }
function carsOfPerson(pid) { const ids = new Set(); Object.values(AC.visits).forEach(v => { if (v.pid === pid && v.cid) ids.add(v.cid); }); Object.values(AC.cars).forEach(c => { if (c.driver === pid) ids.add(c.id); }); return [...ids].map(i => AC.cars[i]).filter(Boolean); }
function peopleOfCar(cid) { const ids = new Set(); Object.values(AC.visits).forEach(v => { if (v.cid === cid && v.pid) ids.add(v.pid); }); const c = AC.cars[cid]; if (c && c.driver) ids.add(c.driver); return [...ids].map(i => AC.people[i]).filter(Boolean); }

/* =====================================================================
 * 출입 등록 — 방문자(kind p) · 방문차량(kind v) · 한 기록에 사람+차량을 함께 연결
 * ===================================================================== */
function upsertPerson(f, pid) {
  let p = pid && AC.people[pid];
  const at = new Date().toISOString();
  if (!p) { p = { id: 'p_' + uid(), name: f.name.trim(), phone: f.phone || '', company: f.co || '', title: f.title || '', note: '', ban: null, created: at, coHist: [] }; AC.people[p.id] = p; }
  if (f.phone) p.phone = f.phone;
  if (f.title) p.title = f.title;
  if (f.co && norm(f.co) !== norm(p.company)) { p.coHist = p.coHist || []; if (p.company) p.coHist.push({ co: p.company, to: today() }); p.company = f.co; }
  p.updated = at; ensureCo(f.co); return p;
}
function upsertCar(f, cid) {
  const k = cid || plateKey(f.plate); let c = AC.cars[k]; const at = new Date().toISOString();
  if (!c) { c = { id: k, plate: plateFmt(f.plate), type: f.vtype || '', model: f.model || '', company: f.co || '', driver: '', ban: null, created: at, coHist: [] }; AC.cars[k] = c; }
  if (f.vtype) c.type = f.vtype; if (f.model) c.model = f.model;
  if (f.co && norm(f.co) !== norm(c.company)) { c.coHist = c.coHist || []; if (c.company) c.coHist.push({ co: c.company, to: today() }); c.company = f.co; }
  if (f.pid) c.driver = f.pid;
  c.updated = at; ensureCo(f.co); return c;
}
function addVisit(v) {
  const r = Object.assign({ id: 'a_' + uid(), d: today(), tin: nowHM(), tout: '', out: false, site: AC.cfg.site.key || '', siteName: siteName(), br: AC.cfg.site.br || '', guard: UI.manager ? UI.manager.name : '', src: 'manual', at: new Date().toISOString() }, v);
  AC.visits[r.id] = r; saveAC(); queueShare('visits', r.id); if (r.pid) queueShare('people', r.pid); if (r.cid) queueShare('cars', r.cid); const co = coOf(r.co); if (co) queueShare('cos', co.id);
  fireHook('in', r); return r;
}
function checkOut(id, t) {
  const v = AC.visits[id]; if (!v) return;
  v.out = true; v.tout = t || nowHM(); v.outD = today(); v.at = new Date().toISOString(); saveAC(); queueShare('visits', id); fireHook('out', v);
}
function stayMin(v) { if (!v.tin) return null; const [h1, m1] = v.tin.split(':').map(Number); const e = v.tout ? v.tout.split(':').map(Number) : (v.d === today() ? nowHM().split(':').map(Number) : null); if (!e) return null; let m = (e[0] * 60 + e[1]) - (h1 * 60 + m1); if (v.outD && v.outD !== v.d) m += 1440 * Math.round((parseD(v.outD) - parseD(v.d)) / 864e5); return m < 0 ? m + 1440 : m; }
const stayTxt = m => m == null ? '-' : m >= 60 ? `${Math.floor(m / 60)}시간 ${m % 60}분` : `${m}분`;
function inside() { return Object.values(AC.visits).filter(v => !v.out).sort(byTimeDesc); }
function banOf(v) { const p = v.pid && AC.people[v.pid], c = v.cid && AC.cars[v.cid]; return (p && p.ban && p.ban.on && p.ban) || (c && c.ban && c.ban.on && c.ban) || null; }

/* =====================================================================
 * 통합 검색 — 사람 · 차량 · 회사 · 부서 · 업무를 한 칸에서
 * ===================================================================== */
const IDX = { dirty: true };
function search(q, lim = 40) {
  q = String(q || '').trim(); const R = { people: [], cars: [], cos: [], depts: [], purposes: [], q };
  if (!q) return R;
  const plateQ = isPlateQuery(q);
  if (plateQ) R.cars = Object.values(AC.cars).filter(c => plateMatch(c.plate, q));
  else R.cars = Object.values(AC.cars).filter(c => hanMatch(c.company, q) || hanMatch(c.model, q));
  if (!plateQ) {
    const dq = q.replace(/\D/g, '');
    R.people = Object.values(AC.people).filter(p => hanMatch(p.name, q) || hanMatch(p.company, q) || hanMatch(p.title, q) || (dq.length >= 4 && String(p.phone || '').replace(/\D/g, '').endsWith(dq)));
    const coNames = new Map(); Object.values(AC.cos).forEach(c => coNames.set(norm(c.name), c));
    Object.values(AC.visits).forEach(v => { if (v.co && !coNames.has(norm(v.co))) coNames.set(norm(v.co), { id: coKey(v.co), name: v.co }); });
    R.cos = [...coNames.values()].filter(c => hanMatch(c.name, q));
    const dc = {}, pc = {};
    Object.values(AC.visits).forEach(v => { if (v.dept && hanMatch(v.dept, q)) dc[v.dept] = (dc[v.dept] || 0) + 1; if (v.purpose && hanMatch(v.purpose, q)) pc[v.purpose] = (pc[v.purpose] || 0) + 1; });
    AC.cfg.depts.forEach(d => { if (hanMatch(d, q) && !dc[d]) dc[d] = 0; });
    R.depts = Object.entries(dc).sort((a, b) => b[1] - a[1]).map(([n, c]) => ({ n, c }));
    R.purposes = Object.entries(pc).sort((a, b) => b[1] - a[1]).map(([n, c]) => ({ n, c }));
    // 업체만 넣어도: 회사가 맞으면 그 회사 방문자 · 차량도 함께
    R.cos.slice(0, 5).forEach(c => { peopleOfCo(c.name).forEach(p => { if (!R.people.includes(p)) R.people.push(p); }); carsOfCo(c.name).forEach(x => { if (!R.cars.includes(x)) R.cars.push(x); }); });
  }
  const cnt = {}; Object.values(AC.visits).forEach(v => { if (v.pid) cnt[v.pid] = (cnt[v.pid] || 0) + 1; if (v.cid) cnt[v.cid] = (cnt[v.cid] || 0) + 1; });
  const rank = (a, b) => (cnt[b.id] || 0) - (cnt[a.id] || 0);
  R.people.sort(rank); R.cars.sort(rank); R.cnt = cnt;
  if (plateQ) { const d = q.replace(/\D/g, ''), sc = c => { const x = plateParts(c.plate); return x.front === d || x.back === d ? 0 : x.front.startsWith(d) || x.back.startsWith(d) ? 1 : x.digits.startsWith(d) ? 2 : 3; }; R.cars.sort((a, b) => sc(a) - sc(b) || rank(a, b)); }
  R.people = R.people.slice(0, lim); R.cars = R.cars.slice(0, lim); R.cos = R.cos.slice(0, 20);
  return R;
}
function lastVisit(list) { return list[0] || null; }

/* =====================================================================
 * DATA 조회 — 기간 · 구분 · 검색어 · 부서 · 회사 · 사업장 필터와 집계
 * ===================================================================== */
function rangeOf(k, ref) {
  const d = parseD(ref || today());
  if (k === 'd') return { from: isoD(d), to: isoD(d) };
  if (k === 'w') { const s = addDays(d, -((d.getDay() + 6) % 7)); return { from: isoD(s), to: isoD(addDays(s, 6)) }; }
  if (k === '7') return { from: isoD(addDays(d, -6)), to: isoD(d) };
  if (k === 'm') return { from: isoD(new Date(d.getFullYear(), d.getMonth(), 1)), to: isoD(new Date(d.getFullYear(), d.getMonth() + 1, 0)) };
  if (k === 'y') return { from: `${d.getFullYear()}-01-01`, to: `${d.getFullYear()}-12-31` };
  return { from: '2000-01-01', to: '2099-12-31' };
}
function queryVisits(F) {
  const q = String(F.q || '').trim(), plateQ = isPlateQuery(q);
  return Object.values(AC.visits).filter(v => {
    if (F.from && v.d < F.from) return false; if (F.to && v.d > F.to) return false;
    if (F.kind === 'p' && !v.pid) return false; if (F.kind === 'v' && !v.cid) return false;
    if (F.dept && v.dept !== F.dept) return false;
    if (F.co && norm(v.co) !== norm(F.co)) return false;
    if (F.pid && v.pid !== F.pid) return false; if (F.cid && v.cid !== F.cid) return false;
    if (F.purpose && v.purpose !== F.purpose) return false;
    if (F.site && v.site !== F.site) return false;
    if (F.state === 'in' && v.out) return false; if (F.state === 'out' && !v.out) return false;
    if (q) { if (plateQ) return v.plate && plateMatch(v.plate, q); return hanMatch(v.name, q) || hanMatch(v.co, q) || hanMatch(v.dept, q) || hanMatch(v.purpose, q) || hanMatch(v.host, q) || (v.plate && hanMatch(v.plate, q)); }
    return true;
  }).sort(byTimeDesc);
}
function groupBy(list, keyFn, labelFn) {
  const m = new Map();
  list.forEach(v => { const k = keyFn(v); if (k == null || k === '') return; let g = m.get(k); if (!g) { g = { k, label: labelFn ? labelFn(v) : k, n: 0, days: new Set(), first: v.d, last: v.d, depts: {}, cos: {}, list: [] }; m.set(k, g); } g.n++; g.days.add(v.d); if (v.d < g.first) g.first = v.d; if (v.d > g.last) g.last = v.d; if (v.dept) g.depts[v.dept] = (g.depts[v.dept] || 0) + 1; if (v.co) g.cos[v.co] = (g.cos[v.co] || 0) + 1; g.list.push(v); });
  return [...m.values()].sort((a, b) => b.n - a.n);
}
const topOf = (o, n = 3) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, c]) => `${k}(${c})`).join(', ');
function summary(list) {
  return { n: list.length, p: list.filter(v => v.pid).length, v: list.filter(v => v.cid).length, ppl: new Set(list.filter(v => v.pid).map(v => v.pid)).size, cars: new Set(list.filter(v => v.cid).map(v => v.cid)).size, cos: new Set(list.map(v => norm(v.co)).filter(Boolean)).size, depts: new Set(list.map(v => v.dept).filter(Boolean)).size, inside: list.filter(v => !v.out).length, days: new Set(list.map(v => v.d)).size, ban: list.filter(v => v.banHit).length };
}

/* =====================================================================
 * 회사 기본정보 — 인터넷 공개 정보(위키백과 · 위키데이터, 서버 함수가 있으면 카카오 지역검색)
 *  · 보내는 값은 「회사 이름」 하나뿐 — 방문자 개인정보는 밖으로 보내지 않습니다
 * ===================================================================== */
async function fetchJSON(url, opt = {}, ms = 9000) {
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms);
  try { const r = await fetch(url, Object.assign({ signal: ac.signal, referrerPolicy: 'no-referrer', credentials: 'omit' }, opt)); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); } finally { clearTimeout(t); }
}
async function lookupCompany(name) {
  const info = { name, src: [], at: new Date().toISOString() };
  const strip = String(name).replace(/\(주\)|㈜|주식회사|유한회사/g, '').trim();
  // 1) 서버 함수(선택) — Supabase Edge Function 「ac-company」(카카오 지역검색 키는 서버에만 보관)
  try {
    const A = window.STAC_AUTH, cfg = A && A.cfg;
    if (A && A.client && cfg && cfg.supabaseUrl) {
      const { data: s } = await A.client.auth.getSession(); const tok = s && s.session && s.session.access_token;
      if (tok) { const j = await fetchJSON(`${cfg.supabaseUrl}/functions/v1/ac-company?q=${encodeURIComponent(strip)}`, { headers: { Authorization: 'Bearer ' + tok, apikey: cfg.supabaseAnonKey } }, 8000); if (j && j.ok) { Object.assign(info, j.info || {}); info.src.push(j.source || '서버 검색'); } }
    }
  } catch (e) { }
  // 2) 위키백과(한국어) → 위키데이터
  try {
    const s = await fetchJSON(`https://ko.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(strip + ' 기업')}&srlimit=3&format=json&origin=*`);
    const hit = (s.query && s.query.search || []).find(h => norm(h.title).includes(norm(strip)) || norm(strip).includes(norm(h.title))) || null;
    if (hit) {
      const sm = await fetchJSON(`https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`);
      info.desc = info.desc || sm.extract || ''; info.wiki = sm.content_urls && sm.content_urls.desktop && sm.content_urls.desktop.page || '';
      if (!info.photo && sm.originalimage) info.photo = sm.originalimage.source;
      if (sm.wikibase_item) {
        const W = await fetchJSON(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${sm.wikibase_item}&props=claims&format=json&origin=*`);
        const cl = (W.entities[sm.wikibase_item] || {}).claims || {};
        const val = p => cl[p] && cl[p][0] && cl[p][0].mainsnak.datavalue ? cl[p][0].mainsnak.datavalue.value : null;
        const ids = ['P169', 'P488', 'P159', 'P452'].flatMap(p => (cl[p] || []).slice(0, 3).map(c => c.mainsnak.datavalue && c.mainsnak.datavalue.value.id).filter(Boolean));
        let lab = {};
        if (ids.length) { const LB = await fetchJSON(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids.join('|')}&props=labels&languages=ko|en&format=json&origin=*`); Object.entries(LB.entities || {}).forEach(([k, e]) => lab[k] = (e.labels.ko || e.labels.en || {}).value); }
        const lb = p => (cl[p] || []).slice(0, 3).map(c => c.mainsnak.datavalue && lab[c.mainsnak.datavalue.value.id]).filter(Boolean).join(', ');
        info.home = info.home || val('P856') || '';
        info.ceo = info.ceo || lb('P169') || lb('P488') || '';
        info.hq = lb('P159'); info.ind = info.ind || lb('P452') || '';
        if (!info.addr) { const a = val('P6375'); info.addr = a && a.text || ''; }
        if (!info.tel) { const t = val('P1329'); info.tel = typeof t === 'string' ? t : ''; }
        const img = val('P18'); if (img && !info.photoBuilding) info.photoBuilding = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(img)}?width=800`;
        const inc = val('P571'); if (inc && inc.time) info.since = inc.time.slice(1, 5);
      }
      info.src.push('위키백과 · 위키데이터');
    }
  } catch (e) { }
  info.found = !!(info.addr || info.tel || info.home || info.ceo || info.desc || info.ind);
  return info;
}
function coLinks(name) {
  const q = encodeURIComponent(String(name).replace(/\(주\)|㈜|주식회사/g, '').trim());
  return [['네이버 검색', `https://search.naver.com/search.naver?query=${q}`], ['카카오맵', `https://map.kakao.com/?q=${q}`], ['네이버 지도', `https://map.naver.com/p/search/${q}`], ['구글', `https://www.google.com/search?q=${q}`], ['전경 사진(이미지 검색)', `https://search.naver.com/search.naver?where=image&query=${q}+%EC%82%AC%EC%98%A5`]];
}

/* =====================================================================
 * 공유 서버 (통합 로그인 Supabase) — ac_put · ac_list · ac_delete
 *   승인된 계정 + 「프로그램별 권한」 stac 사용자만, 표 직접 접근은 차단(RLS)
 * ===================================================================== */
const SHARE = { q: { people: new Set(), cars: new Set(), cos: new Set(), visits: new Set() }, del: [], t: null, ok: null, last: '' };
function sbClient() { const A = window.STAC_AUTH; return A && A.client && A.profile ? A.client : null; }
function queueShare(kind, id, del) { if (del) SHARE.del.push([kind, id]); else SHARE.q[kind].add(id); clearTimeout(SHARE.t); SHARE.t = setTimeout(flushShare, 2500); }
async function flushShare() {
  const sb = sbClient(); if (!sb || SHARE.ok === false) return;
  try {
    for (const kind of ['cos', 'people', 'cars', 'visits']) {
      const ids = [...SHARE.q[kind]].filter(i => AC[kind][i] && !AC[kind][i].sample); SHARE.q[kind].clear();
      for (let i = 0; i < ids.length; i += 300) {
        const rows = ids.slice(i, i + 300).map(id => { const o = AC[kind][id]; return { id, d: o.d || null, site: o.site || AC.cfg.site.key || '', br: o.br || AC.cfg.site.br || '', data: o }; });
        const { error } = await sb.rpc('ac_put', { p_kind: kind, p_rows: rows }); if (error) throw error;
      }
    }
    const dels = SHARE.del.splice(0);
    for (const kind of ['visits', 'people', 'cars', 'cos']) { const ids = dels.filter(x => x[0] === kind).map(x => x[1]); if (ids.length) { const { error } = await sb.rpc('ac_delete', { p_kind: kind, p_ids: ids }); if (error) throw error; } }
    SHARE.ok = true; SHARE.last = new Date().toISOString(); renderShareState();
  } catch (e) { if (/ac_put|ac_delete|function|schema|permission/i.test(String(e.message || e))) SHARE.ok = false; renderShareState(); }
}
async function pullShare(from, to) {
  const sb = sbClient(); if (!sb) { toast('로그인하면 공유 서버의 출입 기록을 함께 조회합니다'); return 0; }
  busy(true, '공유 서버에서 받는 중…');
  try {
    let n = 0;
    for (const kind of ['cos', 'people', 'cars', 'visits']) {
      const { data, error } = await sb.rpc('ac_list', { p_kind: kind, p_from: kind === 'visits' ? from : null, p_to: kind === 'visits' ? to : null }); if (error) throw error;
      (data || []).forEach(r => { const cur = AC[kind][r.id]; if (!cur || String(cur.at || cur.updated || '') <= String(r.data.at || r.data.updated || '')) { AC[kind][r.id] = r.data; n++; } });
    }
    linkIngested(); saveAC(); SHARE.ok = true; renderShareState(); return n;
  } catch (e) { SHARE.ok = false; renderShareState(); toast('공유 서버가 아직 준비되지 않았습니다 — server/supabase_stac.sql 실행 필요', 4500); return 0; }
  finally { busy(false); }
}
/* 기존 장비(ac_ingest)로 들어온 기록 — 차량번호 · 이름으로 기존 차량 · 방문자 DATA에 연결 */
function linkIngested() {
  Object.values(AC.visits).forEach(v => {
    if (!String(v.src || '').startsWith('ingest') || v.linked) return;
    if (v.plate && !v.cid) { const c = upsertCar({ plate: v.plate, co: v.co }, AC.cars[plateKey(v.plate)] ? plateKey(v.plate) : ''); v.cid = c.id; v.plate = c.plate; if (!v.co) v.co = c.company; }
    if (v.name && !v.pid) { const same = findPeopleByName(v.name).find(p => samePhone(p.phone, v.phone) || (!v.phone && norm(p.company) === norm(v.co))); v.pid = upsertPerson({ name: v.name, phone: v.phone, co: v.co }, same && same.id).id; }
    if (!v.co) v.co = '(미기재)'; v.siteName = v.siteName || siteName(); v.linked = true;
  });
}
async function pushAllShare() { ['cos', 'people', 'cars', 'visits'].forEach(k => Object.keys(AC[k]).forEach(id => { if (!AC[k][id].sample) SHARE.q[k].add(id); })); SHARE.ok = null; await flushShare(); }
function renderShareState() {
  const el = $('#shareState'); if (!el) return;
  const sb = sbClient();
  el.textContent = !sb ? '☁ 공유 서버: 로그인 전(이 기기에 저장)' : SHARE.ok === false ? '☁ 공유 서버: 준비 전(SQL 실행 필요) · 이 기기 저장' : SHARE.ok ? `☁ 공유 서버 연결됨${SHARE.last ? ' · ' + SHARE.last.slice(11, 16) + ' 저장' : ''}` : '☁ 공유 서버: 확인 중';
}

/* =====================================================================
 * 커스터마이징 연동 — 기존 사업장 시스템(차량번호인식 LPR · 출입카드 · 방문예약)과
 *  ① 엑셀/CSV 가져오기(열 맞춤 저장)  ② 내보내기(그 시스템 형식)  ③ 웹훅(입 · 퇴실 즉시 전송)  ④ 서버 수신(ac_ingest)
 * ===================================================================== */
const FIELDS = [
  ['d', '방문일자'], ['tin', '입실 시각'], ['tout', '퇴실 시각'], ['kind', '구분(방문자/차량)'], ['name', '성명'], ['phone', '연락처'], ['co', '소속 회사'],
  ['plate', '차량번호'], ['vtype', '차종'], ['dept', '방문부서'], ['host', '피방문자'], ['purpose', '방문 목적(업무)'], ['gate', '출입구'], ['badge', '출입증 번호'], ['items', '반입 물품'], ['note', '비고']
];
const GUESS = { d: /일자|날짜|date|입문일|방문일/i, tin: /입실|입문|입차|in.?time|진입|입장/i, tout: /퇴실|퇴문|출차|out.?time|진출|퇴장/i, kind: /구분|type|종류/i, name: /성명|이름|name|방문자명|운전자/i, phone: /연락|전화|휴대|phone|tel/i, co: /회사|소속|업체|company|거래처/i, plate: /차량|번호판|plate|car/i, vtype: /차종|vehicle/i, dept: /부서|dept|방문처/i, host: /피방문|담당|면담|host/i, purpose: /목적|용무|업무|purpose/i, gate: /출입구|게이트|gate|문/i, badge: /출입증|카드|badge/i, items: /물품|반입/i, note: /비고|메모|note|remark/i };
function guessMap(heads) { const m = {}; heads.forEach((h, i) => { for (const [k, re] of Object.entries(GUESS)) if (!m[k] && re.test(h)) { m[k] = i; break; } }); return m; }
function cellStr(v) { if (v == null) return ''; if (v instanceof Date) return isoD(v) + ' ' + pad(v.getHours()) + ':' + pad(v.getMinutes()); if (typeof v === 'object' && v.text) return String(v.text); if (typeof v === 'object' && v.result != null) return String(v.result); return String(v).trim(); }
function normDate(s) { s = cellStr(s); const m = /(\d{4})[.\-/년\s]*(\d{1,2})[.\-/월\s]*(\d{1,2})/.exec(s); return m ? `${m[1]}-${pad(m[2])}-${pad(m[3])}` : ''; }
function normTime(s) { s = cellStr(s); const m = /(\d{1,2}):(\d{2})/.exec(s); return m ? `${pad(m[1])}:${m[2]}` : ''; }
/* 가져온 행 → 출입 기록 (같은 사람 · 차량은 기존 DATA에 이어 붙임) */
function importRows(rows, map, srcName) {
  let n = 0, skip = 0;
  rows.forEach(r => {
    const g = k => map[k] != null && map[k] !== '' ? cellStr(r[map[k]]) : '';
    const d = normDate(g('d')) || normDate(g('tin')) || today(), tin = normTime(g('tin')) || '00:00', tout = normTime(g('tout'));
    const name = g('name'), plate = g('plate'), co = g('co') || '(미기재)';
    if (!name && !plate) { skip++; return; }
    const key = `${d}|${tin}|${name}|${plateNorm(plate)}`;
    if (Object.values(AC.visits).some(v => `${v.d}|${v.tin}|${v.name || ''}|${plateNorm(v.plate)}` === key)) { skip++; return; }
    let pid = '', cid = '';
    if (name) { const same = findPeopleByName(name).find(p => samePhone(p.phone, g('phone')) || (!g('phone') && norm(p.company) === norm(co))); pid = upsertPerson({ name, phone: g('phone'), co }, same && same.id).id; }
    if (plate) cid = upsertCar({ plate, vtype: g('vtype'), co, pid }).id;
    const v = { id: 'a_' + uid(), d, tin, tout, out: !!tout, outD: tout ? d : '', kind: cid && !pid ? 'v' : 'p', pid, cid, name, phone: g('phone'), plate: plate ? plateFmt(plate) : '', vtype: g('vtype'), co, dept: g('dept'), host: g('host'), purpose: g('purpose'), gate: g('gate'), badge: g('badge'), items: g('items'), note: g('note'), site: AC.cfg.site.key || '', siteName: siteName(), br: AC.cfg.site.br || '', guard: UI.manager ? UI.manager.name : '', src: 'import:' + (srcName || ''), at: new Date().toISOString() };
    AC.visits[v.id] = v; queueShare('visits', v.id); if (pid) queueShare('people', pid); if (cid) queueShare('cars', cid); n++;
  });
  saveAC(); return { n, skip };
}
function exportRow(v, mapOut) { const o = {}; (mapOut || FIELDS).forEach(([k, h]) => { o[h] = k === 'kind' ? (v.cid && !v.pid ? '차량' : v.cid ? '방문자+차량' : '방문자') : k === 'phone' ? maskPhone(v.phone) : v[k] || ''; }); return o; }
async function fireHook(ev, v) {
  const H = AC.cfg.hook || {}; if (!H.on || !H.url) return;
  const body = { event: ev === 'in' ? 'check_in' : 'check_out', site: siteName(), id: v.id, date: v.d, time_in: v.tin, time_out: v.tout || null, name: v.name || null, company: v.co || null, plate: v.plate || null, dept: v.dept || null, purpose: v.purpose || null, gate: v.gate || null, badge: v.badge || null, phone_last4: String(v.phone || '').replace(/\D/g, '').slice(-4) || null, source: APP.code };
  try { await fetch(H.url, { method: 'POST', mode: 'cors', referrerPolicy: 'no-referrer', credentials: 'omit', headers: Object.assign({ 'Content-Type': 'application/json' }, SECRET.hookToken ? { Authorization: 'Bearer ' + SECRET.hookToken } : {}), body: JSON.stringify(body) }); H.last = new Date().toISOString(); H.err = ''; }
  catch (e) { H.err = String(e.message || e); }
}

/* =====================================================================
 * 개인정보 — 보유기간 지난 기록 파기 · 예시 자료
 * ===================================================================== */
function purgeOld(years) {
  const lim = isoD(new Date(kstNow().getFullYear() - years, kstNow().getMonth(), kstNow().getDate())); let n = 0;
  Object.values(AC.visits).forEach(v => { if (v.d < lim) { delete AC.visits[v.id]; queueShare('visits', v.id, true); n++; } });
  const usedP = new Set(Object.values(AC.visits).map(v => v.pid)), usedC = new Set(Object.values(AC.visits).map(v => v.cid));
  Object.keys(AC.people).forEach(k => { if (!usedP.has(k) && !(AC.people[k].ban && AC.people[k].ban.on)) { delete AC.people[k]; queueShare('people', k, true); } });
  Object.keys(AC.cars).forEach(k => { if (!usedC.has(k) && !(AC.cars[k].ban && AC.cars[k].ban.on)) { delete AC.cars[k]; queueShare('cars', k, true); } });
  saveAC(); return n;
}
/* 예시 자료 — 모두 가상의 회사 · 사람 · 차량입니다(실제 방문자 정보 아님) */
function loadSample() {
  const COS = [['(주)한빛기계', '기계 설비 제조'], ['대성물류(주)', '물류 · 운송'], ['미래환경산업', '폐기물 수집 · 운반'], ['(주)세진엔지니어링', '설비 공사 · 정비'], ['그린푸드시스템', '단체급식'], ['우리소방기술', '소방시설 점검'], ['한결전기(주)', '전기 공사'], ['코리아택배 울산', '택배'], ['(주)동해정밀', '부품 제조'], ['새봄인력개발', '인력 파견 면접']];
  const P = [['김민수', 0, '대리'], ['이서준', 1, '기사'], ['박지훈', 2, '반장'], ['최현우', 3, '과장'], ['정우진', 4, '팀장'], ['강도윤', 5, '주임'], ['조성민', 6, '기사'], ['윤재원', 7, '배송원'], ['장하늘', 8, '차장'], ['임수빈', 9, '지원자'], ['김민수', 3, '사원'], ['한지민', 0, '과장'], ['오세훈', 1, '기사'], ['서다은', 4, '조리사'], ['신동욱', 6, '소장']];
  const CARS = [['12가3456', '화물(1톤 이하)', 1], ['34나5678', '승용', 0], ['801다2345', '화물(1톤 초과)', 2], ['56라7890', '승합', 3], ['123마4567', '탱크로리', 1], ['78바1234', '택배', 7], ['90사5678', '승용', 8], ['12아9012', '화물(1톤 이하)', 6], ['345자6789', '승용', 5], ['67차3456', '화물(1톤 이하)', 4]];
  const DEP = AC.cfg.depts, PUR = AC.cfg.purposes, s0 = kstNow();
  const pids = P.map((p, i) => { const id = 'p_s' + i; AC.people[id] = { id, name: p[0], phone: '0105555' + pad(10 + i) + pad(i * 3 % 100), company: COS[p[1]][0], title: p[2], created: s0.toISOString(), sample: true, coHist: [] }; ensureCo(COS[p[1]][0]); return id; });
  // 동명이인(김민수 2명) · 소속 변경(최현우: 세진엔지니어링 → 한결전기)
  AC.people.p_s3.coHist = [{ co: '(주)세진엔지니어링', to: isoD(addDays(s0, -40)) }]; AC.people.p_s3.company = '한결전기(주)';
  COS.forEach(c => { const o = ensureCo(c[0]); o.info = o.info || { ind: c[1], addr: '울산광역시 (예시 주소)', tel: '052-000-0000', desc: '예시 회사입니다(가상).', src: ['예시 자료'], sample: true }; o.sample = true; });
  const cids = CARS.map((c, i) => { const id = plateKey(c[0]); AC.cars[id] = { id, plate: plateFmt(c[0]), type: c[1], model: ['포터2', '쏘나타', '마이티', '스타리아', '엑시언트', '봉고3', '그랜저', '포터2', 'K5', '봉고3'][i], color: ['흰색', '검정', '파랑', '흰색', '은색', '흰색', '검정', '파랑', '회색', '흰색'][i], company: COS[c[2]][0], driver: pids[[1, 0, 2, 3, 12, 7, 8, 14, 5, 4][i]], created: s0.toISOString(), sample: true, coHist: [] }; return id; });
  let k = 0;
  for (let back = 59; back >= 0; back--) {
    const d = addDays(s0, -back); if (d.getDay() === 0 && back % 3) continue;
    const n = 4 + ((back * 7) % 6);
    for (let j = 0; j < n; j++) {
      const pi = (back * 3 + j * 5) % pids.length, own = cids.filter(c => norm(AC.cars[c].company) === norm(AC.people[pids[pi]].company)), withCar = (j + back) % 3 === 0 && own.length, car = withCar ? own[(back + j) % own.length] : '';
      const p = AC.people[pids[pi]]; let co = p.company; if (pi === 3 && back > 40) co = '(주)세진엔지니어링';
      const hh = 8 + ((j * 2 + back) % 9), mm = (j * 17 + back * 11) % 60, stay = 20 + ((j * 37 + back) % 180);
      const tout = `${pad(Math.min(23, hh + Math.floor((mm + stay) / 60)))}:${pad((mm + stay) % 60)}`;
      const vehOnly = withCar && j % 4 === 0;
      const id = 'a_s' + (k++);
      AC.visits[id] = { id, d: isoD(d), tin: `${pad(hh)}:${pad(mm)}`, tout: back === 0 && j > n - 3 ? '' : tout, out: !(back === 0 && j > n - 3), kind: vehOnly ? 'v' : 'p', pid: vehOnly ? '' : p.id, cid: car, name: vehOnly ? '' : p.name, phone: vehOnly ? '' : p.phone, plate: car ? AC.cars[car].plate : '', vtype: car ? AC.cars[car].type : '', co: car && vehOnly ? AC.cars[car].company : co, dept: DEP[(pi + j) % DEP.length], host: ['박과장', '김대리', '이팀장', '정주임'][j % 4], purpose: vehOnly ? ['납품', '택배 · 배송'][j % 2] : PUR[(pi + back) % PUR.length], gate: AC.cfg.gates[(j + back) % AC.cfg.gates.length], badge: 'V-' + pad((j + 1) % 100), items: j % 5 === 0 ? '노트북 1대' : '', note: '', site: 'sample', siteName: '예시 사업장', guard: UI.manager ? UI.manager.name : '예시 근무자', src: 'sample', sample: true, at: d.toISOString() };
    }
  }
  AC.people.p_s9.ban = { on: true, reason: '예시 — 보안서약 미이행(출입 제한)', at: isoD(addDays(s0, -10)) };
  Object.values(AC.visits).forEach(v => { if (v.sample && v.pid === 'p_s9' && v.d >= AC.people.p_s9.ban.at) { v.banHit = true; v.note = '출입제한 대상 — 총무팀장 확인 후 입실'; } });
  saveAC(); return k;
}
function clearSample() { ['people', 'cars', 'cos', 'visits'].forEach(k => Object.keys(AC[k]).forEach(id => { if (AC[k][id].sample) delete AC[k][id]; })); saveAC(); }
