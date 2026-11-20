/* =====================================================================
 * S-Tec Media Wall(통합관리 시스템 메인과 같은 사진 · 영상) · 차트(화면·보고서 공용)
 *  - 5편 연속 재생: 끝나면 자연스럽게 다음 영상(살짝 어두워졌다 밝아짐) · 재생/정지 · 이전/다음 · 음량 · 소리 켜기
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
function mediaUrl(rel) { return location.protocol === 'file:' ? APP.shareUrl + rel : rel; }

/* =====================================================================
 * 차트 — 캔버스에 직접 그림(라이브러리 없음). 화면용(HiDPI)과 보고서용(PNG) 같은 함수
 * ===================================================================== */
const PAL = ['#0B1F8A', '#1B7A34', '#E8750A', '#7A2E8E', '#0E7C86', '#C0392B', '#2F6FD0', '#B8860B'];
function chartColors() { const dark = document.documentElement.getAttribute('data-theme') === 'dark'; return { ink: dark ? '#C9D0E6' : '#2C3554', mute: dark ? '#8F99B6' : '#667089', grid: dark ? '#222B47' : '#E4E8F1', bg: dark ? '#11172B' : '#ffffff' }; }
function prepCanvas(cv, w, h, scale) { const s = scale || window.devicePixelRatio || 1; cv.width = Math.round(w * s); cv.height = Math.round(h * s); const g = cv.getContext('2d'); g.setTransform(s, 0, 0, s, 0, 0); return g; }
function niceMax(v) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }
const FONT = "'Pretendard','Malgun Gothic','맑은 고딕','Apple SD Gothic Neo','Noto Sans KR',sans-serif";
/* 막대(+선) 차트: labels · bars[{name,data,color}] · line{name,data,color,max} */
function drawBar(cv, o) {
  const W = o.w || cv.clientWidth || 600, H = o.h || cv.clientHeight || 260, C = o.colors || chartColors();
  const g = prepCanvas(cv, W, H, o.scale); g.fillStyle = o.print ? '#fff' : C.bg; g.fillRect(0, 0, W, H);
  const L = 46, R = o.line ? 44 : 14, T = o.title ? 34 : 16, B = 40, pw = W - L - R, ph = H - T - B;
  if (o.title) { g.fillStyle = C.ink; g.font = `700 14px ${FONT}`; g.fillText(o.title, L, 20); }
  const n = o.labels.length || 1, stacked = o.stacked, bars = o.bars || [];
  let mx = 0; for (let i = 0; i < n; i++) { const v = stacked ? bars.reduce((a, b) => a + (+b.data[i] || 0), 0) : Math.max(0, ...bars.map(b => +b.data[i] || 0)); mx = Math.max(mx, v); }
  mx = niceMax(mx * 1.08);
  g.strokeStyle = C.grid; g.fillStyle = C.mute; g.font = `11px ${FONT}`; g.textAlign = 'right'; g.lineWidth = 1;
  for (let k = 0; k <= 4; k++) { const y = T + ph - ph * k / 4; g.beginPath(); g.moveTo(L, y); g.lineTo(W - R, y); g.stroke(); g.fillText(shortN(mx * k / 4), L - 6, y + 4); }
  const bw = pw / n, inner = Math.min(46, bw * .72), nb = stacked ? 1 : Math.max(1, bars.length), w1 = inner / nb;
  for (let i = 0; i < n; i++) {
    let acc = 0;
    bars.forEach((b, j) => {
      const v = +b.data[i] || 0, h = v / mx * ph, x = L + bw * i + (bw - inner) / 2 + (stacked ? 0 : j * w1), y = T + ph - h - (stacked ? acc / mx * ph : 0);
      g.fillStyle = b.color || PAL[j % PAL.length]; roundRect(g, x, y, Math.max(2, w1 - (stacked ? 0 : 2)), Math.max(0, h), 3); g.fill(); acc += v;
    });
  }
  g.fillStyle = C.mute; g.textAlign = 'center'; g.font = `11px ${FONT}`;
  const every = Math.ceil(n / Math.max(1, Math.floor(pw / 46)));
  o.labels.forEach((lb, i) => { if (i % every) return; g.fillText(String(lb).slice(0, 8), L + bw * i + bw / 2, H - B + 16); });
  if (o.line) {
    const lm = o.line.max || niceMax(Math.max(1, ...o.line.data.map(x => +x || 0)) * 1.08);
    g.strokeStyle = o.line.color || '#E8750A'; g.lineWidth = 2.4; g.beginPath(); let st = false;
    o.line.data.forEach((v, i) => { if (v == null) return; const x = L + bw * i + bw / 2, y = T + ph - (+v / lm) * ph; st ? g.lineTo(x, y) : g.moveTo(x, y); st = true; }); g.stroke();
    g.fillStyle = o.line.color || '#E8750A'; o.line.data.forEach((v, i) => { if (v == null) return; g.beginPath(); g.arc(L + bw * i + bw / 2, T + ph - (+v / lm) * ph, 3, 0, 7); g.fill(); });
    g.textAlign = 'left'; g.fillStyle = C.mute; for (let k = 0; k <= 4; k++) g.fillText(shortN(lm * k / 4) + (o.line.unit || ''), W - R + 6, T + ph - ph * k / 4 + 4);
  }
  // 범례
  const leg = bars.map((b, j) => [b.name, b.color || PAL[j % PAL.length]]).concat(o.line ? [[o.line.name, o.line.color || '#E8750A']] : []);
  let lx = W - R; g.font = `11.5px ${FONT}`; g.textAlign = 'left';
  leg.slice().reverse().forEach(([nm, c]) => { const tw = g.measureText(nm).width; lx -= tw + 26; g.fillStyle = c; roundRect(g, lx, (o.title ? 11 : 2), 12, 10, 3); g.fill(); g.fillStyle = C.ink; g.fillText(nm, lx + 16, (o.title ? 20 : 11)); });
}
function drawDonut(cv, o) {
  const W = o.w || cv.clientWidth || 320, H = o.h || cv.clientHeight || 260, C = o.colors || chartColors();
  const g = prepCanvas(cv, W, H, o.scale); g.fillStyle = o.print ? '#fff' : C.bg; g.fillRect(0, 0, W, H);
  const tot = o.data.reduce((a, b) => a + (+b.v || 0), 0) || 1, r = Math.min(H * .38, W * .2), cx = r + 24, cy = H / 2 + (o.title ? 8 : 0);
  if (o.title) { g.fillStyle = C.ink; g.font = `700 14px ${FONT}`; g.textAlign = 'left'; g.fillText(o.title, 12, 20); }
  let a0 = -Math.PI / 2;
  o.data.forEach((d, i) => { const a = (+d.v || 0) / tot * Math.PI * 2; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, a0, a0 + a); g.closePath(); g.fillStyle = d.c || PAL[i % PAL.length]; g.fill(); a0 += a; });
  g.beginPath(); g.arc(cx, cy, r * .58, 0, 7); g.fillStyle = o.print ? '#fff' : C.bg; g.fill();
  g.fillStyle = C.ink; g.textAlign = 'center'; g.font = `800 17px ${FONT}`; g.fillText(o.center || shortN(tot), cx, cy + 3); g.font = `11px ${FONT}`; g.fillStyle = C.mute; g.fillText(o.centerSub || '합계', cx, cy + 19);
  g.textAlign = 'left'; let y = cy - o.data.length * 11 + 8; const lx = cx + r + 22;
  o.data.forEach((d, i) => { g.fillStyle = d.c || PAL[i % PAL.length]; roundRect(g, lx, y - 9, 11, 11, 3); g.fill(); g.fillStyle = C.ink; g.font = `12px ${FONT}`; g.fillText(`${d.n}  ${shortN(d.v)} (${Math.round((+d.v || 0) / tot * 100)}%)`, lx + 17, y); y += 22; });
}
function roundRect(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function shortN(v) { v = +v || 0; const a = Math.abs(v); return a >= 1e8 ? (v / 1e8).toFixed(1).replace(/\.0$/, '') + '억' : a >= 1e4 ? (v / 1e4).toFixed(a >= 1e5 ? 0 : 1).replace(/\.0$/, '') + '만' : a >= 1000 ? Math.round(v).toLocaleString('ko-KR') : String(Math.round(v * 10) / 10); }
/* 보고서용 PNG */
function chartPng(kind, o, w = 1000, h = 420) { const cv = document.createElement('canvas'); const opt = Object.assign({}, o, { w, h, scale: 2, print: true, colors: { ink: '#1C2333', mute: '#5B6475', grid: '#E3E7EE', bg: '#fff' } }); (kind === 'donut' ? drawDonut : drawBar)(cv, opt); return cv.toDataURL('image/png'); }

/* =====================================================================
 * S-Tec Media Wall — 통합관리 시스템 메인 화면과 같은 구성(왼쪽 사진 · 오른쪽 영상 · 아래 흐르는 띠)
 *  · 사진·영상은 통합관리 시스템 웹 주소의 media/ 를 함께 씁니다(같은 자료 · 한 곳에서 갱신)
 *  · 사진은 6초마다 크로스페이드 · 영상은 끝나면 다음 영상 · 재생/정지 · 이전/다음 · 소리 · 음량
 *  · 「🎬 사진 · 영상 숨기기」로 접을 수 있음(기억됨)
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const MW_BASE = 'https://sadness500-boop.github.io/S-Tec-Operations-and-Sales-Integrated-Management-System/media/';
const MW = { photos: [], videos: [], cat: 'all', pi: -1, vi: -1, pl: 0, vl: 0, playing: true, timer: null, base: MW_BASE, ready: false, off: 0 };
const MW_CATS = [['all', '전체'], ['근무 영상', '근무 영상'], ['Complaint 사례', 'Complaint 사례']];
const G = id => document.getElementById(id);
async function mediaInit() {
  try { const r = await fetch(MW.base + 'media.json', { cache: 'no-cache', credentials: 'omit', referrerPolicy: 'no-referrer' }); if (!r.ok) throw 0; MW.all = await r.json(); }
  catch (e) { G('mediaRow').classList.add('hidden'); G('medTog').classList.add('hidden'); return; }
  G('mwTabs').innerHTML = MW_CATS.map(c => `<button type="button" data-c="${esc(c[0])}">${esc(c[1])}</button>`).join('');
  G('mwTabs').querySelectorAll('button').forEach(b => b.onclick = () => mwCat(b.dataset.c));
  const vol = +(localStorage.getItem('stac_vol') || 60); G('vdVol').value = vol;
  ['vd0', 'vd1'].forEach(id => { const v = G(id).querySelector('video'); v.volume = vol / 100;
    v.addEventListener('ended', () => { if (v.parentNode.classList.contains('on')) mwVideo(MW.vi + 1); });
    v.addEventListener('timeupdate', () => { if (v.parentNode.classList.contains('on') && v.duration) G('vdBar').style.width = (v.currentTime / v.duration * 100) + '%'; }); });
  G('vdPlay').onclick = () => mwPlay(!MW.playing);
  G('vdPrev').onclick = () => mwVideo(MW.vi - 1); G('vdNext').onclick = () => mwVideo(MW.vi + 1);
  G('vdMute').onclick = () => mwMute(!mwVid().muted);
  G('vdVol').oninput = () => { const x = +G('vdVol').value; try { localStorage.setItem('stac_vol', x); } catch (e) { } ['vd0', 'vd1'].forEach(id => G(id).querySelector('video').volume = x / 100); if (x > 0 && mwVid().muted) mwMute(false); if (x === 0) mwMute(true); };
  G('phPrev').onclick = () => { mwPhoto(MW.pi - 1); mwPhotoTimer(); }; G('phNext').onclick = () => { mwPhoto(MW.pi + 1); mwPhotoTimer(); };
  document.addEventListener('visibilitychange', () => { const v = mwVid(); if (document.hidden) v.pause(); else if (MW.playing && !mwBusy()) v.play().catch(() => { }); });
  new IntersectionObserver(es => es.forEach(e => { const v = mwVid(); if (!e.isIntersecting) v.pause(); else if (MW.playing && !document.hidden && !mwBusy()) v.play().catch(() => { }); }), { threshold: .15 }).observe(G('mwVideo'));
  MW.ready = true; mwCat('all'); mwFlow();
}
const mwBusy = () => !G('mgrGate').classList.contains('hidden') || !G('lockScr').classList.contains('hidden') || G('mediaRow').classList.contains('hidden');
const mwVid = () => G('vd' + MW.vl).querySelector('video');
function mwCat(c) {
  MW.cat = c; G('mwTabs').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.c === c));
  const A = MW.all;
  MW.photos = c === 'all' ? A.photos : A.photos.filter(p => p.g === c);
  MW.videos = c === 'all' ? A.videos : A.videos.filter(v => v.g === c);
  if (!MW.photos.length) MW.photos = A.photos;
  if (!MW.videos.length) MW.videos = A.videos;
  G('mwSub').textContent = `사진 ${MW.photos.length}장 · 영상 ${MW.videos.length}편`;
  mwStrip(); mwPhoto(0); mwPhotoTimer(); mwVideo(0);
}
function mwPhoto(i) {
  const P = MW.photos; if (!P.length) return; i = (i + P.length) % P.length; MW.pi = i; const p = P[i];
  const next = G('ph' + (1 - MW.pl)), cur = G('ph' + MW.pl), url = MW.base + 'photo/' + p.f;
  const img = next.querySelector('img'), bg = next.querySelector('.bgblur');
  const show = () => { bg.style.backgroundImage = `url("${url}")`; img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''; next.classList.add('on'); cur.classList.remove('on'); MW.pl = 1 - MW.pl; };
  img.onload = show; img.onerror = show; img.alt = p.t; img.referrerPolicy = 'no-referrer'; img.src = url;
  G('phG').textContent = p.g; G('phT').textContent = p.t; G('phN').textContent = `${i + 1} / ${P.length}`;
  const nx = P[(i + 1) % P.length]; if (nx) { const pre = new Image(); pre.src = MW.base + 'photo/' + nx.f; }
  mwMark();
}
function mwPhotoTimer() { clearInterval(MW.timer); MW.timer = setInterval(() => { if (!document.hidden && !mwBusy()) mwPhoto(MW.pi + 1); }, 6000); }
function mwVideo(i) {
  const L = MW.videos; if (!L.length) return; i = (i + L.length) % L.length; MW.vi = i; const v = L[i];
  const nextL = G('vd' + (1 - MW.vl)), curL = G('vd' + MW.vl), nv = nextL.querySelector('video'), cv = curL.querySelector('video');
  nv.muted = cv.muted; nv.volume = cv.volume; nv.src = MW.base + 'video/' + v.f; nv.poster = MW.base + 'thumb/' + v.f.replace('.mp4', '.webp');
  nv.currentTime = 0; G('vdBar').style.width = '0%';
  const go = () => { nextL.classList.add('on'); curL.classList.remove('on'); MW.vl = 1 - MW.vl;
    setTimeout(() => { try { cv.pause(); } catch (e) { } }, 1300);
    if (MW.playing && !document.hidden && !mwBusy()) nv.play().catch(() => mwPlayIcon(false)); };
  if (nv.readyState >= 2) go(); else { nv.addEventListener('loadeddata', go, { once: true }); nv.load(); }
  G('vdG').textContent = v.g; G('vdT').textContent = v.t; G('vdN').textContent = `${i + 1} / ${L.length}`;
  mwMark();
}
function mwPlayIcon(on) { G('vdPlay').textContent = on ? '⏸' : '▶'; }
function mwPlay(on) { MW.playing = on; mwPlayIcon(on); const v = mwVid(); if (on) v.play().catch(() => { }); else v.pause(); }
function mwMute(m) { ['vd0', 'vd1'].forEach(id => G(id).querySelector('video').muted = m); G('vdMute').textContent = m ? '🔇' : (+G('vdVol').value > 50 ? '🔊' : '🔉');
  if (!m && +G('vdVol').value === 0) { G('vdVol').value = 40; ['vd0', 'vd1'].forEach(id => G(id).querySelector('video').volume = .4); } }
function mwStrip() {
  const items = [], P = MW.photos, Vd = MW.videos, n = Math.max(P.length, Vd.length);
  for (let k = 0; k < n; k++) { if (P[k]) items.push({ t: 'p', i: k, x: P[k] }); if (Vd[k]) items.push({ t: 'v', i: k, x: Vd[k] }); }
  const html = items.map(o => `<button type="button" class="th" data-t="${o.t}" data-i="${o.i}" title="${esc(o.x.t)}"><img loading="lazy" referrerpolicy="no-referrer" src="${MW.base}thumb/${esc(o.x.f.replace('.mp4', '.webp'))}" alt="${esc(o.x.t)}">${o.t === 'v' ? '<span class="vi">▶ 영상</span>' : ''}</button>`).join('');
  const tr = G('mwTrack'); tr.innerHTML = html + html;
  tr.querySelectorAll('.th').forEach(b => b.onclick = () => { if (b.dataset.t === 'p') { mwPhoto(+b.dataset.i); mwPhotoTimer(); } else { mwVideo(+b.dataset.i); if (!MW.playing) mwPlay(true); } });
  MW.off = 0;
}
function mwMark() { G('mwTrack').querySelectorAll('.th').forEach(b => b.classList.toggle('cur', (b.dataset.t === 'p' && +b.dataset.i === MW.pi) || (b.dataset.t === 'v' && +b.dataset.i === MW.vi))); }
function mwFlow() {
  let last = performance.now(), hover = false; const strip = G('mwStrip');
  strip.addEventListener('mouseenter', () => hover = true); strip.addEventListener('mouseleave', () => hover = false);
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function step(t) { const dt = Math.min(64, t - last); last = t;
    const tr = G('mwTrack'); if (MW.ready && tr && !hover && !reduce && !document.hidden && !mwBusy()) { const half = tr.scrollWidth / 2;
      MW.off += dt * 0.035; if (half > 0 && MW.off >= half) MW.off -= half; tr.style.transform = `translateX(${-MW.off}px)`; }
    requestAnimationFrame(step); }
  requestAnimationFrame(step);
}
function mwShow(on) { if (!MW.ready) return; const v = mwVid(); if (!on) v.pause(); else if (MW.playing && !document.hidden) v.play().catch(() => { }); }
