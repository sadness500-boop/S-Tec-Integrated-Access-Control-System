/* =====================================================================
 * 화면 — 출입 등록 · 출입 현황 · DATA 조회·관리 · 회사 정보 · 출력 · 설정·연동
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const V = { page: 0, sel: -1, ent: { pid: '', cpid: '', cid: '' }, coSel: '', listMode: 'today', sig: '', sigPx: 1860 };
const opt = (arr, sel, all) => (all != null ? `<option value="">${esc(all)}</option>` : '') + arr.map(x => `<option value="${esc(x)}" ${x === sel ? 'selected' : ''}>${esc(x)}</option>`).join('');
const dl = (id, arr) => `<datalist id="${id}">${arr.map(x => `<option value="${esc(x)}">`).join('')}</datalist>`;
function allDepts() { const s = new Set(AC.cfg.depts); Object.values(AC.visits).forEach(v => v.dept && s.add(v.dept)); return [...s].sort((a, b) => a.localeCompare(b, 'ko')); }
function allCos() { const s = new Map(); Object.values(AC.cos).forEach(c => s.set(norm(c.name), c.name)); Object.values(AC.visits).forEach(v => v.co && !s.has(norm(v.co)) && s.set(norm(v.co), v.co)); return [...s.values()].sort((a, b) => a.localeCompare(b, 'ko')); }
function allPurposes() { const s = new Set(AC.cfg.purposes); Object.values(AC.visits).forEach(v => v.purpose && s.add(v.purpose)); return [...s]; }
const coLink = n => n ? `<button class="lnkb" data-co="${esc(n)}" title="회사 기본정보 보기">${esc(n)}</button>` : '-';
const pLink = v => v.pid && AC.people[v.pid] ? `<button class="lnkb" data-pid="${esc(v.pid)}">${esc(v.name || AC.people[v.pid].name)}</button>` : esc(v.name || '');
const cLink = v => v.cid ? `<button class="plate" data-cid="${esc(v.cid)}" style="cursor:pointer">${esc(v.plate || (AC.cars[v.cid] || {}).plate || '')}</button>` : '';
const kndOf = v => v.pid && v.cid ? '<span class="knd pv" title="방문자 + 차량">👤</span>' : v.cid ? '<span class="knd v" title="방문차량">🚗</span>' : '<span class="knd p" title="방문자">👤</span>';
function bindLinks(root) {
  root.querySelectorAll('[data-co]').forEach(b => b.onclick = e => { e.stopPropagation(); openCo(b.dataset.co); });
  root.querySelectorAll('[data-pid]').forEach(b => b.onclick = e => { e.stopPropagation(); openPerson(b.dataset.pid); });
  root.querySelectorAll('[data-cid]').forEach(b => b.onclick = e => { e.stopPropagation(); openCar(b.dataset.cid); });
  root.querySelectorAll('[data-out]').forEach(b => b.onclick = e => { e.stopPropagation(); checkOut(b.dataset.out); toast('퇴실 처리했습니다'); renderAll(); });
  root.querySelectorAll('[data-vis]').forEach(b => b.onclick = e => { e.stopPropagation(); openVisit(b.dataset.vis); });
}

/* ---------- 탭 ---------- */
function setTab(t) {
  UI.tab = t; saveUI();
  $$('.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  $$('.pane').forEach(p => p.classList.toggle('on', p.id === 'p-' + t));
  ({ entry: renderEntry, now: renderNow, data: renderData, co: renderCoTab, report: renderReport, set: renderSet }[t] || renderEntry)();
}
function renderAll() { renderHeroStats(); renderSiteCard(); setTab(UI.tab || 'entry'); }
function renderHeroStats() {
  const td = Object.values(AC.visits).filter(v => v.d === today());
  $('#stP').textContent = nf(td.filter(v => v.pid).length); $('#stV').textContent = nf(td.filter(v => v.cid).length);
  const ins = inside(); $('#stIn').textContent = nf(ins.length); $('#stIn2').textContent = ins.length ? `건 · 차량 ${ins.filter(v => v.cid).length}` : '건';
  $('#stAll').textContent = nf(Object.keys(AC.visits).length); $('#stAll2').textContent = `건 · ${nf(Object.keys(AC.people).length)}명 · ${nf(Object.keys(AC.cars).length)}대`;
}
function renderSiteCard() { $('#siteName').textContent = AC.cfg.site && AC.cfg.site.name ? AC.cfg.site.name : '미지정'; }

/* =====================================================================
 * 통합 검색 (메인 화면)
 * ===================================================================== */
function hl(text, q) {
  const t = String(text || ''); q = String(q || '').trim(); if (!q) return esc(t);
  const chars = [...t], nq = [...norm(q)];
  for (let i = 0; i < chars.length; i++) {
    let j = 0, k = i, idx = [];
    while (k < chars.length && j < nq.length) { const a = chars[k]; if (/[\s·.\-_/()㈜]/.test(a)) { k++; continue; } const b = nq[j]; if (isCho(b) ? (choOf(a) === b || a === b) : a.toLowerCase() === b) { idx.push(k); j++; k++; } else break; }
    if (j === nq.length) return chars.map((c, x) => idx.includes(x) ? `<mark>${esc(c)}</mark>` : esc(c)).join('');
  }
  return esc(t);
}
function renderSearch() {
  const q = $('#uq').value, box = $('#sres');
  if (!q.trim()) { box.classList.add('hidden'); return; }
  const R = search(q, 12), items = [];
  const vcnt = id => R.cnt[id] || 0;
  let h = '';
  if (R.people.length) { h += `<h4>👤 방문자 ${R.people.length}${R.people.length >= 12 ? '+' : ''}</h4>`; R.people.forEach(p => { const lv = visitsOfPerson(p.id)[0]; items.push(['p', p.id]); h += `<button class="it" data-k="p" data-id="${esc(p.id)}"><span class="av p">${esc(p.name[0] || '?')}</span><span><b>${hl(p.name, q)}</b>${p.ban && p.ban.on ? ' <span class="tag" style="--c:#C53A3A">출입제한</span>' : ''}<small>${hl(p.company, q)}${p.title ? ' · ' + esc(p.title) : ''} · ${esc(maskPhone(p.phone) || '연락처 없음')}</small></span><span class="n">${vcnt(p.id)}회${lv ? '<br>' + fmtDs(lv.d) : ''}</span></button>`; }); }
  if (R.cars.length) { h += `<h4>🚗 방문차량 ${R.cars.length}</h4>`; R.cars.forEach(c => { const lv = visitsOfCar(c.id)[0], dr = c.driver && AC.people[c.driver]; items.push(['v', c.id]); h += `<button class="it" data-k="v" data-id="${esc(c.id)}"><span class="av v">🚗</span><span><span class="plate">${esc(c.plate)}</span>${c.ban && c.ban.on ? ' <span class="tag" style="--c:#C53A3A">출입제한</span>' : ''}<small>${hl(c.company, q)} · ${esc(c.type || '')} ${esc(c.model || '')}${dr ? ' · 운전 ' + esc(dr.name) : ''}</small></span><span class="n">${vcnt(c.id)}회${lv ? '<br>' + fmtDs(lv.d) : ''}</span></button>`; }); }
  if (R.cos.length) { h += `<h4>🏢 회사 ${R.cos.length}</h4>`; R.cos.forEach(c => { items.push(['c', c.name]); h += `<button class="it" data-k="c" data-id="${esc(c.name)}"><span class="av c">🏢</span><span><b>${hl(c.name, q)}</b><small>방문자 ${peopleOfCo(c.name).length}명 · 차량 ${carsOfCo(c.name).length}대 · 출입 ${visitsOfCo(c.name).length}건</small></span></button>`; }); }
  if (R.depts.length) { h += `<h4>🏷 방문부서</h4>`; R.depts.slice(0, 6).forEach(d => { items.push(['d', d.n]); h += `<button class="it" data-k="d" data-id="${esc(d.n)}"><span class="av d">🏷</span><span><b>${hl(d.n, q)}</b><small>방문 ${nf(d.c)}건 — 누르면 DATA 조회</small></span></button>`; }); }
  if (R.purposes.length) { h += `<h4>📌 업무(방문 목적)</h4>`; R.purposes.slice(0, 6).forEach(d => { items.push(['u', d.n]); h += `<button class="it" data-k="u" data-id="${esc(d.n)}"><span class="av d">📌</span><span><b>${hl(d.n, q)}</b><small>${nf(d.c)}건 — 누르면 DATA 조회</small></span></button>`; }); }
  if (!h) h = `<div class="empty">「${esc(q)}」 검색 결과가 없습니다.<br><span class="hint">${isPlateQuery(q) ? '차량번호는 숫자 두 자리부터 찾습니다(앞자리 · 뒷자리 모두).' : '초성(ㅎㄱㄷ)이나 일부 글자로도 찾을 수 있습니다.'}</span><div class="row" style="justify-content:center;margin-top:8px"><button class="btn sm pri" id="srNew">🚪 새로 출입 등록</button></div></div>`;
  box.innerHTML = h; box.classList.remove('hidden'); V.sel = -1; V.items = items;
  box.querySelectorAll('.it').forEach(b => b.onclick = () => pickSearch(b.dataset.k, b.dataset.id));
  const nw = box.querySelector('#srNew'); if (nw) nw.onclick = () => { const qq = $('#uq').value.trim(); closeSearch(); setTab('entry'); if (isPlateQuery(qq)) $('#cPlate').value = qq; else $('#vName').value = qq; $('.tabs').scrollIntoView({ behavior: 'smooth' }); };
}
function closeSearch() { $('#sres').classList.add('hidden'); }
function pickSearch(k, id) {
  closeSearch();
  if (k === 'p') openPerson(id); else if (k === 'v') openCar(id); else if (k === 'c') openCo(id);
  else { UI.F = Object.assign(rangeOf('a'), { per: 'a' }); if (k === 'd') UI.F.dept = id; else UI.F.purpose = id; UI.view = 'log'; saveUI(); setTab('data'); $('.tabs').scrollIntoView({ behavior: 'smooth' }); }
}
function bindSearch() {
  const inp = $('#uq'); let t;
  inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(renderSearch, 90); });
  inp.addEventListener('focus', () => { if (inp.value.trim()) renderSearch(); });
  inp.addEventListener('keydown', e => {
    const its = $$('#sres .it'); if (!its.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); V.sel = Math.max(0, Math.min(its.length - 1, V.sel + (e.key === 'ArrowDown' ? 1 : -1))); its.forEach((b, i) => b.classList.toggle('on', i === V.sel)); its[V.sel].scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter') { e.preventDefault(); (its[Math.max(0, V.sel)]).click(); }
    if (e.key === 'Escape') closeSearch();
  });
  $('#uqClr').onclick = () => { inp.value = ''; closeSearch(); inp.focus(); };
  document.addEventListener('click', e => { if (!e.target.closest('#usearch')) closeSearch(); });
}

/* =====================================================================
 * 🚪 출입 등록 — 방문자 | 방문차량 입력을 나누고, 결과는 한 목록에
 * ===================================================================== */
function renderEntry() {
  const c = AC.cfg, req = c.required || {};
  const s = !AC.cfg.site.name ? `<div class="banbox" style="background:#FFF4E5;color:#8A4B00;border-color:#F3D3A1">⚠ 운영 사업장이 지정되지 않았습니다 — 상단 「운영 사업장」 카드나 「⚙ 설정 · 연동」에서 이 기기가 쓰이는 사업장을 고르세요.</div>` : '';
  $('#p-entry').innerHTML = `${s}<div class="entry2">
  <section class="card fcard" aria-label="방문자 입력"><div class="ftop"><span class="big">👤</span><div><b>방문자 입력</b><small>이름을 치면 기존 방문자(동명이인 · 소속)를 보여 줍니다 — 고르면 자동 입력</small></div></div>
   <div class="body"><div id="vBan"></div><div class="fg">
    <label>${esc(L('name'))} <i>*</i><input id="vName" autocomplete="off" placeholder="예: 홍길동 (초성 ㅎㄱㄷ로 찾기)"><div class="sug hidden" id="vNameSug"></div></label>
    <label>연락처 ${req.phone ? '<i>*</i>' : ''}<input id="vPhone" inputmode="tel" autocomplete="off" placeholder="동명이인 구분에 사용"></label>
    <label>${esc(L('co'))} <i>*</i><input id="vCo" autocomplete="off" placeholder="예: (주)한빛기계"><div class="sug hidden" id="vCoSug"></div></label>
    <label>직위 · 직책<input id="vPos" autocomplete="off"></label>
    <label>${esc(L('dept'))} <i>*</i><input id="vDept" list="dlDept" autocomplete="off"></label>
    <label>${esc(L('host'))} ${req.host ? '<i>*</i>' : ''}<input id="vHost" autocomplete="off" placeholder="면담자 이름"></label>
    <label>${esc(L('purpose'))} <i>*</i><input id="vPurp" list="dlPurp" autocomplete="off"></label>
    <label>${esc(L('gate'))}<select id="vGate">${opt(c.gates, c.gates[0])}</select></label>
    <label>${esc(L('badge'))} ${req.badge ? '<i>*</i>' : ''}<input id="vBadge" autocomplete="off" placeholder="예: V-01"></label>
    <label>동반 인원<input id="vCnt" type="number" min="0" value="0"></label>
    <label>함께 들어오는 차량번호<input id="vPlate" autocomplete="off" placeholder="있으면 입력 — 차량 DATA에도 연결"><div class="sug hidden" id="vPlateSug"></div></label>
    <label>${esc(L('items'))}<input id="vItems" autocomplete="off" placeholder="노트북 1대 등"></label>
    <label>입실 일자<input id="vD" type="date" value="${today()}"></label>
    <label>입실 시각<input id="vTin" type="time" value="${nowHM()}"></label>
    <label class="full">비고<input id="vNote" autocomplete="off"></label>
    <div class="full"><label class="ck"><input type="checkbox" id="vIdChk"> 신분 확인</label><label class="ck"><input type="checkbox" id="vPledge"> 보안서약 · 개인정보 수집 동의</label></div>
   </div><div class="row" style="margin-top:12px;justify-content:flex-end"><button class="btn" id="vReset">지우기</button><button class="btn pri" id="vSave">👤 방문자 입실 등록</button></div>
   <div class="priv">🔒 연락처는 목록 · 출력물에서 가려 표시합니다(설정에서 변경). 수집 항목은 출입관리 목적에만 쓰이며 보유기간(${AC.cfg.retainY}년)이 지나면 파기합니다.</div></div></section>
  <section class="card fcard veh" aria-label="방문차량 입력"><div class="ftop"><span class="big">🚗</span><div><b>방문차량 입력</b><small>번호판 숫자 두 자리부터 기존 차량을 찾아 소속 · 차종 · 운전자를 채워 줍니다</small></div></div>
   <div class="body"><div id="cBan"></div><div class="fg">
    <label>${esc(L('plate'))} <i>*</i><input id="cPlate" autocomplete="off" placeholder="예: 12가3456 (숫자 2자리부터 검색)"><div class="sug hidden" id="cPlateSug"></div></label>
    <label>차종<select id="cType">${opt(c.vtypes, '', '선택')}</select></label>
    <label>${esc(L('co'))} <i>*</i><input id="cCo" autocomplete="off"><div class="sug hidden" id="cCoSug"></div></label>
    <label>차량 모델 · 색상<input id="cModel" autocomplete="off" placeholder="포터2 흰색"></label>
    <label>운전자 이름<input id="cDriver" autocomplete="off" placeholder="있으면 방문자 DATA에도 연결"><div class="sug hidden" id="cDriverSug"></div></label>
    <label>운전자 연락처<input id="cPhone" inputmode="tel" autocomplete="off"></label>
    <label>${esc(L('dept'))} <i>*</i><input id="cDept" list="dlDept" autocomplete="off"></label>
    <label>${esc(L('host'))}<input id="cHost" autocomplete="off"></label>
    <label>${esc(L('purpose'))} <i>*</i><input id="cPurp" list="dlPurp" autocomplete="off"></label>
    <label>${esc(L('gate'))}<select id="cGate">${opt(c.gates, c.gates[0])}</select></label>
    <label>적재물 · 반입 물품<input id="cItems" autocomplete="off" placeholder="원자재 2톤, 공구함 등"></label>
    <label>주차 위치 · 계근<input id="cPark" autocomplete="off" placeholder="B주차장 / 입차 12.4t"></label>
    <label>입차 일자<input id="cD" type="date" value="${today()}"></label>
    <label>입차 시각<input id="cTin" type="time" value="${nowHM()}"></label>
    <label class="full">비고<input id="cNote" autocomplete="off"></label>
   </div><div class="row" style="margin-top:12px;justify-content:flex-end"><button class="btn" id="cReset">지우기</button><button class="btn pri" id="cSave">🚗 차량 입차 등록</button></div></div></section>
  </div>${dl('dlDept', allDepts())}${dl('dlPurp', allPurposes())}
  <section class="card" style="--c:var(--gr)"><h2>📌 통합 출입 현황 — 방문자 · 방문차량 한곳에<span class="r"><span class="views" style="margin:0" id="lmode">${[['today', '오늘 전체'], ['in', '구내 체류'], ['p', '오늘 방문자'], ['v', '오늘 차량']].map(([k, n]) => `<button data-lm="${k}" aria-pressed="${V.listMode === k}">${n}</button>`).join('')}</span></span></h2><div class="body" id="todayList"></div></section>`;
  bindEntry(); renderTodayList();
}
function listRows(list, opt2 = {}) {
  if (!list.length) return `<div class="empty">${opt2.empty || '기록이 없습니다.'}</div>`;
  return `<div class="tblw"><table class="t"><thead><tr><th></th>${opt2.date ? '<th>일자</th>' : ''}<th>입실</th><th>퇴실</th><th>성명</th><th>차량</th><th>${esc(L('co'))}</th><th>${esc(L('dept'))}</th><th>${esc(L('purpose'))}</th><th>${esc(L('host'))}</th><th>출입증</th><th>상태</th><th></th></tr></thead><tbody>${list.map(v => `<tr class="${v.banHit ? 'ban' : ''}" data-vis="${esc(v.id)}" style="cursor:pointer"><td class="c">${kndOf(v)}</td>${opt2.date ? `<td class="c">${fmtDs(v.d).slice(2)}</td>` : ''}<td class="c">${esc(v.tin)}</td><td class="c">${esc(v.tout || '')}</td><td>${pLink(v)}</td><td>${cLink(v)}</td><td>${coLink(v.co)}</td><td>${esc(v.dept || '')}</td><td>${esc(v.purpose || '')}</td><td>${esc(v.host || '')}</td><td class="c">${esc(v.badge || '')}</td><td class="c">${v.out ? '<span class="tag st-out">퇴실</span>' : `<span class="tag st-in">구내 ${stayTxt(stayMin(v))}</span>`}</td><td class="c">${v.out ? '' : `<button class="btn sm" data-out="${esc(v.id)}">퇴실</button>`}</td></tr>`).join('')}</tbody></table></div>`;
}
function renderTodayList() {
  const el = $('#todayList'); if (!el) return;
  const td = Object.values(AC.visits).filter(v => v.d === today()).sort(byTimeDesc);
  const L2 = { today: td, in: inside(), p: td.filter(v => v.pid), v: td.filter(v => v.cid) }[V.listMode] || td;
  el.innerHTML = `<div class="row" style="margin-bottom:8px;font-size:12.5px;color:var(--mute)">오늘 ${fmtD(today())} · 방문자 ${td.filter(v => v.pid).length}명 · 차량 ${td.filter(v => v.cid).length}대 · 구내 ${inside().length}건 — 행을 누르면 상세, 이름 · 차량번호 · 회사를 누르면 누적 DATA</div>` + listRows(L2.slice(0, 200), { empty: '오늘 등록된 출입이 없습니다.', date: V.listMode === 'in' });
  bindLinks(el);
  $$('#lmode [data-lm]').forEach(b => b.onclick = () => { V.listMode = b.dataset.lm; $$('#lmode [data-lm]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); renderTodayList(); });
}
/* 입력 칸 아래 제안 목록 */
function suggest(inp, box, getter, pick) {
  const show = () => { const its = getter(inp.value.trim()); if (!its.length || !inp.value.trim()) { box.classList.add('hidden'); return; } box.innerHTML = its.slice(0, 8).map((x, i) => `<button type="button" data-i="${i}">${x.html}</button>`).join(''); box.classList.remove('hidden'); box.querySelectorAll('button').forEach(b => b.onmousedown = e => { e.preventDefault(); pick(its[+b.dataset.i]); box.classList.add('hidden'); }); };
  inp.addEventListener('input', show); inp.addEventListener('focus', show); inp.addEventListener('blur', () => setTimeout(() => box.classList.add('hidden'), 150));
}
const peopleSug = q => q ? Object.values(AC.people).filter(p => hanMatch(p.name, q)).slice(0, 8).map(p => { const lv = visitsOfPerson(p.id)[0]; return { p, html: `<span class="knd p">👤</span>${esc(p.name)}${p.ban && p.ban.on ? ' ⛔' : ''}<small>${esc(p.company)} · ${esc(maskPhone(p.phone) || '-')}${lv ? '<br>최근 ' + fmtDs(lv.d) + ' ' + esc(lv.dept || '') : ''}</small>` }; }) : [];
const coSug = q => q ? allCos().filter(n => hanMatch(n, q)).slice(0, 8).map(n => ({ n, html: `🏢 ${esc(n)}<small>방문자 ${peopleOfCo(n).length} · 차량 ${carsOfCo(n).length}</small>` })) : [];
const carSug = q => q && (isPlateQuery(q) || q.length >= 2) ? Object.values(AC.cars).filter(c => plateMatch(c.plate, q) || plateNorm(c.plate).includes(plateNorm(q))).slice(0, 8).map(c => ({ c, html: `<span class="plate">${esc(c.plate)}</span>${c.ban && c.ban.on ? ' ⛔' : ''}<small>${esc(c.company)} · ${esc(c.type || '')} ${esc(c.model || '')}</small>` })) : [];
function showBan(el, o) { el.innerHTML = o && o.ban && o.ban.on ? `<div class="banbox">⛔ 출입 제한 대상입니다 — ${esc(o.ban.reason || '사유 미기재')} (${esc(o.ban.at || '')}) · 등록하려면 책임자 확인이 필요합니다</div>` : ''; }
function bindEntry() {
  const E = V.ent; E.pid = ''; E.cpid = ''; E.cid = '';
  suggest($('#vName'), $('#vNameSug'), peopleSug, x => { const p = x.p; E.pid = p.id; $('#vName').value = p.name; $('#vPhone').value = phoneFmt(p.phone); $('#vCo').value = p.company; $('#vPos').value = p.title || ''; const lv = visitsOfPerson(p.id)[0]; if (lv) { $('#vDept').value = lv.dept || ''; $('#vHost').value = lv.host || ''; $('#vPurp').value = lv.purpose || ''; } const car = carsOfPerson(p.id)[0]; if (car) $('#vPlate').placeholder = '최근 차량 ' + car.plate; showBan($('#vBan'), p); });
  $('#vName').addEventListener('input', () => { if (E.pid && AC.people[E.pid] && norm(AC.people[E.pid].name) !== norm($('#vName').value)) { E.pid = ''; $('#vBan').innerHTML = ''; } });
  suggest($('#vCo'), $('#vCoSug'), coSug, x => $('#vCo').value = x.n);
  suggest($('#cCo'), $('#cCoSug'), coSug, x => $('#cCo').value = x.n);
  suggest($('#vPlate'), $('#vPlateSug'), carSug, x => $('#vPlate').value = x.c.plate);
  suggest($('#cPlate'), $('#cPlateSug'), carSug, x => { const c = x.c; E.cid = c.id; $('#cPlate').value = c.plate; $('#cType').value = c.type || ''; $('#cCo').value = c.company; $('#cModel').value = [c.model, c.color].filter(Boolean).join(' '); const dr = c.driver && AC.people[c.driver]; if (dr) { E.cpid = dr.id; $('#cDriver').value = dr.name; $('#cPhone').value = phoneFmt(dr.phone); } const lv = visitsOfCar(c.id)[0]; if (lv) { $('#cDept').value = lv.dept || ''; $('#cPurp').value = lv.purpose || ''; $('#cHost').value = lv.host || ''; } showBan($('#cBan'), c); });
  $('#cPlate').addEventListener('input', () => { E.cid = ''; $('#cBan').innerHTML = ''; });
  suggest($('#cDriver'), $('#cDriverSug'), peopleSug, x => { E.cpid = x.p.id; $('#cDriver').value = x.p.name; $('#cPhone').value = phoneFmt(x.p.phone); if (!$('#cCo').value) $('#cCo').value = x.p.company; });
  $('#cDriver').addEventListener('input', () => { E.cpid = ''; });
  $('#vReset').onclick = () => renderEntry(); $('#cReset').onclick = () => renderEntry();
  $('#vSave').onclick = saveVisitor; $('#cSave').onclick = saveVehicle;
}
/* 동명이인 확인 — 같은 이름이 있으면 고르게 함 */
function resolvePerson(name, phone, co, chosen) {
  return new Promise(res => {
    if (chosen) return res(chosen);
    const same = findPeopleByName(name);
    const byPhone = same.find(p => samePhone(p.phone, phone)); if (byPhone) return res(byPhone.id);
    if (!same.length) return res('');
    if (!phone) { const byCo = same.filter(p => norm(p.company) === norm(co)); if (byCo.length === 1 && same.length === 1) return res(byCo[0].id); }
    openModal(`<h2>👥 동명이인 확인 — ${esc(name)}</h2><div class="sub">같은 이름의 방문자가 이미 ${same.length}명 있습니다. 같은 사람이면 고르고, 다른 사람이면 「새 방문자로 등록」을 누르세요. 다른 회사로 옮긴 같은 사람이면 그 사람을 고르면 소속 이력이 이어집니다.</div>
      <div class="tblw"><table class="t" style="min-width:0"><thead><tr><th>성명</th><th>현재 소속</th><th>연락처</th><th>방문</th><th>최근 방문</th><th></th></tr></thead><tbody>${same.map(p => { const vs = visitsOfPerson(p.id); return `<tr><td><b>${esc(p.name)}</b> ${esc(p.title || '')}</td><td>${esc(p.company)}</td><td>${esc(maskPhone(p.phone) || '-')}</td><td class="n">${vs.length}회</td><td class="c">${vs[0] ? fmtDs(vs[0].d) + ' ' + esc(vs[0].dept || '') : '-'}</td><td><button class="btn sm pri" data-same="${esc(p.id)}">이 사람</button></td></tr>`; }).join('')}</tbody></table></div>
      <div class="mrow"><button class="btn" id="mClose">취소</button><button class="btn pri" id="dupNew">➕ 새 방문자로 등록</button></div>`, md => {
      md.querySelector('#mClose').onclick = () => { closeModal(); res(null); };
      md.querySelector('#dupNew').onclick = () => { closeModal(); res(''); };
      md.querySelectorAll('[data-same]').forEach(b => b.onclick = () => { closeModal(); res(b.dataset.same); });
    }, true);
  });
}
function confirmBan(o, what) {
  return new Promise(res => {
    if (!(o && o.ban && o.ban.on)) return res(true);
    openModal(`<h2 style="color:var(--danger)">⛔ 출입 제한 대상</h2><div class="sub">${esc(what)} — 사유: ${esc(o.ban.reason || '-')} (${esc(o.ban.at || '')})</div><p>책임자에게 확인한 뒤 입실시키는 경우에만 「확인 후 등록」을 누르세요. 기록에 「출입제한 확인」이 남습니다.</p>
      <div class="mrow"><button class="btn" id="mClose">등록 취소</button><button class="btn warn" id="banGo">확인 후 등록</button></div>`, md => { md.querySelector('#mClose').onclick = () => { closeModal(); res(false); }; md.querySelector('#banGo').onclick = () => { closeModal(); res(true); }; });
  });
}
const gv = id => ($(id) ? $(id).value.trim() : '');
async function saveVisitor() {
  const f = { name: gv('#vName'), phone: gv('#vPhone').replace(/[^\d-]/g, ''), co: gv('#vCo'), title: gv('#vPos') }, req = AC.cfg.required || {};
  const miss = [[f.name, L('name')], [f.co, L('co')], [gv('#vDept'), L('dept')], [gv('#vPurp'), L('purpose')], [!req.phone || f.phone, '연락처'], [!req.host || gv('#vHost'), L('host')], [!req.badge || gv('#vBadge'), L('badge')]].filter(x => !x[0]).map(x => x[1]);
  if (miss.length) return toast('필수 항목을 넣으세요: ' + miss.join(', '));
  const plate = gv('#vPlate'); if (plate && !plateValid(plate) && !confirmBox(`「${plate}」은 일반 차량번호 형식(12가3456)이 아닙니다. 그대로 저장할까요?`)) return;
  const pidSel = await resolvePerson(f.name, f.phone, f.co, V.ent.pid); if (pidSel === null) return;
  const p = upsertPerson(f, pidSel);
  let car = null; if (plate) { car = upsertCar({ plate, co: f.co, pid: p.id }, AC.cars[plateKey(plate)] ? plateKey(plate) : ''); }
  const okP = await confirmBan(p, `방문자 ${p.name}`); if (!okP) return; const okC = car ? await confirmBan(car, `차량 ${car.plate}`) : true; if (!okC) return;
  const r = addVisit({ kind: 'p', pid: p.id, cid: car ? car.id : '', name: p.name, phone: p.phone, plate: car ? car.plate : '', vtype: car ? car.type : '', co: f.co, title: f.title, dept: gv('#vDept'), host: gv('#vHost'), purpose: gv('#vPurp'), gate: gv('#vGate'), badge: gv('#vBadge'), cnt: +gv('#vCnt') || 0, items: gv('#vItems'), note: gv('#vNote'), idChk: $('#vIdChk').checked, pledge: $('#vPledge').checked, d: gv('#vD') || today(), tin: gv('#vTin') || nowHM(), banHit: !!((p.ban && p.ban.on) || (car && car.ban && car.ban.on)) });
  toast(`${p.name} (${f.co}) 입실 등록 — ${r.tin}`); renderHeroStats(); renderEntry();
}
async function saveVehicle() {
  const plate = gv('#cPlate'), co = gv('#cCo');
  const miss = [[plate, L('plate')], [co, L('co')], [gv('#cDept'), L('dept')], [gv('#cPurp'), L('purpose')]].filter(x => !x[0]).map(x => x[1]);
  if (miss.length) return toast('필수 항목을 넣으세요: ' + miss.join(', '));
  if (!plateValid(plate) && !confirmBox(`「${plate}」은 일반 차량번호 형식(12가3456)이 아닙니다. 그대로 저장할까요?`)) return;
  let p = null; const dn = gv('#cDriver');
  if (dn) { const pid = await resolvePerson(dn, gv('#cPhone'), co, V.ent.cpid); if (pid === null) return; p = upsertPerson({ name: dn, phone: gv('#cPhone').replace(/[^\d-]/g, ''), co }, pid); }
  const [model, ...col] = gv('#cModel').split(/\s+/);
  const car = upsertCar({ plate, vtype: gv('#cType'), model: gv('#cModel'), co, pid: p ? p.id : '' }, V.ent.cid || (AC.cars[plateKey(plate)] ? plateKey(plate) : ''));
  const okC = await confirmBan(car, `차량 ${car.plate}`); if (!okC) return; const okP = p ? await confirmBan(p, `운전자 ${p.name}`) : true; if (!okP) return;
  const r = addVisit({ kind: 'v', pid: p ? p.id : '', cid: car.id, name: p ? p.name : '', phone: p ? p.phone : '', plate: car.plate, vtype: car.type, co, dept: gv('#cDept'), host: gv('#cHost'), purpose: gv('#cPurp'), gate: gv('#cGate'), items: gv('#cItems'), park: gv('#cPark'), note: gv('#cNote'), d: gv('#cD') || today(), tin: gv('#cTin') || nowHM(), banHit: !!((car.ban && car.ban.on) || (p && p.ban && p.ban.on)) });
  toast(`${car.plate} (${co}) 입차 등록 — ${r.tin}`); renderHeroStats(); renderEntry();
}

/* =====================================================================
 * 📋 출입 현황 — 구내 체류 · 오늘 · 최근 7일
 * ===================================================================== */
function renderNow() {
  const ins = inside(), td = Object.values(AC.visits).filter(v => v.d === today());
  const long = ins.filter(v => (stayMin(v) || 0) > 480 || v.d < today());
  const days = [...Array(14)].map((_, i) => isoD(addDays(parseD(today()), i - 13)));
  const cnt = days.map(d => Object.values(AC.visits).filter(v => v.d === d));
  $('#p-now').innerHTML = `<div class="kpis">${[['구내 체류', ins.length, '건', '#E8750A'], ['그중 차량', ins.filter(v => v.cid).length, '대', '#1B7A34'], ['8시간 넘은 체류', long.length, '건', '#C53A3A'], ['오늘 방문자', td.filter(v => v.pid).length, '명', '#0B1F8A'], ['오늘 차량', td.filter(v => v.cid).length, '대', '#1B7A34'], ['오늘 출입제한 확인', td.filter(v => v.banHit).length, '건', '#C53A3A']].map(k => `<div class="kpi" style="--c:${k[3]}"><small>${k[0]}</small><b>${nf(k[1])}</b><span>${k[2]}</span></div>`).join('')}</div>
  <section class="card" style="--c:#E8750A"><h2>🟠 구내 체류 중 (퇴실 처리 전)<span class="r"><button class="btn sm" id="allOut">선택 일괄 퇴실</button></span></h2><div class="body" id="insideList"></div></section>
  <section class="card"><h2>📈 최근 14일 출입 추이</h2><div class="body"><div class="chartbox"><canvas id="cvTrend"></canvas></div></div></section>`;
  $('#insideList').innerHTML = ins.length ? `<div class="tblw"><table class="t"><thead><tr><th><input type="checkbox" id="chkAll"></th><th></th><th>입실일</th><th>입실</th><th>체류</th><th>성명</th><th>차량</th><th>${esc(L('co'))}</th><th>${esc(L('dept'))}</th><th>${esc(L('purpose'))}</th><th>출입증</th><th></th></tr></thead><tbody>${ins.map(v => `<tr class="${(stayMin(v) || 0) > 480 || v.d < today() ? 'ban' : ''}"><td class="c"><input type="checkbox" data-chk="${esc(v.id)}"></td><td class="c">${kndOf(v)}</td><td class="c">${fmtDs(v.d).slice(5)}</td><td class="c">${esc(v.tin)}</td><td class="c">${stayTxt(stayMin(v))}</td><td>${pLink(v)}</td><td>${cLink(v)}</td><td>${coLink(v.co)}</td><td>${esc(v.dept || '')}</td><td>${esc(v.purpose || '')}</td><td class="c">${esc(v.badge || '')}</td><td><button class="btn sm" data-out="${esc(v.id)}">퇴실</button></td></tr>`).join('')}</tbody></table></div><p class="hint">빨간 줄: 8시간 넘게 체류 중이거나 전날 입실 후 퇴실 기록이 없는 출입 — 확인 후 퇴실 처리하세요. 출입증 회수도 함께 확인합니다.</p>` : '<div class="empty">구내에 체류 중인 방문자 · 차량이 없습니다.</div>';
  bindLinks($('#insideList'));
  const ca = $('#chkAll'); if (ca) ca.onchange = () => $$('[data-chk]').forEach(c => c.checked = ca.checked);
  $('#allOut').onclick = () => { const ids = $$('[data-chk]').filter(c => c.checked).map(c => c.dataset.chk); if (!ids.length) return toast('퇴실 처리할 줄을 체크하세요'); ids.forEach(id => checkOut(id)); toast(`${ids.length}건 퇴실 처리했습니다`); renderAll(); };
  V.trend = { lb: days.map(d => d.slice(5).replace('-', '/')), p: cnt.map(l => l.filter(v => v.pid).length), v: cnt.map(l => l.filter(v => v.cid).length) };
  drawCharts();
}
function drawCharts() {
  const cv = $('#cvTrend'); if (cv && V.trend && cv.offsetParent) drawBar(cv, { labels: V.trend.lb, bars: [{ name: '방문자', data: V.trend.p, color: '#2A44D4' }, { name: '차량', data: V.trend.v, color: '#22A04A' }], stacked: true });
  const cd = $('#cvData'); if (cd && V.dtrend && cd.offsetParent) drawBar(cd, { labels: V.dtrend.lb, bars: [{ name: '방문자', data: V.dtrend.p, color: '#2A44D4' }, { name: '차량', data: V.dtrend.v, color: '#22A04A' }], stacked: true });
}

/* =====================================================================
 * 🗂 DATA 조회 · 관리 — 개인별 · 차량별 · 기간별 · 방문부서별 · 회사 소속 명단
 * ===================================================================== */
const VIEWS = [['log', '📄 출입 기록 전체'], ['person', '👤 개인별'], ['car', '🚗 차량별'], ['co', '🏢 회사 소속 명단'], ['dept', '🏷 방문부서별'], ['period', '📅 기간별(일 · 월)']];
function curF() { const F = Object.assign({ per: 'm' }, UI.F || {}); if (!F.from || !F.to) Object.assign(F, rangeOf(F.per)); return F; }
function renderData() {
  const F = curF(), view = UI.view || 'log';
  $('#p-data').innerHTML = `<div class="filters">
    <label class="per">기간<span class="chips">${[['d', '오늘'], ['7', '7일'], ['m', '이번 달'], ['y', '올해'], ['a', '전체']].map(([k, n]) => `<button class="chip" data-per="${k}" aria-pressed="${F.per === k}">${n}</button>`).join('')}</span></label>
    <label>시작<input type="date" id="fFrom" value="${F.from === '2000-01-01' ? '' : F.from}"></label><label>끝<input type="date" id="fTo" value="${F.to === '2099-12-31' ? '' : F.to}"></label>
    <label>구분<select id="fKind">${[['', '전체'], ['p', '방문자'], ['v', '차량']].map(([k, n]) => `<option value="${k}" ${F.kind === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
    <label>검색어 (초성 · 번호판 2자리 · 업체)<input id="fQ" value="${esc(F.q || '')}" placeholder="ㅎㄱㄷ / 34 / 한빛"></label>
    <label>${esc(L('dept'))}<select id="fDept">${opt(allDepts(), F.dept, '전체 부서')}</select></label>
    <label>${esc(L('co'))}<select id="fCo">${opt(allCos(), F.co, '전체 회사')}</select></label>
    <label>${esc(L('purpose'))}<select id="fPurp">${opt(allPurposes(), F.purpose, '전체 업무')}</select></label>
    <label>상태<select id="fState">${[['', '전체'], ['in', '구내 체류'], ['out', '퇴실']].map(([k, n]) => `<option value="${k}" ${F.state === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
    <div class="nav"><button class="btn" id="fReset">초기화</button><button class="btn" id="fPull" title="공유 서버의 같은 기간 기록을 받아 합칩니다">☁ 서버 기록 받기</button></div></div>
  <div class="views" id="dViews">${VIEWS.map(([k, n]) => `<button data-view="${k}" aria-pressed="${view === k}">${n}</button>`).join('')}</div>
  <div id="dBody"></div>`;
  const setF = (patch, keepPage) => { UI.F = Object.assign(curF(), patch); if (!keepPage) V.page = 0; saveUI(); renderData(); };
  $$('[data-per]').forEach(b => b.onclick = () => setF(Object.assign({ per: b.dataset.per }, rangeOf(b.dataset.per))));
  $('#fFrom').onchange = e => setF({ from: e.target.value || '2000-01-01', per: 'c' }); $('#fTo').onchange = e => setF({ to: e.target.value || '2099-12-31', per: 'c' });
  [['#fKind', 'kind'], ['#fDept', 'dept'], ['#fCo', 'co'], ['#fPurp', 'purpose'], ['#fState', 'state']].forEach(([id, k]) => $(id).onchange = e => setF({ [k]: e.target.value }));
  let t; $('#fQ').oninput = e => { clearTimeout(t); t = setTimeout(() => { UI.F = Object.assign(curF(), { q: e.target.value }); V.page = 0; saveUI(); renderDataBody(); }, 250); };
  $('#fReset').onclick = () => { UI.F = Object.assign({ per: 'm' }, rangeOf('m')); V.page = 0; saveUI(); renderData(); };
  $('#fPull').onclick = async () => { const n = await pullShare(F.from, F.to); if (n) { toast(`서버 기록 ${nf(n)}건을 받았습니다`); renderData(); } };
  $$('[data-view]').forEach(b => b.onclick = () => { UI.view = b.dataset.view; V.page = 0; saveUI(); renderData(); });
  renderDataBody();
}
function dataExportBar(kind) { return `<div class="row" style="margin-left:auto"><button class="btn sm bx" style="color:#fff;border:0" data-ex="xlsx">⬇ 엑셀</button><button class="btn sm bw" style="color:#fff;border:0" data-ex="docx">⬇ Word</button><button class="btn sm bf" style="color:#fff;border:0" data-ex="pdf">⬇ PDF</button><button class="btn sm bp" style="color:#fff;border:0" data-ex="pptx">⬇ PPT</button><button class="btn sm" data-ex="csv">CSV</button></div>`; }
function renderDataBody() {
  const F = curF(), view = UI.view || 'log', list = queryVisits(F), S = summary(list), el = $('#dBody');
  const kp = `<div class="kpis">${[['출입 건수', S.n, '건', '#0B1F8A'], ['방문자(연인원)', S.p, `명 · 실인원 ${nf(S.ppl)}`, '#2A44D4'], ['차량(연대수)', S.v, `대 · 실대수 ${nf(S.cars)}`, '#1B7A34'], ['방문 회사', S.cos, '곳', '#7A2E8E'], ['방문부서', S.depts, '곳', '#E8750A'], ['기간 일수', S.days, `일 · ${fmtDs(F.from === '2000-01-01' ? (list[list.length - 1] || {}).d : F.from)}~`, '#0E7C86']].map(k => `<div class="kpi" style="--c:${k[3]}"><small>${k[0]}</small><b>${nf(k[1])}</b><span>${k[2]}</span></div>`).join('')}</div>`;
  let body = '';
  const PG = 100, pages = n => Math.max(1, Math.ceil(n / PG)), pager = n => n > PG ? `<div class="pager"><button class="btn sm" id="pgP" ${V.page ? '' : 'disabled'}>‹ 이전</button> ${V.page + 1} / ${pages(n)} 쪽 (${nf(n)}건) <button class="btn sm" id="pgN" ${V.page + 1 < pages(n) ? '' : 'disabled'}>다음 ›</button></div>` : '';
  if (view === 'log') body = listRows(list.slice(V.page * PG, V.page * PG + PG), { date: true, empty: '조건에 맞는 출입 기록이 없습니다.' }) + pager(list.length);
  if (view === 'person') { const G = groupBy(list.filter(v => v.pid), v => v.pid); body = G.length ? `<div class="tblw"><table class="t"><thead><tr><th>순</th><th>성명</th><th>현재 소속</th><th>방문 당시 소속(이력)</th><th>연락처</th><th>방문</th><th>방문일수</th><th>첫 방문</th><th>최근 방문</th><th>주요 방문부서</th><th>차량</th></tr></thead><tbody>${G.slice(V.page * PG, V.page * PG + PG).map((g, i) => { const p = AC.people[g.k] || { name: g.list[0].name, company: g.list[0].co }; return `<tr class="${p.ban && p.ban.on ? 'ban' : ''}"><td class="c">${V.page * PG + i + 1}</td><td><button class="lnkb" data-pid="${esc(g.k)}">${esc(p.name)}</button></td><td>${coLink(p.company)}</td><td>${esc(Object.keys(g.cos).join(' → '))}</td><td>${esc(maskPhone(p.phone))}</td><td class="n">${nf(g.n)}회</td><td class="n">${g.days.size}일</td><td class="c">${fmtDs(g.first)}</td><td class="c">${fmtDs(g.last)}</td><td>${esc(topOf(g.depts))}</td><td>${carsOfPerson(g.k).map(c => `<span class="plate">${esc(c.plate)}</span>`).join(' ')}</td></tr>`; }).join('')}</tbody></table></div>` + pager(G.length) : '<div class="empty">방문자 기록이 없습니다.</div>'; }
  if (view === 'car') { const G = groupBy(list.filter(v => v.cid), v => v.cid); body = G.length ? `<div class="tblw"><table class="t"><thead><tr><th>순</th><th>차량번호</th><th>차종 · 모델</th><th>현재 소속</th><th>방문 당시 소속</th><th>입차</th><th>방문일수</th><th>첫 방문</th><th>최근 방문</th><th>주요 방문부서</th><th>운전자</th></tr></thead><tbody>${G.slice(V.page * PG, V.page * PG + PG).map((g, i) => { const c = AC.cars[g.k] || { plate: g.list[0].plate }; return `<tr class="${c.ban && c.ban.on ? 'ban' : ''}"><td class="c">${V.page * PG + i + 1}</td><td><button class="plate" data-cid="${esc(g.k)}" style="cursor:pointer">${esc(c.plate)}</button></td><td>${esc([c.type, c.model].filter(Boolean).join(' · '))}</td><td>${coLink(c.company)}</td><td>${esc(Object.keys(g.cos).join(' → '))}</td><td class="n">${nf(g.n)}회</td><td class="n">${g.days.size}일</td><td class="c">${fmtDs(g.first)}</td><td class="c">${fmtDs(g.last)}</td><td>${esc(topOf(g.depts))}</td><td>${esc(peopleOfCar(g.k).map(p => p.name).join(', '))}</td></tr>`; }).join('')}</tbody></table></div>` + pager(G.length) : '<div class="empty">차량 기록이 없습니다.</div>'; }
  if (view === 'co') { const G = groupBy(list, v => norm(v.co), v => v.co); body = G.length ? G.slice(V.page * 30, V.page * 30 + 30).map(g => { const ppl = groupBy(g.list.filter(v => v.pid), v => v.pid), cars = groupBy(g.list.filter(v => v.cid), v => v.cid); return `<div class="card" style="--c:#7A2E8E;margin-bottom:10px"><h2>🏢 ${coLink(g.label)} <span class="tag" style="--c:#7A2E8E">${nf(g.n)}건</span><span class="r">방문자 ${ppl.length}명 · 차량 ${cars.length}대 · ${fmtDs(g.first)} ~ ${fmtDs(g.last)} · 주요 부서 ${esc(topOf(g.depts))}</span></h2><div class="body"><div class="tblw"><table class="t" style="min-width:0"><thead><tr><th>구분</th><th>성명 / 차량번호</th><th>직위 · 차종</th><th>연락처</th><th>방문</th><th>최근 방문</th><th>방문부서</th></tr></thead><tbody>${ppl.map(x => { const p = AC.people[x.k] || {}; return `<tr><td class="c">👤</td><td><button class="lnkb" data-pid="${esc(x.k)}">${esc(p.name || x.list[0].name)}</button></td><td>${esc(p.title || '')}</td><td>${esc(maskPhone(p.phone))}</td><td class="n">${x.n}회</td><td class="c">${fmtDs(x.last)}</td><td>${esc(topOf(x.depts, 2))}</td></tr>`; }).join('')}${cars.map(x => { const c = AC.cars[x.k] || {}; return `<tr><td class="c">🚗</td><td><button class="plate" data-cid="${esc(x.k)}" style="cursor:pointer">${esc(c.plate || x.list[0].plate)}</button></td><td>${esc(c.type || '')}</td><td></td><td class="n">${x.n}회</td><td class="c">${fmtDs(x.last)}</td><td>${esc(topOf(x.depts, 2))}</td></tr>`; }).join('')}</tbody></table></div></div></div>`; }).join('') + (G.length > 30 ? `<div class="pager"><button class="btn sm" id="pgP" ${V.page ? '' : 'disabled'}>‹ 이전</button> ${V.page + 1} / ${Math.ceil(G.length / 30)} <button class="btn sm" id="pgN" ${V.page + 1 < Math.ceil(G.length / 30) ? '' : 'disabled'}>다음 ›</button></div>` : '') : '<div class="empty">회사별 기록이 없습니다.</div>'; }
  if (view === 'dept') { const G = groupBy(list, v => v.dept || '(미기재)'); body = G.length ? `<div class="tblw"><table class="t"><thead><tr><th>순</th><th>방문부서</th><th>출입</th><th>방문자</th><th>차량</th><th>방문 회사</th><th>주요 방문 회사</th><th>주요 업무</th><th>최근 방문</th></tr></thead><tbody>${G.map((g, i) => { const pu = {}; g.list.forEach(v => v.purpose && (pu[v.purpose] = (pu[v.purpose] || 0) + 1)); return `<tr><td class="c">${i + 1}</td><td><button class="lnkb" data-dept="${esc(g.k)}">${esc(g.k)}</button></td><td class="n">${nf(g.n)}</td><td class="n">${nf(g.list.filter(v => v.pid).length)}</td><td class="n">${nf(g.list.filter(v => v.cid).length)}</td><td class="n">${Object.keys(g.cos).length}</td><td>${esc(topOf(g.cos))}</td><td>${esc(topOf(pu))}</td><td class="c">${fmtDs(g.last)}</td></tr>`; }).join('')}</tbody></table></div>` : '<div class="empty">기록이 없습니다.</div>'; }
  if (view === 'period') { const byM = (F.to.slice(0, 7) !== F.from.slice(0, 7) && (parseD(F.to) - parseD(F.from)) / 864e5 > 62) || F.per === 'a' || F.per === 'y'; const G = groupBy(list, v => byM ? v.d.slice(0, 7) : v.d).sort((a, b) => a.k.localeCompare(b.k)); V.dtrend = { lb: G.map(g => byM ? g.k.replace('-', '.') : g.k.slice(5).replace('-', '/')), p: G.map(g => g.list.filter(v => v.pid).length), v: G.map(g => g.list.filter(v => v.cid).length) }; body = `<section class="card"><h2>📈 ${byM ? '월별' : '일별'} 출입 추이</h2><div class="body"><div class="chartbox"><canvas id="cvData"></canvas></div></div></section><div class="tblw"><table class="t"><thead><tr><th>${byM ? '월' : '일자'}</th><th>출입</th><th>방문자</th><th>차량</th><th>실인원</th><th>방문 회사</th><th>주요 방문부서</th><th>주요 회사</th></tr></thead><tbody>${G.slice().reverse().map(g => `<tr><td class="c">${byM ? g.k.replace('-', '.') : fmtD(g.k)}</td><td class="n">${nf(g.n)}</td><td class="n">${nf(g.list.filter(v => v.pid).length)}</td><td class="n">${nf(g.list.filter(v => v.cid).length)}</td><td class="n">${new Set(g.list.map(v => v.pid).filter(Boolean)).size}</td><td class="n">${Object.keys(g.cos).length}</td><td>${esc(topOf(g.depts))}</td><td>${esc(topOf(g.cos))}</td></tr>`).join('')}</tbody></table></div>`; }
  el.innerHTML = kp + `<section class="card"><h2>${VIEWS.find(x => x[0] === view)[1]} <span class="hint" style="font-weight:500">${fmtDs(F.from === '2000-01-01' ? '' : F.from)} ~ ${fmtDs(F.to === '2099-12-31' ? '' : F.to)}${F.q ? ' · 「' + esc(F.q) + '」' : ''}${F.dept ? ' · ' + esc(F.dept) : ''}${F.co ? ' · ' + esc(F.co) : ''}</span>${dataExportBar(view)}</h2><div class="body">${body}</div></section>`;
  bindLinks(el);
  el.querySelectorAll('[data-dept]').forEach(b => b.onclick = () => { UI.F = Object.assign(curF(), { dept: b.dataset.dept === '(미기재)' ? '' : b.dataset.dept }); UI.view = 'log'; saveUI(); renderData(); });
  const pp = el.querySelector('#pgP'), pn = el.querySelector('#pgN'); if (pp) pp.onclick = () => { V.page--; renderDataBody(); }; if (pn) pn.onclick = () => { V.page++; renderDataBody(); };
  el.querySelectorAll('[data-ex]').forEach(b => b.onclick = () => outView(view, F, b.dataset.ex));
  drawCharts();
}

/* =====================================================================
 * 상세 — 방문자 · 차량 · 회사 · 출입 1건 (누적 DATA 통합 화면)
 * ===================================================================== */
function visitTable(list, cols) {
  return list.length ? `<div class="tblw" style="max-height:340px"><table class="t" style="min-width:0"><thead><tr><th>일자</th><th>입실</th><th>퇴실</th>${cols.includes('name') ? '<th>성명</th>' : ''}${cols.includes('plate') ? '<th>차량</th>' : ''}<th>방문 당시 소속</th><th>${esc(L('dept'))}</th><th>${esc(L('purpose'))}</th><th>${esc(L('host'))}</th><th>사업장 · 출입구</th></tr></thead><tbody>${list.map(v => `<tr class="${v.banHit ? 'ban' : ''}"><td class="c">${fmtD(v.d)}</td><td class="c">${esc(v.tin)}</td><td class="c">${esc(v.tout || (v.out ? '' : '구내'))}</td>${cols.includes('name') ? `<td>${pLink(v)}</td>` : ''}${cols.includes('plate') ? `<td>${cLink(v)}</td>` : ''}<td>${coLink(v.co)}</td><td>${esc(v.dept || '')}</td><td>${esc(v.purpose || '')}</td><td>${esc(v.host || '')}</td><td>${esc([v.siteName, v.gate].filter(Boolean).join(' · '))}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">출입 기록이 없습니다.</div>';
}
function histHtml(h, cur) { return h.length ? `<ul class="tl">${h.map((x, i) => `<li class="${i === h.length - 1 ? 'cur' : ''}"><b>${coLink(x.co)}</b> · ${fmtDs(x.from)} ~ ${i === h.length - 1 && norm(x.co) === norm(cur) ? '현재' : fmtDs(x.to)} <span class="hint">(${x.n}회)</span></li>`).join('')}</ul>` : '<p class="hint">방문 기록이 없습니다.</p>'; }
function deptStat(list) { const o = {}; list.forEach(v => v.dept && (o[v.dept] = (o[v.dept] || 0) + 1)); return Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<span class="chip">${esc(k)} ${n}</span>`).join(' ') || '<span class="hint">-</span>'; }
function openPerson(pid) {
  const p = AC.people[pid]; if (!p) return toast('방문자 정보를 찾을 수 없습니다');
  const vs = visitsOfPerson(pid), cars = carsOfPerson(pid), h = coHistory(vs), same = findPeopleByName(p.name).filter(x => x.id !== pid);
  openModal(`<div class="pcard"><div class="pav av p">${p.photo ? `<img src="${p.photo}" alt="">` : esc(p.name[0])}</div><div><h2>👤 ${esc(p.name)} <small class="hint">${esc(p.title || '')}</small> ${p.ban && p.ban.on ? '<span class="tag" style="--c:#C53A3A">⛔ 출입제한</span>' : ''}</h2><div class="meta">현재 소속 ${coLink(p.company)} · 연락처 ${esc(maskPhone(p.phone) || '-')}${same.length ? ` · <b style="color:#B45309">동명이인 ${same.length}명</b>` : ''}</div></div></div>
    ${p.ban && p.ban.on ? `<div class="banbox">⛔ 출입 제한 — ${esc(p.ban.reason || '')} (${esc(p.ban.at || '')})</div>` : ''}
    <div class="minis"><div class="mini"><small>누적 방문</small><b>${nf(vs.length)}회</b></div><div class="mini"><small>방문 일수</small><b>${new Set(vs.map(v => v.d)).size}일</b></div><div class="mini"><small>첫 방문</small><b>${vs.length ? fmtDs(vs[vs.length - 1].d) : '-'}</b></div><div class="mini"><small>최근 방문</small><b>${vs.length ? fmtDs(vs[0].d) : '-'}</b></div><div class="mini"><small>이용 차량</small><b>${cars.length}대</b></div></div>
    <div class="two"><div><h3 style="margin:6px 0">🏢 소속 이력 <span class="hint">(방문 당시 소속 기준 — 이직 · 전배 구분)</span></h3>${histHtml(h, p.company)}</div><div><h3 style="margin:6px 0">🚗 이용 차량</h3><div class="row">${cars.map(c => `<button class="plate" data-cid="${esc(c.id)}" style="cursor:pointer">${esc(c.plate)}</button>`).join(' ') || '<span class="hint">없음</span>'}</div><h3 style="margin:10px 0 6px">🏷 방문부서별</h3>${deptStat(vs)}${same.length ? `<h3 style="margin:10px 0 6px">👥 동명이인</h3>${same.map(x => `<button class="lnkb" data-pid="${esc(x.id)}">${esc(x.name)} (${esc(x.company)})</button>`).join(' · ')}` : ''}</div></div>
    <h3 style="margin:12px 0 6px">📄 출입 기록 (방문일자 · 시간 · 부서 · 당시 소속)</h3>${visitTable(vs, ['plate'])}
    <div class="mrow"><button class="btn" id="pEdit">✏ 정보 수정</button><button class="btn ${p.ban && p.ban.on ? '' : 'warn'}" id="pBan">${p.ban && p.ban.on ? '출입제한 해제' : '⛔ 출입제한 지정'}</button><button class="btn" id="pDoc">⬇ 개인 출입 이력서(Word)</button><button class="btn" id="pPdf">PDF</button><button class="btn pri" id="pIn">🚪 이 사람 입실 등록</button><button class="btn" id="mClose">닫기</button></div>`, md => {
    bindLinks(md); md.querySelector('#mClose').onclick = closeModal;
    md.querySelector('#pEdit').onclick = () => editPerson(pid);
    md.querySelector('#pBan').onclick = () => toggleBan('people', pid);
    md.querySelector('#pDoc').onclick = () => outPerson(pid, 'docx'); md.querySelector('#pPdf').onclick = () => outPerson(pid, 'pdf');
    md.querySelector('#pIn').onclick = () => { closeModal(); setTab('entry'); $('#vName').value = p.name; $('#vName').dispatchEvent(new Event('input')); const b = $('#vNameSug button'); peopleSug(p.name).forEach((x, i) => { if (x.p.id === pid) { const bt = $$('#vNameSug button')[i]; if (bt) bt.dispatchEvent(new MouseEvent('mousedown')); } }); $('.tabs').scrollIntoView({ behavior: 'smooth' }); };
  }, 2);
}
function openCar(cid) {
  const c = AC.cars[cid]; if (!c) return toast('차량 정보를 찾을 수 없습니다');
  const vs = visitsOfCar(cid), ppl = peopleOfCar(cid), h = coHistory(vs);
  openModal(`<div class="pcard"><div class="pav av v">🚗</div><div><h2><span class="plate big">${esc(c.plate)}</span> ${c.ban && c.ban.on ? '<span class="tag" style="--c:#C53A3A">⛔ 출입제한</span>' : ''}</h2><div class="meta">${esc([c.type, c.model, c.color].filter(Boolean).join(' · '))} · 현재 소속 ${coLink(c.company)}</div></div></div>
    ${c.ban && c.ban.on ? `<div class="banbox">⛔ 출입 제한 — ${esc(c.ban.reason || '')} (${esc(c.ban.at || '')})</div>` : ''}
    <div class="minis"><div class="mini"><small>누적 입차</small><b>${nf(vs.length)}회</b></div><div class="mini"><small>방문 일수</small><b>${new Set(vs.map(v => v.d)).size}일</b></div><div class="mini"><small>첫 방문</small><b>${vs.length ? fmtDs(vs[vs.length - 1].d) : '-'}</b></div><div class="mini"><small>최근 방문</small><b>${vs.length ? fmtDs(vs[0].d) : '-'}</b></div><div class="mini"><small>운전자</small><b>${ppl.length}명</b></div></div>
    <div class="two"><div><h3 style="margin:6px 0">🏢 소속 이력</h3>${histHtml(h, c.company)}</div><div><h3 style="margin:6px 0">👤 운전자 · 동승 방문자</h3>${ppl.map(p => `<button class="lnkb" data-pid="${esc(p.id)}">${esc(p.name)}</button> <span class="hint">${esc(p.company)}</span>`).join('<br>') || '<span class="hint">없음</span>'}<h3 style="margin:10px 0 6px">🏷 방문부서별</h3>${deptStat(vs)}</div></div>
    <h3 style="margin:12px 0 6px">📄 출입 기록</h3>${visitTable(vs, ['name'])}
    <div class="mrow"><button class="btn" id="cEdit">✏ 정보 수정</button><button class="btn ${c.ban && c.ban.on ? '' : 'warn'}" id="cBanB">${c.ban && c.ban.on ? '출입제한 해제' : '⛔ 출입제한 지정'}</button><button class="btn" id="cDoc">⬇ 차량 출입 이력서(Word)</button><button class="btn" id="cPdf">PDF</button><button class="btn pri" id="cIn">🚗 이 차량 입차 등록</button><button class="btn" id="mClose">닫기</button></div>`, md => {
    bindLinks(md); md.querySelector('#mClose').onclick = closeModal;
    md.querySelector('#cEdit').onclick = () => editCar(cid); md.querySelector('#cBanB').onclick = () => toggleBan('cars', cid);
    md.querySelector('#cDoc').onclick = () => outCar(cid, 'docx'); md.querySelector('#cPdf').onclick = () => outCar(cid, 'pdf');
    md.querySelector('#cIn').onclick = () => { closeModal(); setTab('entry'); $('#cPlate').value = c.plate; $('#cPlate').dispatchEvent(new Event('input')); const bt = $('#cPlateSug button'); if (bt) bt.dispatchEvent(new MouseEvent('mousedown')); $('.tabs').scrollIntoView({ behavior: 'smooth' }); };
  }, 2);
}
function openVisit(id) {
  const v = AC.visits[id]; if (!v) return;
  const rows = [['구분', v.pid && v.cid ? '방문자 + 차량' : v.cid ? '방문차량' : '방문자'], ['일자', fmtD(v.d)], ['입실 · 퇴실', `${v.tin} ~ ${v.tout || '(구내)'}${v.outD && v.outD !== v.d ? ' (' + fmtDs(v.outD) + ')' : ''} · 체류 ${stayTxt(stayMin(v))}`], [L('name'), v.name || '-'], ['연락처', maskPhone(v.phone) || '-'], [L('plate'), v.plate || '-'], ['차종', v.vtype || '-'], [L('co') + '(당시)', v.co || '-'], [L('dept'), v.dept || '-'], [L('host'), v.host || '-'], [L('purpose'), v.purpose || '-'], [L('gate'), v.gate || '-'], [L('badge'), v.badge || '-'], ['동반 인원', v.cnt || 0], [L('items'), v.items || '-'], ['주차 · 계근', v.park || '-'], ['신분 확인 · 서약', `${v.idChk ? '✔ 신분 확인' : '-'} · ${v.pledge ? '✔ 보안서약' : '-'}`], ['사업장', v.siteName || '-'], ['처리 근무자', v.guard || '-'], ['자료 출처', v.src || 'manual'], ['비고', v.note || '-']];
  openModal(`<h2>${kndOf(v)} 출입 기록 상세</h2><div class="sub">${esc(v.id)}${v.banHit ? ' · <b style="color:var(--danger)">출입제한 확인 후 입실</b>' : ''}</div><dl class="cogrid">${rows.map(r => `<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl>
    <div class="mrow">${v.pid ? `<button class="btn" data-pid="${esc(v.pid)}">👤 방문자 DATA</button>` : ''}${v.cid ? `<button class="btn" data-cid="${esc(v.cid)}">🚗 차량 DATA</button>` : ''}<button class="btn" id="vPass">🪪 방문증 인쇄(PDF)</button>${v.out ? '' : `<button class="btn pri" id="vOut">퇴실 처리</button>`}<button class="btn" id="vEdit">✏ 수정</button><button class="btn warn" id="vDel">삭제</button><button class="btn" id="mClose">닫기</button></div>`, md => {
    bindLinks(md); md.querySelector('#mClose').onclick = closeModal; md.querySelector('#vPass').onclick = () => outPass(id);
    const o = md.querySelector('#vOut'); if (o) o.onclick = () => { checkOut(id); closeModal(); toast('퇴실 처리했습니다'); renderAll(); };
    md.querySelector('#vEdit').onclick = () => editVisit(id);
    md.querySelector('#vDel').onclick = () => { if (!confirmBox('이 출입 기록을 지울까요? 되돌릴 수 없습니다.')) return; delete AC.visits[id]; saveAC(); queueShare('visits', id, true); closeModal(); toast('지웠습니다'); renderAll(); };
  }, true);
}
function editVisit(id) {
  const v = AC.visits[id], F = [['d', '일자', 'date'], ['tin', '입실', 'time'], ['tout', '퇴실', 'time'], ['co', L('co')], ['dept', L('dept')], ['host', L('host')], ['purpose', L('purpose')], ['gate', L('gate')], ['badge', L('badge')], ['items', L('items')], ['note', '비고']];
  openModal(`<h2>✏ 출입 기록 수정</h2><div class="fg">${F.map(([k, n, t]) => `<label>${esc(n)}<input id="e_${k}" type="${t || 'text'}" value="${esc(v[k] || '')}"></label>`).join('')}</div><p class="hint">수정 기록은 「수정 일시」로 남습니다.</p><div class="mrow"><button class="btn" id="mClose">취소</button><button class="btn pri" id="eOk">저장</button></div>`, md => {
    md.querySelector('#mClose').onclick = closeModal;
    md.querySelector('#eOk').onclick = () => { F.forEach(([k]) => v[k] = md.querySelector('#e_' + k).value.trim()); if (v.tout) v.out = true; v.edited = new Date().toISOString(); v.at = v.edited; ensureCo(v.co); saveAC(); queueShare('visits', id); closeModal(); toast('저장했습니다'); renderAll(); };
  }, true);
}
function editPerson(pid) {
  const p = AC.people[pid];
  openModal(`<h2>✏ 방문자 정보 수정</h2><div class="avatar-edit"><div class="av" id="epAv">${p.photo ? `<img src="${p.photo}">` : esc(p.name[0])}</div><div><label class="btn sm" for="epFile">사진</label><input type="file" id="epFile" accept="image/*" hidden> <button class="btn sm" id="epNoPh">사진 빼기</button></div></div>
    <div class="fg"><label>성명<input id="epName" value="${esc(p.name)}"></label><label>연락처<input id="epPhone" value="${esc(phoneFmt(p.phone))}"></label><label>현재 소속<input id="epCo" value="${esc(p.company)}"></label><label>직위<input id="epTitle" value="${esc(p.title || '')}"></label><label class="full">메모<input id="epNote" value="${esc(p.note || '')}"></label></div>
    <div class="mrow"><button class="btn warn" id="epDel">방문자 삭제</button><button class="btn" id="mClose">취소</button><button class="btn pri" id="epOk">저장</button></div>`, md => {
    let photo = p.photo || '';
    md.querySelector('#epFile').onchange = e => { const f = e.target.files[0]; if (f) shrinkPhoto(f, 320).then(d => { photo = d; md.querySelector('#epAv').innerHTML = `<img src="${d}">`; }); };
    md.querySelector('#epNoPh').onclick = () => { photo = ''; md.querySelector('#epAv').textContent = p.name[0]; };
    md.querySelector('#mClose').onclick = () => openPerson(pid);
    md.querySelector('#epOk').onclick = () => { const co = md.querySelector('#epCo').value.trim(); if (norm(co) !== norm(p.company)) { p.coHist = p.coHist || []; p.coHist.push({ co: p.company, to: today() }); } Object.assign(p, { name: md.querySelector('#epName').value.trim() || p.name, phone: md.querySelector('#epPhone').value.trim(), company: co, title: md.querySelector('#epTitle').value.trim(), note: md.querySelector('#epNote').value.trim(), photo, updated: new Date().toISOString() }); ensureCo(co); saveAC(); queueShare('people', pid); toast('저장했습니다'); openPerson(pid); };
    md.querySelector('#epDel').onclick = () => { const n = visitsOfPerson(pid).length; if (!confirmBox(`${p.name}과(와) 출입 기록 ${n}건을 모두 지울까요? (정보주체 삭제 요청 등)`)) return; visitsOfPerson(pid).forEach(v => { delete AC.visits[v.id]; queueShare('visits', v.id, true); }); delete AC.people[pid]; queueShare('people', pid, true); saveAC(); closeModal(); toast('지웠습니다'); renderAll(); };
  }, true);
}
function editCar(cid) {
  const c = AC.cars[cid];
  openModal(`<h2>✏ 차량 정보 수정 — ${esc(c.plate)}</h2><div class="fg"><label>차종<select id="ecType">${opt(AC.cfg.vtypes, c.type, '선택')}</select></label><label>모델<input id="ecModel" value="${esc(c.model || '')}"></label><label>색상<input id="ecColor" value="${esc(c.color || '')}"></label><label>현재 소속<input id="ecCo" value="${esc(c.company)}"></label><label class="full">메모<input id="ecNote" value="${esc(c.note || '')}"></label></div>
    <div class="mrow"><button class="btn warn" id="ecDel">차량 삭제</button><button class="btn" id="mClose">취소</button><button class="btn pri" id="ecOk">저장</button></div>`, md => {
    md.querySelector('#mClose').onclick = () => openCar(cid);
    md.querySelector('#ecOk').onclick = () => { const co = md.querySelector('#ecCo').value.trim(); if (norm(co) !== norm(c.company)) { c.coHist = c.coHist || []; c.coHist.push({ co: c.company, to: today() }); } Object.assign(c, { type: md.querySelector('#ecType').value, model: md.querySelector('#ecModel').value.trim(), color: md.querySelector('#ecColor').value.trim(), company: co, note: md.querySelector('#ecNote').value.trim(), updated: new Date().toISOString() }); ensureCo(co); saveAC(); queueShare('cars', cid); toast('저장했습니다'); openCar(cid); };
    md.querySelector('#ecDel').onclick = () => { const n = visitsOfCar(cid).length; if (!confirmBox(`${c.plate} 차량을 지울까요? 출입 기록 ${n}건에서는 차량 연결만 빠집니다.`)) return; visitsOfCar(cid).forEach(v => { if (v.pid) { v.cid = ''; queueShare('visits', v.id); } else { delete AC.visits[v.id]; queueShare('visits', v.id, true); } }); delete AC.cars[cid]; queueShare('cars', cid, true); saveAC(); closeModal(); toast('지웠습니다'); renderAll(); };
  }, true);
}
function toggleBan(kind, id) {
  const o = AC[kind][id];
  if (o.ban && o.ban.on) { o.ban = { on: false, reason: o.ban.reason, off: today() }; saveAC(); queueShare(kind, id); toast('출입제한을 해제했습니다'); return kind === 'people' ? openPerson(id) : openCar(id); }
  openModal(`<h2>⛔ 출입제한 지정</h2><div class="sub">${esc(o.name || o.plate)} — 지정하면 입실 등록 때 경고가 나오고 기록에 남습니다.</div><label class="f">사유<input id="banR" placeholder="예: 보안서약 위반, 고객사 요청, 무단 촬영"></label><div class="mrow"><button class="btn" id="mClose">취소</button><button class="btn warn" id="banOk">지정</button></div>`, md => {
    md.querySelector('#mClose').onclick = () => kind === 'people' ? openPerson(id) : openCar(id);
    md.querySelector('#banOk').onclick = () => { o.ban = { on: true, reason: md.querySelector('#banR').value.trim(), at: today(), by: UI.manager ? UI.manager.name : '' }; saveAC(); queueShare(kind, id); toast('출입제한을 지정했습니다'); kind === 'people' ? openPerson(id) : openCar(id); };
  });
}

/* =====================================================================
 * 🏢 회사 정보 — 회사 이름을 누르면 인터넷 공개 기본정보 + 소속 방문자 · 차량
 * ===================================================================== */
function coInfoHtml(co) {
  const i = Object.assign({}, co.info || {}, co.manual || {});
  const photo = i.photoUser || i.photoBuilding || i.photo;
  const row = (k, v, link) => `<dt>${k}</dt><dd>${v ? (link ? `<a href="${esc(v)}" target="_blank" rel="noopener noreferrer">${esc(v)}</a>` : esc(v)) : '<span class="hint">-</span>'}</dd>`;
  return `<div class="two" style="gap:14px"><div>${photo ? `<img class="coimg" src="${esc(photo)}" alt="${esc(co.name)} 전경 · 대표 사진" referrerpolicy="no-referrer" onerror="this.style.display='none'">` : `<div class="coimg" style="height:160px;display:grid;place-items:center;color:var(--mute)">🏢 회사 전경 사진 없음<br><small>「✏ 직접 입력」에서 사진을 넣을 수 있습니다</small></div>`}
    <p class="hint" style="margin-top:6px">${esc(i.desc || '')}</p></div>
    <div><dl class="cogrid">${row('회사명', co.name)}${row('주소', i.addr || i.hq)}${row('대표전화', i.tel)}${row('업종', i.ind)}${row('홈페이지', i.home, true)}${row('대표자', i.ceo)}${row('설립', i.since)}${row('자료 출처', (i.src || []).join(' · ') + (i.at ? ' · ' + String(i.at).slice(0, 10) : ''))}</dl>
    <div class="row" style="margin-top:8px">${coLinks(co.name).map(([n, u]) => `<a class="btn sm" href="${u}" target="_blank" rel="noopener noreferrer">${n} ↗</a>`).join('')}</div></div></div>`;
}
async function refreshCo(name, md) {
  const co = ensureCo(name); busy(true, `「${name}」 공개 정보를 찾는 중…`);
  try { const info = await lookupCompany(name); if (info.found || info.photo) { co.info = info; saveAC(); queueShare('cos', co.id); toast('인터넷 공개 정보를 반영했습니다'); } else toast('공개 정보를 찾지 못했습니다 — 아래 검색 버튼으로 확인한 뒤 「✏ 직접 입력」 하세요', 5000); }
  catch (e) { toast('찾지 못했습니다: ' + (e.message || e)); } finally { busy(false); }
  if (md) openCo(name); else renderCoTab();
}
function editCo(name, back) {
  const co = ensureCo(name), m = Object.assign({}, co.info || {}, co.manual || {});
  const F = [['addr', '주소'], ['tel', '대표전화'], ['ind', '업종'], ['home', '홈페이지'], ['ceo', '대표자'], ['since', '설립'], ['desc', '소개']];
  openModal(`<h2>✏ 회사 기본정보 직접 입력 — ${esc(name)}</h2><div class="fg">${F.map(([k, n]) => `<label class="${k === 'desc' ? 'full' : ''}">${n}<input id="co_${k}" value="${esc(m[k] || '')}"></label>`).join('')}<label class="full">회사 전경 사진<input type="file" id="coPh" accept="image/*"></label></div>
    <div class="mrow"><button class="btn" id="mClose">취소</button><button class="btn pri" id="coOk">저장</button></div>`, md => {
    let ph = (co.manual || {}).photoUser || '';
    md.querySelector('#coPh').onchange = e => { const f = e.target.files[0]; if (f) shrinkPhoto(f, 900).then(d => ph = d); };
    md.querySelector('#mClose').onclick = () => back ? openCo(name) : closeModal();
    md.querySelector('#coOk').onclick = () => { co.manual = {}; F.forEach(([k]) => { const v = md.querySelector('#co_' + k).value.trim(); if (v) co.manual[k] = v; }); if (ph) co.manual.photoUser = ph; co.manual.src = ['직접 입력']; co.updated = new Date().toISOString(); saveAC(); queueShare('cos', co.id); toast('저장했습니다'); back ? openCo(name) : (closeModal(), renderCoTab()); };
  }, true);
}
function openCo(name) {
  const co = ensureCo(name); const vs = visitsOfCo(name), ppl = peopleOfCo(name), cars = carsOfCo(name);
  openModal(`<h2>🏢 ${esc(co.name)}</h2><div class="sub">회사 기본정보(인터넷 공개 정보) · 소속 방문자 ${ppl.length}명 · 차량 ${cars.length}대 · 출입 ${nf(vs.length)}건</div>
    ${coInfoHtml(co)}
    <div class="row" style="margin:10px 0"><button class="btn pri" id="coRef">🌐 인터넷에서 기본정보 찾기</button><button class="btn" id="coEd">✏ 직접 입력 · 수정</button><button class="btn" id="coDoc">⬇ 회사 출입 현황(Word)</button><button class="btn" id="coPdf">PDF</button><button class="btn" id="coData">🗂 DATA 조회로</button></div>
    <div class="two"><div><h3 style="margin:6px 0">👤 소속 방문자 (${ppl.length})</h3><div class="tblw" style="max-height:260px"><table class="t" style="min-width:0"><thead><tr><th>성명</th><th>직위</th><th>현재 소속</th><th>방문</th><th>최근</th></tr></thead><tbody>${ppl.map(p => { const x = visitsOfPerson(p.id); return `<tr><td><button class="lnkb" data-pid="${esc(p.id)}">${esc(p.name)}</button>${p.ban && p.ban.on ? ' ⛔' : ''}</td><td>${esc(p.title || '')}</td><td>${norm(p.company) === norm(name) ? '현 소속' : '<span class="hint">→ ' + esc(p.company) + '</span>'}</td><td class="n">${x.length}</td><td class="c">${x[0] ? fmtDs(x[0].d) : '-'}</td></tr>`; }).join('') || '<tr><td colspan="5" class="c hint">없음</td></tr>'}</tbody></table></div></div>
    <div><h3 style="margin:6px 0">🚗 소속 차량 (${cars.length})</h3><div class="tblw" style="max-height:260px"><table class="t" style="min-width:0"><thead><tr><th>차량번호</th><th>차종</th><th>방문</th><th>최근</th></tr></thead><tbody>${cars.map(c => { const x = visitsOfCar(c.id); return `<tr><td><button class="plate" data-cid="${esc(c.id)}" style="cursor:pointer">${esc(c.plate)}</button></td><td>${esc(c.type || '')}</td><td class="n">${x.length}</td><td class="c">${x[0] ? fmtDs(x[0].d) : '-'}</td></tr>`; }).join('') || '<tr><td colspan="4" class="c hint">없음</td></tr>'}</tbody></table></div></div></div>
    <h3 style="margin:12px 0 6px">📄 최근 출입 (50건)</h3>${visitTable(vs.slice(0, 50), ['name', 'plate'])}
    <p class="priv">🔒 인터넷 검색에는 회사 이름만 보냅니다. 방문자 이름 · 연락처 · 차량번호는 외부로 보내지 않습니다.</p>
    <div class="mrow"><button class="btn" id="mClose">닫기</button></div>`, md => {
    bindLinks(md); md.querySelector('#mClose').onclick = closeModal;
    md.querySelector('#coRef').onclick = () => refreshCo(name, md); md.querySelector('#coEd').onclick = () => editCo(name, true);
    md.querySelector('#coDoc').onclick = () => outCo(name, 'docx'); md.querySelector('#coPdf').onclick = () => outCo(name, 'pdf');
    md.querySelector('#coData').onclick = () => { closeModal(); UI.F = Object.assign(rangeOf('a'), { per: 'a', co: name }); UI.view = 'co'; saveUI(); setTab('data'); };
  }, 2);
  if (!co.info && !co.manual && navigator.onLine !== false && !co.tried) { co.tried = true; lookupCompany(name).then(info => { if (info.found || info.photo) { co.info = info; saveAC(); queueShare('cos', co.id); if ($('.modal h2') && $('.modal h2').textContent.includes(co.name)) openCo(name); } }).catch(() => { }); }
}
function renderCoTab() {
  const q = V.coQ || '', list = allCos().filter(n => !q || hanMatch(n, q));
  $('#p-co').innerHTML = `<div class="filters"><label style="flex:3">회사 검색 (초성 가능)<input id="coQ" value="${esc(q)}" placeholder="ㅎㅂ / 한빛"></label><div class="nav"><button class="btn pri" id="coAdd">➕ 회사 추가</button><button class="btn" id="coAll">🌐 정보 없는 회사 한꺼번에 찾기</button></div></div>
  <section class="card" style="--c:#7A2E8E"><h2>🏢 방문 회사 ${list.length}곳 <span class="r">회사 이름을 누르면 기본정보 · 소속 방문자 · 차량</span></h2><div class="body"><div class="tblw"><table class="t"><thead><tr><th>회사명</th><th>업종</th><th>주소</th><th>대표전화</th><th>홈페이지</th><th>방문자</th><th>차량</th><th>출입</th><th>최근 방문</th><th>정보</th></tr></thead><tbody>${list.map(n => { const co = coOf(n) || { name: n }, i = Object.assign({}, co.info || {}, co.manual || {}), vs = visitsOfCo(n); return `<tr><td>${coLink(n)}</td><td>${esc(i.ind || '')}</td><td>${esc((i.addr || i.hq || '').slice(0, 30))}</td><td>${esc(i.tel || '')}</td><td>${i.home ? `<a href="${esc(i.home)}" target="_blank" rel="noopener noreferrer">↗</a>` : ''}</td><td class="n">${peopleOfCo(n).length}</td><td class="n">${carsOfCo(n).length}</td><td class="n">${nf(vs.length)}</td><td class="c">${vs[0] ? fmtDs(vs[0].d) : '-'}</td><td class="c">${co.manual ? '<span class="tag" style="--c:#1B7A34">직접</span>' : co.info && co.info.found ? '<span class="tag" style="--c:#2A44D4">인터넷</span>' : '<span class="tag" style="--c:#94A3B8">없음</span>'}</td></tr>`; }).join('')}</tbody></table></div></div></section>`;
  bindLinks($('#p-co'));
  $('#coQ').oninput = e => { V.coQ = e.target.value; clearTimeout(V.cqt); V.cqt = setTimeout(() => { renderCoTab(); const i = $('#coQ'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250); };
  $('#coAdd').onclick = () => { const n = prompt('회사 이름'); if (n && n.trim()) { ensureCo(n.trim()); saveAC(); editCo(n.trim(), false); } };
  $('#coAll').onclick = async () => { const todo = list.filter(n => { const c = coOf(n); return !c || (!c.manual && !(c.info && c.info.found)); }).slice(0, 30); if (!todo.length) return toast('정보가 없는 회사가 없습니다'); let ok = 0; for (let i = 0; i < todo.length; i++) { busy(true, `공개 정보 찾는 중… ${i + 1}/${todo.length}`); try { const info = await lookupCompany(todo[i]); const co = ensureCo(todo[i]); co.tried = true; if (info.found || info.photo) { co.info = info; ok++; queueShare('cos', co.id); } } catch (e) { } } busy(false); saveAC(); toast(`${todo.length}곳 중 ${ok}곳의 공개 정보를 찾았습니다`); renderCoTab(); };
}

/* =====================================================================
 * 🖨 출력
 * ===================================================================== */
function renderReport() {
  const F = curF();
  const R = [
    ['log', '#0B1F8A', '📄 출입 관리대장', '현재 DATA 조회 조건(기간 · 구분 · 부서 · 회사 · 검색어)의 방문자 · 차량 출입 기록부. 결재란 · 요약 · 기록 전체.', ['xlsx', 'docx', 'pdf']],
    ['person', '#2A44D4', '👤 개인별 출입 현황', '방문자별 방문 횟수 · 방문일수 · 첫/최근 방문 · 소속 이력 · 주요 방문부서 · 이용 차량.', ['xlsx', 'docx', 'pdf']],
    ['car', '#1B7A34', '🚗 차량별 출입 현황', '차량별 입차 횟수 · 소속 · 운전자 · 주요 방문부서.', ['xlsx', 'docx', 'pdf']],
    ['co', '#7A2E8E', '🏢 회사 소속 명단 · 출입 현황', '회사별 소속 방문자 · 차량 명단 전부와 출입 건수(동명이인 · 이직자 포함).', ['xlsx', 'docx', 'pdf']],
    ['dept', '#E8750A', '🏷 방문부서별 현황', '부서별 방문 건수 · 방문 회사 · 주요 업무.', ['xlsx', 'docx', 'pdf']],
    ['deck', '#C43E1C', '📊 출입관리 실적 보고(발표자료)', '기간 요약 KPI · 추이 차트 · 회사 · 부서 · 차종 순위 · 출입제한 확인 · 개선 사항. 고객사 월간 보고용.', ['pptx', 'pdf']]
  ];
  $('#p-report').innerHTML = `<div class="filters"><label style="flex:4">출력 범위 (「🗂 DATA 조회 · 관리」의 조건을 그대로 씁니다)<div style="font-weight:600;color:var(--ink);font-size:13.5px;padding:6px 0">${fmtDs(F.from === '2000-01-01' ? '' : F.from)} ~ ${fmtDs(F.to === '2099-12-31' ? '' : F.to)}${F.kind ? ' · ' + (F.kind === 'p' ? '방문자' : '차량') : ''}${F.dept ? ' · ' + esc(F.dept) : ''}${F.co ? ' · ' + esc(F.co) : ''}${F.q ? ' · 「' + esc(F.q) + '」' : ''} — ${nf(queryVisits(F).length)}건</div></label><div class="nav"><button class="btn" id="rgo">조건 바꾸기 →</button></div></div>
  <div class="rgrid">${R.map(r => `<div class="rcard" style="--c:${r[1]}"><h3>${r[2]}</h3><p>${r[3]}</p><div class="row">${r[4].map(k => `<button class="btn ${{ xlsx: 'bx', docx: 'bw', pdf: 'bf', pptx: 'bp' }[k]}" data-r="${r[0]}" data-k="${k}">${{ xlsx: '엑셀', docx: 'Word', pdf: 'PDF', pptx: 'PPT' }[k]}</button>`).join('')}</div></div>`).join('')}
   <div class="rcard" style="--c:#0E7C86"><h3>🪪 방문증 · 개인 · 차량 · 회사 이력서</h3><p>방문증(QR · 유효 일자)과 개인별 · 차량별 · 회사별 상세 이력서는 이름 · 차량번호 · 회사를 눌러 연 상세 화면에서 바로 출력합니다.</p><div class="row"><button class="btn pri" id="rSearch">🔍 통합 검색으로</button></div></div>
   <div class="rcard" style="--c:#475569"><h3>📘 매뉴얼</h3><p>사용자 매뉴얼 · 제작자 관리매뉴얼(Word · PPT · PDF).</p><div class="row"><button class="btn bw" data-man="user">사용자</button>${isAdminUser() ? '<button class="btn bp" data-man="admin">제작자 관리</button>' : ''}</div></div></div>
  <p class="priv">🔒 출력물에는 연락처를 가려 넣습니다(⚙ 설정의 「연락처 가림」 기준). 출력물 바닥글에 「대외비 · 개인정보 포함」이 표시되며, 사내 보관 기준에 따라 관리하세요.</p>`;
  $('#rgo').onclick = () => setTab('data'); $('#rSearch').onclick = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); $('#uq').focus(); };
  $$('[data-r]').forEach(b => b.onclick = () => b.dataset.r === 'deck' ? outDeck(curF(), b.dataset.k) : outView(b.dataset.r, curF(), b.dataset.k));
  $$('[data-man]').forEach(b => b.onclick = () => openManual(b.dataset.man));
}

/* =====================================================================
 * ⚙ 설정 · 연동
 * ===================================================================== */
function renderSet() {
  const c = AC.cfg, H = c.hook || {};
  $('#p-set').innerHTML = `<div class="two">
  <div>
  <section class="card"><h2>🏭 운영 사업장</h2><div class="body"><div class="grid2"><div class="field"><label>에스텍베스트 사업장에서 고르기</label><select id="sSite"><option value="">— 직접 입력 —</option>${['동부', '서부', '남부', '중부'].map(br => `<optgroup label="${br}지사">${SITE_LIST.filter(s => s.br === br).map(s => `<option value="${s.key}" ${c.site.key === s.key ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</optgroup>`).join('')}</select></div>
   <div class="field"><label>사업장 이름</label><input id="sSiteN" value="${esc(c.site.name || '')}"></div></div><button class="btn pri" id="sSiteOk">저장</button><p class="hint">이 기기(보안실 PC · 태블릿)가 출입을 처리하는 사업장입니다. 공유 서버에서는 지사 단위로 권한이 나뉩니다.</p></div></section>
  <section class="card"><h2>🧩 목록 · 항목 커스터마이징</h2><div class="body">
   <div class="grid2">${[['gates', '출입구'], ['depts', '방문부서'], ['purposes', '방문 목적(업무)'], ['vtypes', '차종']].map(([k, n]) => `<div class="field"><label>${n} (한 줄에 하나)</label><textarea id="ls_${k}" rows="5">${esc(c[k].join('\n'))}</textarea></div>`).join('')}</div>
   <h3 style="margin:8px 0 4px;font-size:14px">항목 이름 바꾸기 (사업장 용어에 맞춤)</h3><div class="grid2">${['name', 'co', 'dept', 'host', 'purpose', 'gate', 'badge', 'items', 'plate'].map(k => `<div class="field"><label>${esc({ name: '성명', co: '소속 회사', dept: '방문부서', host: '피방문자(담당)', purpose: '방문 목적(업무)', gate: '출입구', badge: '출입증 번호', items: '반입 물품', plate: '차량번호' }[k])}</label><input id="lb_${k}" value="${esc((c.labels || {})[k] || '')}" placeholder="기본 이름 그대로"></div>`).join('')}</div>
   <div class="row"><label class="row" style="flex-direction:row"><input type="checkbox" id="rq_phone" ${c.required.phone ? 'checked' : ''}> 연락처 필수</label><label class="row" style="flex-direction:row"><input type="checkbox" id="rq_host" ${c.required.host ? 'checked' : ''}> 피방문자 필수</label><label class="row" style="flex-direction:row"><input type="checkbox" id="rq_badge" ${c.required.badge ? 'checked' : ''}> 출입증 번호 필수</label></div>
   <button class="btn pri" id="lsOk" style="margin-top:8px">저장</button></div></section>
  <section class="card" style="--c:#C53A3A"><h2>🔒 개인정보 · 보안</h2><div class="body">
   <label class="row" style="flex-direction:row"><input type="checkbox" id="pvMask" ${c.maskPhone ? 'checked' : ''}> 목록 · 출력물에서 연락처 가림(010-****-1234)</label>
   <div class="grid2" style="margin-top:8px"><div class="field"><label>개인정보 보유기간(년)</label><input type="number" id="pvY" min="1" max="10" value="${c.retainY}"></div><div class="field"><label>화면 자동 잠금(분, 0 = 끔)</label><input type="number" id="pvLock" min="0" max="120" value="${c.lockMin || 0}"></div>
   <div class="field"><label>잠금 비밀번호(PIN, 이 기기만)</label><input type="password" id="pvPin" inputmode="numeric" autocomplete="new-password" placeholder="${SECRET.pinHash ? '설정됨 — 바꾸려면 입력' : '4자리 이상'}"></div></div>
   <div class="row"><button class="btn pri" id="pvOk">저장</button><button class="btn warn" id="pvPurge">보유기간 지난 기록 파기</button></div>
   <p class="hint">· 웹 주소는 검색엔진에 노출되지 않도록 막았습니다(noindex) · 외부 스크립트 · 분석 도구 없음(모두 파일 안에 포함) · 회사 정보 검색에는 회사 이름만 보냅니다 · 웹훅 토큰 · 잠금 PIN은 이 기기에만 저장되어 서버 · 다른 기기로 가지 않습니다 · 공유 서버 표는 직접 조회가 막혀 있고 권한 검사 함수로만 주고받습니다.</p></div></section>
  </div><div>
  <section class="card" style="--c:var(--gr)"><h2>🔌 기존 시스템 연동 (커스터마이징)</h2><div class="body">
   <h3 style="margin:0 0 6px;font-size:14px">① 가져오기 — 기존 출입 · 차량인식(LPR) · 출입카드 · 방문예약 기록(엑셀 · CSV)</h3>
   <div class="row"><input type="file" id="imFile" accept=".xlsx,.csv,.txt"><select id="imProf" style="width:auto"><option value="">저장된 열 맞춤 없음</option>${Object.keys(c.maps || {}).map(k => `<option>${esc(k)}</option>`).join('')}</select></div><div id="imMap"></div>
   <h3 style="margin:12px 0 6px;font-size:14px">② 내보내기 — 기존 시스템이 읽는 형식</h3>
   <div class="row"><button class="btn" id="exCsv">CSV(현재 DATA 조건)</button><button class="btn" id="exXlsx">엑셀(현재 DATA 조건)</button><button class="btn" id="exJson">JSON</button></div>
   <h3 style="margin:12px 0 6px;font-size:14px">③ 웹훅 — 입실 · 퇴실 즉시 기존 시스템으로 전송(POST JSON)</h3>
   <div class="grid2"><div class="field"><label>받는 주소(URL)</label><input id="hkUrl" value="${esc(H.url || '')}" placeholder="https://사내서버/api/visit"></div><div class="field"><label>인증 토큰(이 기기에만 저장)</label><input id="hkTok" type="password" autocomplete="off" placeholder="${SECRET.hookToken ? '설정됨' : 'Bearer 토큰(선택)'}"></div></div>
   <div class="row"><label class="row" style="flex-direction:row"><input type="checkbox" id="hkOn" ${H.on ? 'checked' : ''}> 사용</label><button class="btn pri" id="hkOk">저장</button><button class="btn" id="hkTest">시험 전송</button><span class="hint">${H.last ? '마지막 전송 ' + esc(String(H.last).slice(0, 16).replace('T', ' ')) : ''}${H.err ? ' · 오류 ' + esc(H.err) : ''}</span></div>
   <p class="hint">보내는 값: 일자 · 시각 · 성명 · 회사 · 차량번호 · 부서 · 목적 · 출입구 · 출입증, 연락처는 뒤 4자리만. 사내망(http) 장비는 브라우저 보안 정책상 https 중계가 필요할 수 있습니다.</p>
   <h3 style="margin:12px 0 6px;font-size:14px">④ 서버 수신 — 기존 장비가 공유 서버로 직접 기록을 넣음</h3>
   <p class="hint">제작자 · 관리자가 이 사업장용 수신 토큰을 만들면, 차량번호인식기 · 출입카드 서버가 아래 형식으로 보내 기록이 쌓입니다(토큰은 만들 때 한 번만 보이며 서버에는 암호화 해시만 저장).</p>
   <div class="row"><button class="btn" id="tkNew">🔑 수신 토큰 만들기</button><button class="btn" id="tkPull">☁ 수신 기록 받기</button></div>
   <div class="code" id="tkCode">POST ${esc((window.STAC_AUTH && STAC_AUTH.cfg && STAC_AUTH.cfg.supabaseUrl) || 'https://(서버 주소)')}/rest/v1/rpc/ac_ingest
apikey: (공개 키)   Content-Type: application/json
{"p_token":"(수신 토큰)","p_rows":[{"date":"2026-11-20","time_in":"09:12","plate":"12가3456","name":"","company":"","dept":"","purpose":"납품","gate":"정문"}]}</div>
  </div></section>
  <section class="card"><h2>💾 백업 · 예시 · 공유 서버</h2><div class="body">
   <div class="row"><button class="btn" id="bkOut">⬇ 전체 백업(JSON)</button><label class="btn" for="bkIn">⬆ 복원</label><input type="file" id="bkIn" accept=".json" hidden><button class="btn" id="smIn">예시 자료 넣기</button><button class="btn warn" id="smOut">예시 자료 지우기</button></div>
   <div class="row" style="margin-top:8px"><button class="btn" id="shPush">☁ 이 기기 기록 모두 올리기</button><button class="btn" id="shPull">☁ 서버 기록 받기(전체)</button><span class="hint" id="shSt"></span></div>
   <p class="hint">이 기기 저장: 방문자 ${nf(Object.keys(AC.people).length)}명 · 차량 ${nf(Object.keys(AC.cars).length)}대 · 회사 ${nf(Object.keys(AC.cos).length)}곳 · 출입 ${nf(Object.keys(AC.visits).length)}건 · 약 ${nf(storeBytes() / 1048576, 1)}MB (브라우저 한도 약 5MB — 넘기 전에 공유 서버에 올리고 오래된 기록을 파기하세요)</p></div></section>
  </div></div>`;
  $('#shSt').textContent = $('#shareState') ? $('#shareState').textContent : '';
  $('#sSite').onchange = e => { const s = SITE_LIST.find(x => x.key === e.target.value); if (s) $('#sSiteN').value = s.name; };
  $('#sSiteOk').onclick = () => { const s = SITE_LIST.find(x => x.key === $('#sSite').value); c.site = { key: s ? s.key : 'u_' + norm($('#sSiteN').value), name: $('#sSiteN').value.trim(), br: s ? s.br : (UI.manager && UI.manager.br) || '' }; saveAC(); renderSiteCard(); toast('운영 사업장을 저장했습니다'); };
  $('#lsOk').onclick = () => { ['gates', 'depts', 'purposes', 'vtypes'].forEach(k => { const a = $('#ls_' + k).value.split('\n').map(x => x.trim()).filter(Boolean); if (a.length) c[k] = [...new Set(a)]; }); c.labels = {}; ['name', 'co', 'dept', 'host', 'purpose', 'gate', 'badge', 'items', 'plate'].forEach(k => { const v = $('#lb_' + k).value.trim(); if (v) c.labels[k] = v; }); c.required = { phone: $('#rq_phone').checked, host: $('#rq_host').checked, badge: $('#rq_badge').checked }; saveAC(); toast('저장했습니다'); };
  $('#pvOk').onclick = async () => { c.maskPhone = $('#pvMask').checked; c.retainY = Math.max(1, +$('#pvY').value || 3); c.lockMin = Math.max(0, +$('#pvLock').value || 0); const pin = $('#pvPin').value.trim(); if (pin) { if (pin.length < 4) return toast('PIN은 4자리 이상'); SECRET.pinHash = await sha256(pin); saveSecret(); } if (c.lockMin && !SECRET.pinHash) return toast('자동 잠금을 쓰려면 PIN을 정하세요'); saveAC(); armLock(); toast('저장했습니다'); };
  $('#pvPurge').onclick = () => { if (!confirmBox(`${c.retainY}년보다 오래된 출입 기록과 그 기록에만 있는 방문자 · 차량 정보를 파기할까요? (출입제한 대상은 남김)`)) return; const n = purgeOld(c.retainY); toast(`${nf(n)}건을 파기했습니다`); renderAll(); };
  // 가져오기
  $('#imFile').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { const rows = await readTable(f); showImportMap(rows, f.name); } catch (er) { toast('파일을 읽지 못했습니다: ' + (er.message || er)); } };
  $('#exCsv').onclick = () => outView('log', curF(), 'csv'); $('#exXlsx').onclick = () => outView('log', curF(), 'xlsx');
  $('#exJson').onclick = () => download(new Blob([JSON.stringify(queryVisits(curF()).map(v => exportRow(v)), null, 1)], { type: 'application/json' }), `${fileStamp()}_출입기록.json`);
  $('#hkOk').onclick = () => { c.hook = Object.assign(H, { on: $('#hkOn').checked, url: $('#hkUrl').value.trim() }); const t = $('#hkTok').value.trim(); if (t) { SECRET.hookToken = t; saveSecret(); } if (c.hook.url && !/^https?:\/\//.test(c.hook.url)) return toast('주소는 https:// 로 시작해야 합니다'); saveAC(); toast('저장했습니다'); };
  $('#hkTest').onclick = async () => { const H2 = c.hook; if (!H2.url) return toast('주소를 넣고 저장하세요'); const on = H2.on; H2.on = true; await fireHook('in', { id: 'test', d: today(), tin: nowHM(), name: '시험', co: '시험 회사', plate: '00가0000', dept: '시험', purpose: '연동 시험' }); H2.on = on; saveAC(); toast(H2.err ? '전송 실패: ' + H2.err : '시험 전송했습니다'); renderSet(); };
  $('#tkNew').onclick = async () => { const sb = sbClient(); if (!sb) return toast('로그인 후 사용하세요(제작자 · 관리자)'); const label = prompt('토큰 이름(예: 정문 차량번호인식기)'); if (!label) return; const { data, error } = await sb.rpc('ac_token_create', { p_site: c.site.key || '', p_br: c.site.br || '', p_label: label }); if (error) return toast('만들지 못했습니다: ' + error.message, 5000); openModal(`<h2>🔑 수신 토큰</h2><div class="sub">이 창을 닫으면 다시 볼 수 없습니다. 기존 장비 설정에만 넣고 다른 곳에 공유하지 마세요.</div><div class="code">${esc(data)}</div><div class="mrow"><button class="btn" id="tkCp">복사</button><button class="btn pri" id="mClose">닫기</button></div>`, md => { md.querySelector('#mClose').onclick = closeModal; md.querySelector('#tkCp').onclick = () => copyText(String(data)); }); };
  $('#tkPull').onclick = async () => { const F = rangeOf('m'); const n = await pullShare(F.from, F.to); toast(`서버 기록 ${nf(n)}건을 받았습니다`); renderAll(); };
  $('#bkOut').onclick = () => download(new Blob([JSON.stringify(AC)], { type: 'application/json' }), `${fileStamp()}_출입관리_백업_${safeName(siteName())}.json`);
  $('#bkIn').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const o = JSON.parse(r.result); if (!o.visits) throw new Error('출입관리 백업 파일이 아닙니다'); if (!confirmBox('백업을 합칠까요? (같은 기록은 백업 내용으로 바뀝니다)')) return; ['people', 'cars', 'cos', 'visits'].forEach(k => Object.assign(AC[k], o[k] || {})); saveAC(); toast('복원했습니다'); renderAll(); } catch (er) { toast(er.message); } }; r.readAsText(f); };
  $('#smIn').onclick = () => { const n = loadSample(); toast(`예시 출입 ${n}건을 넣었습니다(가상 자료)`); renderAll(); };
  $('#smOut').onclick = () => { clearSample(); toast('예시 자료를 지웠습니다'); renderAll(); };
  $('#shPush').onclick = async () => { if (!sbClient()) return toast('로그인 후 사용하세요'); busy(true, '올리는 중…'); await pushAllShare(); busy(false); toast(SHARE.ok ? '모두 올렸습니다' : '공유 서버가 준비되지 않았습니다(SQL 실행 필요)'); };
  $('#shPull').onclick = async () => { const n = await pullShare('2000-01-01', '2099-12-31'); toast(`서버 기록 ${nf(n)}건을 받았습니다`); renderAll(); };
}
async function sha256(t) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('stac|' + t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
async function readTable(f) {
  if (/\.xlsx$/i.test(f.name)) { const wb = new ExcelJS.Workbook(); await wb.xlsx.load(await f.arrayBuffer()); const ws = wb.worksheets[0]; const rows = []; ws.eachRow({ includeEmpty: false }, r => rows.push(r.values.slice(1).map(cellStr))); return rows; }
  let t = await f.text(); if (t.charCodeAt(0) === 0xFEFF) t = t.slice(1);
  const sep = (t.split('\n')[0].match(/\t/g) || []).length > (t.split('\n')[0].match(/,/g) || []).length ? '\t' : ',';
  return t.split(/\r?\n/).filter(l => l.trim()).map(l => { const out = []; let cur = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === sep && !q) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map(s => s.trim()); });
}
function showImportMap(rows, fname) {
  const heads = rows[0] || [], prof = $('#imProf').value, map = prof && AC.cfg.maps[prof] ? Object.assign({}, AC.cfg.maps[prof]) : guessMap(heads);
  $('#imMap').innerHTML = `<p class="hint">「${esc(fname)}」 — ${rows.length - 1}행. 각 항목에 해당하는 열을 고르세요(자동으로 맞춘 값 확인).</p><div class="mapgrid">${FIELDS.map(([k, n]) => `<label>${n}<select data-mk="${k}"><option value="">(없음)</option>${heads.map((h, i) => `<option value="${i}" ${map[k] === i || map[k] === String(i) ? 'selected' : ''}>${esc(h || i + 1 + '열')}</option>`).join('')}</select></label>`).join('')}</div>
   <div class="tblw" style="max-height:180px;margin-top:8px"><table class="t" style="min-width:0"><tr>${heads.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${rows.slice(1, 6).map(r => `<tr>${r.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table></div>
   <div class="row" style="margin-top:8px"><input id="imName" placeholder="열 맞춤 이름(예: 정문 LPR)" style="max-width:240px"><button class="btn" id="imSave">열 맞춤 저장</button><button class="btn pri" id="imGo">가져오기 실행</button></div>`;
  const cur = () => { const m = {}; $$('[data-mk]').forEach(s => { if (s.value !== '') m[s.dataset.mk] = +s.value; }); return m; };
  $('#imSave').onclick = () => { const n = $('#imName').value.trim(); if (!n) return toast('이름을 넣으세요'); AC.cfg.maps[n] = cur(); saveAC(); toast('열 맞춤을 저장했습니다 — 다음부터 고르기만 하면 됩니다'); };
  $('#imGo').onclick = () => { const m = cur(); if (m.name == null && m.plate == null) return toast('성명이나 차량번호 열은 꼭 골라야 합니다'); const r = importRows(rows.slice(1), m, fname); toast(`${nf(r.n)}건 가져옴 · 중복 · 빈 줄 ${nf(r.skip)}건 건너뜀`, 4000); renderAll(); };
}

/* =====================================================================
 * 화면 잠금 · 시작
 * ===================================================================== */
function armLock() {
  clearTimeout(V.lockT); const m = AC.cfg.lockMin; if (!m || !SECRET.pinHash) return;
  V.lockT = setTimeout(() => { $('#lockScr').classList.remove('hidden'); $('#lockPin').value = ''; $('#lockPin').focus(); }, m * 60000);
}
function bindLock() {
  ['click', 'keydown', 'touchstart', 'mousemove'].forEach(ev => document.addEventListener(ev, () => { if ($('#lockScr').classList.contains('hidden')) armLock(); }, { passive: true }));
  const go = async () => { if (await sha256($('#lockPin').value) === SECRET.pinHash) { $('#lockScr').classList.add('hidden'); $('#lockErr').textContent = ''; armLock(); } else $('#lockErr').textContent = '비밀번호가 다릅니다'; };
  $('#lockGo').onclick = go; $('#lockPin').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
}
function isAdminUser() { const p = window.STAC_AUTH && STAC_AUTH.profile; return !!(p && ['owner', 'admin'].includes(p.role)); }
function openGuide() { return openManual('user'); }
function openSitePick() { setTab('set'); $('.tabs').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => $('#sSite') && $('#sSite').focus(), 300); }
async function buildSignature(date) {
  try {
    const ff = new FontFace('DancingSig', `url(data:font/woff2;base64,${ASSET.dancing})`); await ff.load(); document.fonts.add(ff);
    const base = await loadImg(ASSET.sigBase);
    const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const txt = `${M[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`, S = 4, cv = document.createElement('canvas'), ctx = cv.getContext('2d');
    ctx.font = `${72 * S}px DancingSig`; const tw = ctx.measureText(txt).width / S, W = Math.ceil(1389 + tw + 24), H = 210;
    cv.width = W * S; cv.height = H * S; ctx.drawImage(base, 0, 0, base.width * S, base.height * S);
    ctx.font = `${72 * S}px DancingSig`; ctx.fillStyle = '#8A1C34'; ctx.fillText(txt, 1389 * S, 138 * S);
    const out = document.createElement('canvas'); out.width = W; out.height = H; const o = out.getContext('2d'); o.imageSmoothingQuality = 'high'; o.drawImage(cv, 0, 0, W, H);
    V.sig = out.toDataURL('image/png'); V.sigPx = W;
  } catch (e) { V.sig = ASSET.sigBase; V.sigPx = 1860; }
}
async function init() {
  buildSites();
  $('#appIcon').src = ASSET.icon; $('#gateLogo').src = ASSET.icon; $('#lockLogo').src = ASSET.icon; $('#heroImg').src = ASSET.heroAnim || ASSET.hero; $('#mainIc').src = ASSET.icon;
  $('#ver').textContent = APP.version;
  $('#mgrCard').onclick = openMgr; $('#qrCard').onclick = openQR; $('#refCard').onclick = openRef; $('#siteCard').onclick = openSitePick; $('#btnGuide').onclick = e => { e.preventDefault(); openGuide(); };
  $$('[data-theme-set]').forEach(b => b.onclick = () => applyTheme(b.dataset.themeSet));
  $$('.tabs button').forEach(b => b.onclick = () => setTab(b.dataset.tab));
  $$('[data-go]').forEach(b => b.onclick = () => { setTab(b.dataset.go); $('.tabs').scrollIntoView({ behavior: 'smooth' }); });
  const mt = () => { $('#mediaRow').classList.toggle('hidden', !!UI.hideMedia); $('#medTog').textContent = UI.hideMedia ? '🎬 사진 · 영상 보기' : '🎬 사진 · 영상 숨기기'; mwShow(!UI.hideMedia); };
  $('#medTog').onclick = () => { UI.hideMedia = !UI.hideMedia; saveUI(); mt(); }; mt();
  if (!UI.F || typeof UI.F !== 'object') UI.F = { per: 'm' };
  applyTheme(UI.theme); renderHeader(); showGate(); mediaInit(); bindSearch(); bindLock(); armLock(); renderAll(); renderShareState();
  window.addEventListener('app-access', () => renderAll());
  window.addEventListener('resize', () => { clearTimeout(V.rt); V.rt = setTimeout(drawCharts, 200); });
  setInterval(() => { renderShareState(); if (SHARE.ok == null && sbClient()) flushShare(); if (UI.tab === 'entry' && !document.activeElement.closest('.fg')) renderTodayList(); renderHeroStats(); }, 30000);
  await buildSignature(kstNow()); $('#sigImg').src = V.sig;
}
window.addEventListener('DOMContentLoaded', init);
