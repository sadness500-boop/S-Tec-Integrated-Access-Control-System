/* =====================================================================
 * 출력 — 출입 관리대장 · 개인별 · 차량별 · 회사별 · 부서별 현황 · 실적 보고(PPT) · 방문증 (엑셀 · Word · PDF · PPT)
 *  하나의 문서 모델(블록)을 Word와 PDF로, 하나의 슬라이드 모델을 PPT와 PDF로 그립니다.
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const C = { navy: '0B1F8F', navyD: '07124F', green: '1E8B3A', greenD: '17552F', brick: 'E34234', silver: 'C9CED6', silverL: 'EEF1F5', ink: '1C2333', gray: '5B6475', white: 'FFFFFF', tint: 'F4F6FB', tintG: 'EEF7F1', line: 'BFC6D4', amber: 'D98E04' };
const W_FONT = '맑은 고딕';
let OUT_CONF = false;   // 출입 보고서는 「대외비 · 개인정보 포함」 표시
const imgType = src => /^data:image\/png/.test(src) ? 'png' : 'jpg';
const fileStamp = () => { const d = kstNow(); return `${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}`; };
function periodTitle(r) {
  const f = parseD(r.from), t = parseD(r.to);
  if (r.from === r.to) return `${f.getFullYear()}. ${f.getMonth() + 1}. ${f.getDate()}.(${WKK[f.getDay()]})`;
  if (f.getDate() === 1 && t.getDate() === new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate() && f.getMonth() === t.getMonth()) return `( ${f.getMonth() + 1} )월`;
  if (f.getMonth() === 0 && f.getDate() === 1 && t.getMonth() === 11 && t.getDate() === 31) return `${f.getFullYear()}년`;
  return `${fmtDs(f)} ~ ${fmtDs(t)}`;
}

/* =====================================================================
 * 문서 모델 → Word (docx)
 * ===================================================================== */
const DOCW = 9638; // A4 본문 폭(twip): 11906 − 좌우 1134×2
function R(t, o = {}) { return new docx.TextRun({ text: String(t ?? ''), bold: o.bold, size: o.size || 20, color: o.color || C.ink, font: W_FONT, italics: o.it }); }
function P(runs, o = {}) { return new docx.Paragraph({ children: Array.isArray(runs) ? runs : [runs], alignment: o.align, spacing: { before: o.before ?? 0, after: o.after ?? 60, line: o.line || 276 }, keepNext: o.keepNext, pageBreakBefore: o.pb, indent: o.indent }); }
function lineParas(text, o = {}) { const ls = String(text ?? '').split('\n'); return ls.map((l, i) => P([R(l, o)], { after: i === ls.length - 1 ? 0 : 20, align: o.align })); }
function dCell(v, w, o = {}) {
  const ch = v && v.img ? [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.ImageRun({ type: imgType(v.img), data: b64ToU8(dataUrlB64(v.img)), transformation: { width: v.w, height: v.h } })] })]
    : lineParas(v == null || v === '' ? (o.dash === false ? '' : '-') : v, { size: o.size || 18, bold: o.bold, color: o.color, align: o.align });
  return new docx.TableCell({ children: ch, width: { size: w, type: docx.WidthType.DXA }, columnSpan: o.span, rowSpan: o.rowSpan, verticalAlign: docx.VerticalAlign.CENTER,
    shading: o.fill ? { type: docx.ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined, margins: { top: 50, bottom: 50, left: 90, right: 90 } });
}
function dTable(rows, widths, o = {}) {
  const bd = { style: docx.BorderStyle.SINGLE, size: 4, color: C.line };
  return new docx.Table({ rows, width: { size: widths.reduce((a, b) => a + b, 0), type: docx.WidthType.DXA }, columnWidths: widths, layout: docx.TableLayoutType.FIXED, alignment: o.align,
    borders: { top: bd, bottom: bd, left: bd, right: bd, insideHorizontal: bd, insideVertical: bd } });
}
function wOf(ratios, total = DOCW) { const s = ratios.reduce((a, b) => a + b, 0); const w = ratios.map(r => Math.floor(r / s * total)); w[w.length - 1] += total - w.reduce((a, b) => a + b, 0); return w; }
function blocksToDocx(blocks) {
  const out = [], AL = docx.AlignmentType; let pbNext = false;
  blocks.forEach((b, bi) => {
    if (b.k === 'pb') { if (blocks[bi + 1] && blocks[bi + 1].k === 'h') pbNext = true; else out.push(new docx.Paragraph({ children: [new docx.PageBreak()] })); return; }
    if (b.k === 'title') {
      const ap = b.approval ? b.approval : null;
      if (ap) {
        const w = wOf([5.6, .5].concat(ap.map(() => 1)), DOCW);
        out.push(dTable([
          new docx.TableRow({ children: [dCell(b.t, w[0], { size: 34, bold: true, rowSpan: 2, align: AL.CENTER, dash: false }), dCell('결\n재', w[1], { rowSpan: 2, align: AL.CENTER, fill: C.silverL, bold: true })].concat(ap.map((a, i) => dCell(a, w[i + 2], { align: AL.CENTER, fill: C.silverL, bold: true }))) }),
          new docx.TableRow({ height: { value: 700, rule: docx.HeightRule.ATLEAST }, children: ap.map((a, i) => dCell('/', w[i + 2], { align: AL.CENTER, color: C.gray })) })
        ], w));
      } else String(b.t).split('\n').forEach((l, i, a) => out.push(P([R(l, { size: i ? 30 : 34, bold: true, color: C.navy })], { align: AL.CENTER, after: i === a.length - 1 ? 80 : 20 })));
      if (b.sub) out.push(P([R(b.sub, { size: 19, color: C.gray })], { align: AL.CENTER, before: 60, after: 120 }));
      else out.push(P([R('')], { after: 60 }));
      return;
    }
    if (b.k === 'info') { const w = wOf([1.2, 2.2, 1.2, 2.2]); out.push(dTable(b.rows.map(r => new docx.TableRow({ children: [dCell(r[0], w[0], { fill: 'E8F5EC', bold: true, align: AL.CENTER, color: C.greenD }), dCell(r[1], w[1]), dCell(r[2], w[2], { fill: 'E8F5EC', bold: true, align: AL.CENTER, color: C.greenD }), dCell(r[3], w[3])] })), w)); out.push(P([R('')], { after: 80 })); return; }
    if (b.k === 'h') { out.push(P([R(b.t, { size: 23, bold: true, color: C.navy })], { before: pbNext ? 0 : 200, after: 80, keepNext: true, pb: pbNext })); pbNext = false; return; }
    if (b.k === 'h2') { out.push(P([R('■ ' + b.t, { size: 20, bold: true, color: C.greenD })], { before: 120, after: 60, keepNext: true })); return; }
    if (b.k === 'p') { out.push(...lineParas(b.t, { size: b.size || 19, color: b.color })); out.push(P([R('')], { after: 40 })); return; }
    if (b.k === 'box') { const w = [DOCW]; out.push(dTable([new docx.TableRow({ children: [new docx.TableCell({ width: { size: DOCW, type: docx.WidthType.DXA }, shading: { type: docx.ShadingType.CLEAR, color: 'auto', fill: 'EEF7F1' }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, children: [P([R(b.title || '', { bold: true, size: 21, color: C.greenD })], { after: 60 })].concat((b.items || []).map(x => P([R('✔ ', { color: C.green, bold: true, size: 19 }), R(x, { size: 19 })], { after: 30 }))) })] })], w)); out.push(P([R('')], { after: 60 })); return; }
    if (b.k === 'bullets') { b.items.forEach(x => out.push(P([R('• ' + x, { size: 19 })], { after: 30, indent: { left: 200 } }))); return; }
    if (b.k === 'table') {
      const w = wOf(b.w || b.head.map(() => 1)), al = b.align || [];
      const rows = [new docx.TableRow({ tableHeader: true, children: b.head.map((h, i) => dCell(h, w[i], { fill: b.headFill || 'DCE3F3', bold: true, align: AL.CENTER, size: 18 })) })];
      b.rows.forEach(r => {
        if (r && r.cat) { rows.push(new docx.TableRow({ children: [dCell(r.cat, DOCW, { span: b.head.length, bold: true, fill: r.fill || 'EEF1F5', color: r.color || C.navy, size: 18 })] })); return; }
        const tot = r && r.tot; const cells = tot ? r.cells : r;
        rows.push(new docx.TableRow({ children: cells.map((c, i) => dCell(c, w[i], { size: b.size || 17, align: al[i] === 'c' ? AL.CENTER : al[i] === 'r' ? AL.RIGHT : AL.LEFT, bold: tot, fill: tot ? 'F1F3F8' : undefined })) }));
      });
      out.push(dTable(rows, w)); out.push(P([R('')], { after: 60 })); return;
    }
    if (b.k === 'img') { const wIn = b.wIn || 6.6, hIn = wIn * (b.ratio || .42); out.push(new docx.Paragraph({ alignment: AL.CENTER, spacing: { before: 40, after: 40 }, children: [new docx.ImageRun({ type: imgType(b.src), data: b64ToU8(dataUrlB64(b.src)), transformation: { width: wIn * 96, height: hIn * 96 } })] })); if (b.caption) out.push(P([R(b.caption, { size: 16, color: C.gray, it: true })], { align: AL.CENTER, after: 100 })); return; }
    if (b.k === 'photos') {
      const w = wOf([.7, 2.2, 2.2, .9]), iw = 2.1 * 96, ih = 1.45 * 96;
      const rows = [new docx.TableRow({ tableHeader: true, children: ['일자·장소', '작업 전', '작업 후', '비고'].map((h, i) => dCell(h, w[i], { fill: 'DCE3F3', bold: true, align: AL.CENTER })) })];
      b.items.forEach(it => rows.push(new docx.TableRow({ children: [dCell(`${it.date}\n${it.loc || ''}`, w[0], { align: AL.CENTER, size: 16 }), dCell(it.ph1 ? { img: it.ph1, w: iw, h: ih } : '사진 없음', w[1], { align: AL.CENTER, color: C.gray }), dCell(it.ph2 ? { img: it.ph2, w: iw, h: ih } : '사진 없음', w[2], { align: AL.CENTER, color: C.gray }), dCell(it.note, w[3], { size: 16 })] })));
      out.push(dTable(rows, w)); out.push(P([R('')], { after: 60 })); return;
    }
  });
  return out;
}
async function packDocx(children, title) {
  const doc = new docx.Document({ creator: APP.maker, title, description: `${APP.name} ${APP.version}`, styles: { default: { document: { run: { font: W_FONT, size: 20 } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1850, bottom: 1831, left: 1134, right: 1134, header: 1020, footer: 973 } } }, children }] });
  return await applyHeaderFooter(await docx.Packer.toBlob(doc));
}
/* stec-header-footer 표준 머리글(「The Best Choice」 로고 + 진초록·벽돌색 선) · 바닥글(감청 선 + 쪽번호 + 제작자 서명) */
async function applyHeaderFooter(blob) {
  const zip = await JSZip.loadAsync(blob);
  const cx = Math.round(V.sigPx * 2520000 / 1860);
  zip.file('word/stecHeader.xml', HF_HEADER_XML); zip.file('word/stecFooter.xml', HF_FOOTER_XML.replace(/cx="2520000"/g, `cx="${cx}"`));
  zip.file('word/media/stec-header-thebestchoice.png', b64ToU8(dataUrlB64(ASSET.headerTbc)));
  zip.file('word/media/stec-footer-signature.png', b64ToU8(dataUrlB64(V.sig || ASSET.sigBase)));
  const rel = (id, t) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${t}"/></Relationships>`;
  zip.file('word/_rels/stecHeader.xml.rels', rel('rId1', 'media/stec-header-thebestchoice.png')); zip.file('word/_rels/stecFooter.xml.rels', rel('rId2', 'media/stec-footer-signature.png'));
  let ct = await zip.file('[Content_Types].xml').async('string');
  if (!/Extension="png"/i.test(ct)) ct = ct.replace(/(<Types[^>]*>)/, '$1<Default Extension="png" ContentType="image/png"/>');
  if (!/Extension="jpg"/i.test(ct)) ct = ct.replace(/(<Types[^>]*>)/, '$1<Default Extension="jpg" ContentType="image/jpeg"/>');
  [['stecHeader.xml', 'header'], ['stecFooter.xml', 'footer']].forEach(([pt, k]) => { const ov = `<Override PartName="/word/${pt}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${k}+xml"/>`; if (!ct.includes(ov)) ct = ct.replace('</Types>', ov + '</Types>'); });
  zip.file('[Content_Types].xml', ct);
  let rl = await zip.file('word/_rels/document.xml.rels').async('string');
  rl = rl.replace('</Relationships>', '<Relationship Id="rIdStecHdr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="stecHeader.xml"/><Relationship Id="rIdStecFtr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="stecFooter.xml"/></Relationships>');
  zip.file('word/_rels/document.xml.rels', rl);
  let d = await zip.file('word/document.xml').async('string');
  const refs = ['default', 'first', 'even'].map(t => `<w:headerReference w:type="${t}" r:id="rIdStecHdr"/><w:footerReference w:type="${t}" r:id="rIdStecFtr"/>`).join('');
  d = d.replace(/<w:sectPr[^>]*>[\s\S]*?<\/w:sectPr>|<w:sectPr[^>]*\/>/g, s => { s = s.replace(/<w:(header|footer)Reference[^>]*\/>/g, ''); if (/\/>$/.test(s) && !/<\/w:sectPr>/.test(s)) s = s.replace(/\/>$/, '>') + '</w:sectPr>'; return s.replace(/(<w:sectPr[^>]*>)/, '$1' + refs); });
  if (!/xmlns:r=/.test(d.slice(0, 2000))) d = d.replace('<w:document ', '<w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ');
  zip.file('word/document.xml', d);
  return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', compression: 'DEFLATE' });
}

/* =====================================================================
 * 문서 모델 → PDF (A4 세로 · html2canvas + jsPDF) — 블록 단위 쪽 나눔, 긴 표는 행 단위로 나눔
 * ===================================================================== */
const PW = 794, PH = 1123, PM_ = { t: 64, b: 70, l: 58, r: 58 };
const pdfCss = `.pg{width:${PW}px;height:${PH}px;background:#fff;color:#1C2333;font-family:${FONT};position:relative;overflow:hidden;box-sizing:border-box;padding:${PM_.t}px ${PM_.r}px ${PM_.b}px ${PM_.l}px;font-size:12.5px;line-height:1.5}
.pg .hdr{position:absolute;left:${PM_.l}px;right:${PM_.r}px;top:18px;height:26px;border-bottom:3px solid #17552F}.pg .hdr::after{content:"";position:absolute;left:0;right:0;bottom:-6px;border-bottom:1px solid #E34234}.pg .hdr img{height:22px}
.pg .ftr{position:absolute;left:${PM_.l}px;right:${PM_.r}px;bottom:16px;border-top:3px solid #1F4E79;padding-top:4px;display:flex;justify-content:center;align-items:center;font-size:11px;color:#555}.pg .ftr img{position:absolute;right:0;top:6px;height:20px}
.pg h1{white-space:pre-line;font-size:23px;text-align:center;color:#0B1F8F;margin:6px 0 4px}.pg .sub{text-align:center;color:#5B6475;margin-bottom:10px}
.pg h2{font-size:15px;color:#0B1F8F;margin:14px 0 6px}.pg h3{font-size:13px;color:#17552F;margin:10px 0 4px}
.pg table{border-collapse:collapse;width:100%;table-layout:fixed;margin-bottom:8px}.pg td,.pg th{border:1px solid #BFC6D4;padding:4px 6px;font-size:11.5px;vertical-align:middle;word-break:keep-all;overflow-wrap:anywhere;white-space:pre-line}
.pg th{background:#DCE3F3;font-weight:700;text-align:center}.pg td.c{text-align:center}.pg td.r{text-align:right}.pg tr.cat td{background:#EEF1F5;font-weight:700;color:#0B1F8F}.pg tr.tot td{background:#F1F3F8;font-weight:700}
.pg .ik{background:#E8F5EC;color:#17552F;font-weight:700;text-align:center}
.pg .box{background:#EEF7F1;border:1px solid #BFE0C9;border-radius:6px;padding:8px 12px;margin:6px 0 10px}.pg .box b{color:#17552F;display:block;margin-bottom:4px}.pg .box div{margin:2px 0}
.pg .ttl{display:flex;align-items:stretch;border:1px solid #BFC6D4;margin-bottom:8px}.pg .ttl .t{flex:1;display:grid;place-items:center;font-size:22px;font-weight:800}.pg .ttl table{width:auto;margin:0}.pg .ttl td{width:66px;height:22px;text-align:center}
.pg img.ph{width:100%;height:120px;object-fit:cover;display:block}.pg p{margin:2px 0 8px;white-space:pre-line}`;
function blockHtml(b) {
  const e = s => esc(s == null || s === '' ? '-' : s);
  if (b.k === 'title') return b.approval ? `<div class="ttl"><div class="t">${esc(b.t)}</div><table><tr><td rowspan="2" style="width:26px;background:#EEF1F5;font-weight:700">결<br>재</td>${b.approval.map(a => `<td style="background:#EEF1F5;font-weight:700">${esc(a)}</td>`).join('')}</tr><tr>${b.approval.map(() => '<td style="height:44px;color:#999">/</td>').join('')}</tr></table></div>${b.sub ? `<div class="sub">${esc(b.sub)}</div>` : ''}` : `<h1>${esc(b.t)}</h1>${b.sub ? `<div class="sub">${esc(b.sub)}</div>` : ''}`;
  if (b.k === 'info') return `<table>${b.rows.map(r => `<tr><td class="ik" style="width:16%">${e(r[0])}</td><td>${e(r[1])}</td><td class="ik" style="width:16%">${e(r[2])}</td><td>${e(r[3])}</td></tr>`).join('')}</table>`;
  if (b.k === 'h') return `<h2>${esc(b.t)}</h2>`;
  if (b.k === 'h2') return `<h3>■ ${esc(b.t)}</h3>`;
  if (b.k === 'p') return `<p>${esc(b.t)}</p>`;
  if (b.k === 'box') return `<div class="box"><b>${esc(b.title || '')}</b>${(b.items || []).map(x => `<div>✔ ${esc(x)}</div>`).join('')}</div>`;
  if (b.k === 'bullets') return `<div>${b.items.map(x => `<div>• ${esc(x)}</div>`).join('')}</div>`;
  if (b.k === 'img') return `<div style="text-align:center"><img src="${b.src}" style="width:${Math.round((b.wIn || 6.6) / 6.69 * 100)}%"><div style="color:#5B6475;font-size:11px">${esc(b.caption || '')}</div></div>`;
  return '';
}
function tableParts(b) {
  const s = (b.w || b.head.map(() => 1)).reduce((a, x) => a + x, 0), al = b.align || [];
  const head = `<colgroup>${(b.w || b.head.map(() => 1)).map(x => `<col style="width:${x / s * 100}%">`).join('')}</colgroup><tr>${b.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>`;
  const rows = b.rows.map(r => r && r.cat ? `<tr class="cat"><td colspan="${b.head.length}">${esc(r.cat)}</td></tr>` : `<tr class="${r && r.tot ? 'tot' : ''}">${(r.tot ? r.cells : r).map((c, i) => `<td class="${al[i] || ''}">${esc(c == null || c === '' ? '-' : c)}</td>`).join('')}</tr>`);
  return { head, rows };
}
function photoParts(b) { return { head: `<colgroup><col style="width:13%"><col style="width:36%"><col style="width:36%"><col style="width:15%"></colgroup><tr><th>일자·장소</th><th>작업 전</th><th>작업 후</th><th>비고</th></tr>`, rows: b.items.map(it => `<tr><td class="c">${esc(it.date)}<br>${esc(it.loc || '')}</td><td>${it.ph1 ? `<img class="ph" src="${it.ph1}">` : '<div style="height:120px;display:grid;place-items:center;color:#999">사진 없음</div>'}</td><td>${it.ph2 ? `<img class="ph" src="${it.ph2}">` : '<div style="height:120px;display:grid;place-items:center;color:#999">사진 없음</div>'}</td><td>${esc(it.note || '')}</td></tr>`) }; }
async function blocksToPdf(blocks, name) {
  const host = $('#render'); host.innerHTML = `<style>${pdfCss}</style>`;
  const pages = []; let pg, inner;
  const newPage = () => { pg = document.createElement('div'); pg.className = 'pg'; pg.innerHTML = `<div class="hdr"><img src="${ASSET.headerTbc}"></div><div class="ftr">${OUT_CONF ? '<span style="position:absolute;left:0;top:7px;font-size:9.5px;color:#B3261E;font-weight:700">대외비 · 개인정보 포함</span>' : ''}- ${pages.length + 1} -<img src="${V.sig || ASSET.sigBase}"></div>`; inner = document.createElement('div'); pg.appendChild(inner); host.appendChild(pg); pages.push(pg); };
  const limit = PH - PM_.t - PM_.b;
  const fits = () => inner.scrollHeight <= limit;
  newPage();
  for (const b of blocks) {
    if (b.k === 'pb') { if (inner.childNodes.length) newPage(); continue; }
    if (b.k === 'table' || b.k === 'photos') {
      const parts = b.k === 'table' ? tableParts(b) : photoParts(b);
      const mk = () => { const t = document.createElement('table'); t.innerHTML = parts.head; inner.appendChild(t); return t; };
      let t = mk(); if (!fits()) { t.remove(); newPage(); t = mk(); }
      for (const row of parts.rows) { const tb = document.createElement('tbody'); tb.innerHTML = row; t.appendChild(tb); if (b.k === 'photos') await Promise.all([...tb.querySelectorAll('img')].map(i => i.decode ? i.decode().catch(() => { }) : 0)); if (!fits()) { tb.remove(); newPage(); t = mk(); t.appendChild(tb); } }
      continue;
    }
    const d = document.createElement('div'); d.innerHTML = blockHtml(b); inner.appendChild(d);
    await Promise.all([...d.querySelectorAll('img')].map(i => i.decode ? i.decode().catch(() => { }) : 0));
    if (!fits() && inner.childNodes.length > 1) { d.remove(); newPage(); inner.appendChild(d); }
  }
  const { jsPDF } = window.jspdf; const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [PW, PH], compress: true, hotfixes: ['px_scaling'] });
  for (let i = 0; i < pages.length; i++) {
    busy(true, `PDF 만드는 중… ${i + 1}/${pages.length}쪽`);
    const cv = await html2canvas(pages[i], { scale: 1.6, backgroundColor: '#ffffff', logging: false });
    if (i) pdf.addPage([PW, PH], 'portrait'); pdf.addImage(cv.toDataURL('image/jpeg', .88), 'JPEG', 0, 0, PW, PH);
  }
  host.innerHTML = ''; pdf.setProperties({ title: name, creator: `${APP.name} — ${APP.maker}` });
  return pdf.output('blob');
}


const SW = 13.333, SH = 7.5;
function T(x, y, w, h, text, o = {}) { return Object.assign({ t: 'text', x, y, w, h, text: String(text ?? '') }, o); }
function Rc(x, y, w, h, fill, o = {}) { return Object.assign({ t: 'rect', x, y, w, h, fill }, o); }
function Im(x, y, w, h, src, o = {}) { return Object.assign({ t: 'img', x, y, w, h, src }, o); }
function Tb(x, y, w, rows, colW, o = {}) { return Object.assign({ t: 'table', x, y, w, rows, colW }, o); }
function slideBase(title, no, sub) {
  return [Rc(0, 0, SW, .9, 'FFFFFF'), Rc(0, .86, SW, .05, C.greenD), Rc(0, .91, SW, .02, C.brick), Rc(.45, .22, .12, .5, C.green),
    T(.7, .14, 9.8, .66, title, { size: 24, bold: true, color: C.navy, valign: 'middle' }), sub ? T(8.4, .2, 4.5, .55, sub, { size: 11, color: C.gray, align: 'right', valign: 'middle' }) : null,
    Rc(0, SH - .38, SW, .38, C.silverL), T(.45, SH - .36, 7, .34, 'S-Tec Group co. Ltd All rights Reserved. · S-Tec Integrated Access Control System · 대외비', { size: 9, color: C.gray, it: true, valign: 'middle' }),
    T(SW - 1.4, SH - .36, 1, .34, String(no), { size: 10, color: C.gray, align: 'right', valign: 'middle' }), Im(SW - 2.95, SH - .345, 1.45, .3, ASSET.logo, { contain: true })].filter(Boolean);
}
function tblRows(head, rows, o = {}) {
  const H = head.map(h => ({ text: h, fill: o.headFill || C.navy, color: 'FFFFFF', bold: true, align: 'center' }));
  return [H].concat(rows.map((r, i) => r.cat ? [{ text: r.cat, fill: 'EEF1F5', bold: true, color: C.navy, colspan: head.length }] : (r.tot ? r.cells : r).map((c, j) => ({ text: c == null || c === '' ? '-' : String(c), fill: r.tot ? 'F1F3F8' : i % 2 ? 'F7F9FC' : 'FFFFFF', bold: !!r.tot, align: (o.align || [])[j] === 'r' ? 'right' : (o.align || [])[j] === 'c' ? 'center' : 'left' }))));
}

/* 슬라이드 → PPT */
async function slidesToPptx(S, name) {
  const pptx = new PptxGenJS(); pptx.layout = 'LAYOUT_WIDE'; pptx.author = APP.maker; pptx.company = APP.org; pptx.title = name;
  const dims = {}; const dim = async src => dims[src] || (dims[src] = await loadImg(src).then(i => [i.naturalWidth, i.naturalHeight]).catch(() => [1, 1]));
  for (const els of S) {
    const sl = pptx.addSlide(); sl.background = { color: 'FFFFFF' };
    for (const e of els) {
      if (e.t === 'rect') sl.addShape(e.r ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, { x: e.x, y: e.y, w: e.w, h: e.h, fill: { color: e.fill, transparency: e.alpha != null ? Math.round((1 - e.alpha) * 100) : 0 }, line: e.line ? { color: e.line, width: .75 } : { type: 'none' }, rectRadius: e.r || 0 });
      else if (e.t === 'text') sl.addText(e.text, { x: e.x, y: e.y, w: e.w, h: e.h, fontFace: W_FONT, fontSize: e.size || 14, bold: !!e.bold, italic: !!e.it, color: e.color || C.ink, align: e.align || 'left', valign: e.valign || 'top', margin: 2, lineSpacingMultiple: e.line || 1.1, fit: 'shrink' });
      else if (e.t === 'img' && e.src) { const [iw, ih] = await dim(e.src); const o = { data: e.src, x: e.x, y: e.y, w: e.w, h: e.h }; if (e.contain) { const s = Math.min(e.w / iw, e.h / ih); o.w = iw * s; o.h = ih * s; o.x = e.x + (e.w - o.w) / 2; o.y = e.y + (e.h - o.h) / 2; } else if (e.cover) o.sizing = { type: 'cover', w: e.w, h: e.h }; if (e.alpha != null) o.transparency = Math.round((1 - e.alpha) * 100); sl.addImage(o); }
      else if (e.t === 'table') sl.addTable(e.rows.map(row => row.map(c => ({ text: c.text, options: { fill: { color: c.fill || 'FFFFFF' }, color: c.color || C.ink, bold: !!c.bold, align: c.align || 'left', valign: 'middle', colspan: c.colspan, fontFace: W_FONT, fontSize: e.size || 11 } }))), { x: e.x, y: e.y, w: e.w, colW: e.colW, rowH: e.rowH, border: { type: 'solid', color: 'BFC6D4', pt: .5 }, margin: .04, autoPage: false });
    }
    sl.addNotes(`${APP.name} ${APP.version} — Designed & Developed by Rat Rae Choi`);
  }
  return await pptx.write({ outputType: 'blob' });
}
/* 슬라이드 → PDF (16:9) */
function slideDom(els) {
  const d = document.createElement('div'); d.style.cssText = `position:relative;width:${SW * 96}px;height:${SH * 96}px;background:#fff;overflow:hidden;font-family:${FONT}`;
  els.forEach(e => {
    const s = `position:absolute;left:${e.x * 96}px;top:${e.y * 96}px;width:${e.w * 96}px;${e.h ? `height:${e.h * 96}px;` : ''}`;
    if (e.t === 'rect') d.insertAdjacentHTML('beforeend', `<div style="${s}background:#${e.fill};${e.line ? `border:1px solid #${e.line};` : ''}border-radius:${(e.r || 0) * 96}px;opacity:${e.alpha ?? 1}"></div>`);
    else if (e.t === 'text') d.insertAdjacentHTML('beforeend', `<div style="${s}display:flex;flex-direction:column;justify-content:${e.valign === 'middle' ? 'center' : 'flex-start'};text-align:${e.align || 'left'};font-size:${(e.size || 14) * 1.333}px;font-weight:${e.bold ? 800 : 400};font-style:${e.it ? 'italic' : 'normal'};color:#${e.color || C.ink};line-height:${(e.line || 1.1) * 1.18};white-space:pre-wrap;overflow:hidden">${esc(e.text)}</div>`);
    else if (e.t === 'img' && e.src) d.insertAdjacentHTML('beforeend', `<img src="${e.src}" style="${s}object-fit:${e.contain ? 'contain' : 'cover'};opacity:${e.alpha ?? 1}">`);
    else if (e.t === 'table') { const tw = e.colW.reduce((a, b) => a + b, 0); d.insertAdjacentHTML('beforeend', `<table style="${s}border-collapse:collapse;table-layout:fixed;font-size:${(e.size || 11) * 1.333}px"><colgroup>${e.colW.map(w => `<col style="width:${w / tw * 100}%">`).join('')}</colgroup>${e.rows.map((row, ri) => `<tr style="${e.rowH && e.rowH[ri] ? `height:${e.rowH[ri] * 96}px` : ''}">${row.map(c => `<td ${c.colspan ? `colspan="${c.colspan}"` : ''} style="border:1px solid #BFC6D4;padding:3px 6px;background:#${c.fill || 'FFFFFF'};color:#${c.color || C.ink};font-weight:${c.bold ? 700 : 400};text-align:${c.align || 'left'};vertical-align:middle;white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere">${esc(c.text)}</td>`).join('')}</tr>`).join('')}</table>`); }
  });
  return d;
}
async function slidesToPdf(S, name) {
  const { jsPDF } = window.jspdf; const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: [SW, SH], compress: true }); const host = $('#render');
  for (let i = 0; i < S.length; i++) {
    busy(true, `PDF 만드는 중… ${i + 1}/${S.length}장`);
    host.innerHTML = ''; const d = slideDom(S[i]); host.appendChild(d); await Promise.all([...d.querySelectorAll('img')].map(im => im.decode ? im.decode().catch(() => { }) : 0));
    const cv = await html2canvas(d, { scale: 1.4, backgroundColor: '#ffffff', logging: false }); if (i) pdf.addPage([SW, SH], 'landscape'); pdf.addImage(cv.toDataURL('image/jpeg', .86), 'JPEG', 0, 0, SW, SH);
  }
  host.innerHTML = ''; pdf.setProperties({ title: name, creator: `${APP.name} — ${APP.maker}` }); return pdf.output('blob');
}

const XL = { navy: 'FF0B1F8F', green: 'FF1E8B3A', head: 'FFDCE3F3', cat: 'FFEEF1F5', tot: 'FFF1F3F8', ik: 'FFE8F5EC' };
function xlBorder(c) { const b = { style: 'thin', color: { argb: 'FFBFC6D4' } }; c.border = { top: b, left: b, bottom: b, right: b }; }
function xlHead(ws, rowNo, vals, fill = XL.head) { const r = ws.getRow(rowNo); vals.forEach((v, i) => { const c = r.getCell(i + 1); c.value = v; c.font = { bold: true, name: W_FONT, size: 10, color: { argb: fill === XL.navy ? 'FFFFFFFF' : 'FF1C2333' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } }; c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; xlBorder(c); }); r.height = 30; }
function xlRow(ws, rowNo, vals, o = {}) { const r = ws.getRow(rowNo); vals.forEach((v, i) => { const c = r.getCell(i + 1); c.value = v; c.font = { name: W_FONT, size: 10, bold: !!o.bold }; if (o.fill) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: o.fill } }; c.alignment = { vertical: 'middle', wrapText: true, horizontal: typeof v === 'number' ? 'right' : (o.center || []).includes(i) ? 'center' : 'left' }; if (typeof v === 'number') c.numFmt = Number.isInteger(v) ? '#,##0' : '#,##0.0'; xlBorder(c); }); return r; }
function xlTitle(ws, t, sub, span) { ws.mergeCells(1, 1, 1, span); const c = ws.getCell(1, 1); c.value = t; c.font = { bold: true, size: 16, name: W_FONT, color: { argb: XL.navy } }; c.alignment = { horizontal: 'center', vertical: 'middle' }; ws.getRow(1).height = 30; ws.mergeCells(2, 1, 2, span); const s = ws.getCell(2, 1); s.value = sub; s.font = { size: 10, name: W_FONT, color: { argb: 'FF5B6475' } }; s.alignment = { horizontal: 'center' }; }
async function xlSave(wb, name) { wb.creator = APP.maker; wb.company = APP.org; const buf = await wb.xlsx.writeBuffer(); await download(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), name); }

/* =====================================================================
 * 출입관리 출력 — 표 모델 하나를 엑셀 · Word · PDF · PPT · CSV로
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const KIND_T = v => v.pid && v.cid ? '방문자+차량' : v.cid ? '차량' : '방문자';
const rangeTxt = F => `${fmtDs(F.from === '2000-01-01' ? (queryVisits(F).slice(-1)[0] || {}).d : F.from)} ~ ${fmtDs(F.to === '2099-12-31' ? today() : F.to)}`;
const condTxt = F => [F.kind ? (F.kind === 'p' ? '방문자' : '차량') : '', F.dept ? L('dept') + ' ' + F.dept : '', F.co ? F.co : '', F.purpose || '', F.q ? `검색 「${F.q}」` : '', F.state === 'in' ? '구내 체류' : F.state === 'out' ? '퇴실' : ''].filter(Boolean).join(' · ') || '전체';
function viewModel(view, F) {
  const list = queryVisits(F), S = summary(list), M = { list, S, F };
  if (view === 'log') Object.assign(M, { title: '출입 관리대장', head: ['No', '일자', '입실', '퇴실', '구분', L('name'), '연락처', L('plate'), L('co'), L('dept'), L('host'), L('purpose'), L('gate'), L('badge'), '비고'], rows: list.map((v, i) => [i + 1, fmtDs(v.d), v.tin, v.tout || (v.out ? '' : '구내'), KIND_T(v), v.name || '', maskPhone(v.phone), v.plate || '', v.co || '', v.dept || '', v.host || '', v.purpose || '', v.gate || '', v.badge || '', [v.banHit ? '출입제한 확인' : '', v.items, v.note].filter(Boolean).join(' / ')]), pick: [0, 1, 2, 3, 4, 5, 7, 8, 9, 11, 13], w: [.45, 1, .6, .6, .8, .9, 1.1, 1.4, .95, 1.2, .7], align: ['c', 'c', 'c', 'c', 'c', '', 'c', '', '', '', 'c'] });
  if (view === 'person') { const G = groupBy(list.filter(v => v.pid), v => v.pid); Object.assign(M, { title: '개인별 출입 현황', head: ['순', L('name'), '현재 소속', '방문 당시 소속(이력)', '연락처', '방문(회)', '방문일수', '첫 방문', '최근 방문', '주요 방문부서', '이용 차량'], rows: G.map((g, i) => { const p = AC.people[g.k] || {}; return [i + 1, (p.name || g.list[0].name) + (p.ban && p.ban.on ? ' ⛔' : ''), p.company || '', Object.keys(g.cos).join(' → '), maskPhone(p.phone), g.n, g.days.size, fmtDs(g.first), fmtDs(g.last), topOf(g.depts), carsOfPerson(g.k).map(c => c.plate).join(', ')]; }), pick: [0, 1, 2, 3, 5, 6, 7, 8, 9], w: [.4, .9, 1.3, 1.6, .6, .6, .9, .9, 1.6], align: ['c', '', '', '', 'r', 'r', 'c', 'c', ''] }); }
  if (view === 'car') { const G = groupBy(list.filter(v => v.cid), v => v.cid); Object.assign(M, { title: '차량별 출입 현황', head: ['순', L('plate'), '차종 · 모델', '현재 소속', '방문 당시 소속', '입차(회)', '방문일수', '첫 방문', '최근 방문', '주요 방문부서', '운전자'], rows: G.map((g, i) => { const c = AC.cars[g.k] || {}; return [i + 1, (c.plate || g.list[0].plate) + (c.ban && c.ban.on ? ' ⛔' : ''), [c.type, c.model].filter(Boolean).join(' · '), c.company || '', Object.keys(g.cos).join(' → '), g.n, g.days.size, fmtDs(g.first), fmtDs(g.last), topOf(g.depts), peopleOfCar(g.k).map(p => p.name).join(', ')]; }), pick: [0, 1, 2, 3, 5, 6, 8, 9, 10], w: [.4, 1.1, 1.2, 1.3, .6, .6, .9, 1.5, 1], align: ['c', 'c', '', '', 'r', 'r', 'c', '', ''] }); }
  if (view === 'co') { const G = groupBy(list, v => norm(v.co), v => v.co); const rows = []; G.forEach(g => { const ppl = groupBy(g.list.filter(v => v.pid), v => v.pid), cars = groupBy(g.list.filter(v => v.cid), v => v.cid); rows.push({ cat: `🏢 ${g.label} — 출입 ${g.n}건 · 방문자 ${ppl.length}명 · 차량 ${cars.length}대 · ${fmtDs(g.first)} ~ ${fmtDs(g.last)}` }); ppl.forEach(x => { const p = AC.people[x.k] || {}; rows.push(['방문자', p.name || x.list[0].name, p.title || '', norm(p.company) === norm(g.label) ? '현 소속' : '→ ' + (p.company || ''), maskPhone(p.phone), x.n, fmtDs(x.last), topOf(x.depts, 2)]); }); cars.forEach(x => { const c = AC.cars[x.k] || {}; rows.push(['차량', c.plate || x.list[0].plate, c.type || '', norm(c.company) === norm(g.label) ? '현 소속' : '→ ' + (c.company || ''), '', x.n, fmtDs(x.last), topOf(x.depts, 2)]); }); }); Object.assign(M, { title: '회사 소속 명단 · 출입 현황', head: ['구분', '성명 / 차량번호', '직위 · 차종', '현재 소속', '연락처', '방문(회)', '최근 방문', '주요 방문부서'], rows, groups: G.length, w: [.7, 1.2, .9, 1.2, 1.1, .7, .9, 1.7], align: ['c', '', '', '', 'c', 'r', 'c', ''] }); }
  if (view === 'dept') { const G = groupBy(list, v => v.dept || '(미기재)'); Object.assign(M, { title: `${L('dept')}별 출입 현황`, head: ['순', L('dept'), '출입', '방문자', '차량', '방문 회사 수', '주요 방문 회사', '주요 업무', '최근 방문'], rows: G.map((g, i) => { const pu = {}; g.list.forEach(v => v.purpose && (pu[v.purpose] = (pu[v.purpose] || 0) + 1)); return [i + 1, g.k, g.n, g.list.filter(v => v.pid).length, g.list.filter(v => v.cid).length, Object.keys(g.cos).length, topOf(g.cos), topOf(pu), fmtDs(g.last)]; }), w: [.4, 1.2, .6, .6, .6, .7, 2.2, 1.8, .9], align: ['c', '', 'r', 'r', 'r', 'r', '', '', 'c'] }); }
  if (view === 'period') { const byM = F.per === 'a' || F.per === 'y' || (parseD(F.to) - parseD(F.from)) / 864e5 > 62; const G = groupBy(list, v => byM ? v.d.slice(0, 7) : v.d).sort((a, b) => a.k.localeCompare(b.k)); Object.assign(M, { byM, G, title: `기간별(${byM ? '월별' : '일별'}) 출입 현황`, head: [byM ? '월' : '일자', '출입', '방문자', '차량', '실인원', '방문 회사', '주요 방문부서', '주요 회사'], rows: G.map(g => [byM ? g.k.replace('-', '.') : fmtD(g.k), g.n, g.list.filter(v => v.pid).length, g.list.filter(v => v.cid).length, new Set(g.list.map(v => v.pid).filter(Boolean)).size, Object.keys(g.cos).length, topOf(g.depts), topOf(g.cos)]), w: [1.1, .6, .6, .6, .6, .7, 2, 2], align: ['c', 'r', 'r', 'r', 'r', 'r', '', ''] }); }
  return M;
}
const pickCols = (M, r) => M.pick ? M.pick.map(i => r[i]) : r;
function summaryBox(S, F) {
  return [`기간 ${rangeTxt(F)} · 조건: ${condTxt(F)}`, `출입 ${nf(S.n)}건 — 방문자 ${nf(S.p)}명(실인원 ${nf(S.ppl)}명) · 차량 ${nf(S.v)}대(실대수 ${nf(S.cars)}대)`, `방문 회사 ${nf(S.cos)}곳 · 방문부서 ${nf(S.depts)}곳 · 기록 일수 ${nf(S.days)}일${S.inside ? ` · 퇴실 미처리 ${S.inside}건` : ''}${S.ban ? ` · 출입제한 확인 ${S.ban}건` : ''}`];
}
function chartForPeriod(F, w = 1270, h = 520) {
  const list = queryVisits(F), byM = F.per === 'a' || F.per === 'y' || (parseD(F.to === '2099-12-31' ? today() : F.to) - parseD(F.from === '2000-01-01' ? (list.slice(-1)[0] || { d: today() }).d : F.from)) / 864e5 > 62;
  const G = groupBy(list, v => byM ? v.d.slice(0, 7) : v.d).sort((a, b) => a.k.localeCompare(b.k)).slice(-31);
  return chartPng('bar', { title: `${byM ? '월별' : '일별'} 출입 추이 (방문자 · 차량)`, labels: G.map(g => byM ? g.k.slice(2).replace('-', '.') : g.k.slice(5).replace('-', '/')), bars: [{ name: '방문자', data: G.map(g => g.list.filter(v => v.pid).length), color: '#2A44D4' }, { name: '차량', data: G.map(g => g.list.filter(v => v.cid).length), color: '#22A04A' }], stacked: true }, w, h);
}
function viewBlocks(view, F) {
  const M = viewModel(view, F), mg = UI.manager || {};
  const B = [{ k: 'title', t: M.title, approval: ['담 당', '반 장', '소 장'], sub: `${siteName()} · ${rangeTxt(F)}` },
    { k: 'info', rows: [['사업장', siteName(), '사업장 유형', siteTypeName()], ['작성일', fmtD(today()), '작성자', [mg.name, mg.title].filter(Boolean).join(' ') || '-'], ['조회 조건', condTxt(F), '구분', '대외비 · 개인정보 포함']] },
    { k: 'box', title: '요약', items: summaryBox(M.S, F) }];
  if (view === 'period' || view === 'log') B.push({ k: 'img', src: chartForPeriod(F), wIn: 6.6, ratio: 520 / 1270, caption: '▲ 기간 출입 추이' });
  B.push({ k: 'h', t: `■ ${M.title}` });
  B.push({ k: 'table', head: M.pick ? M.pick.map(i => M.head[i]) : M.head, rows: M.rows.map(r => r.cat ? r : pickCols(M, r)), w: M.w, align: M.align, size: 15 });
  B.push({ k: 'p', t: '※ 연락처는 개인정보 보호를 위해 일부 가려 표기했습니다. 이 문서는 대외비이며 출입관리 목적 외 사용 · 외부 반출을 금합니다.', size: 16, color: C.gray });
  return { B, M };
}
async function outView(view, F, fmt) {
  const M = viewModel(view, F); if (!M.rows.length) return toast('출력할 기록이 없습니다 — 조건을 확인하세요');
  const nm = `${fileStamp()}_${safeName(siteName())}_${M.title.replace(/[^\w가-힣]+/g, '')}`;
  busy(true, `${M.title} 만드는 중…`); OUT_CONF = true;
  try {
    if (fmt === 'csv') { const head = M.head; const lines = [head].concat(M.rows.filter(r => !r.cat)).map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')); await download(new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), nm + '.csv'); }
    else if (fmt === 'xlsx') {
      const wb = new ExcelJS.Workbook(), ws = wb.addWorksheet(M.title.slice(0, 28)); const n = M.head.length;
      xlTitle(ws, M.title, `${siteName()} · ${rangeTxt(F)} · ${condTxt(F)} · 작성 ${fmtDs(today())} · 대외비(개인정보 포함)`, n);
      summaryBox(M.S, F).forEach((t, i) => { ws.mergeCells(3 + i, 1, 3 + i, n); const c = ws.getCell(3 + i, 1); c.value = '· ' + t; c.font = { name: W_FONT, size: 10, color: { argb: 'FF17552F' } }; });
      xlHead(ws, 7, M.head, XL.navy); let r = 8;
      M.rows.forEach(row => { if (row.cat) { ws.mergeCells(r, 1, r, n); const c = ws.getCell(r, 1); c.value = row.cat; c.font = { bold: true, name: W_FONT, color: { argb: 'FF0B1F8F' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XL.cat } }; r++; return; } xlRow(ws, r++, row, { center: [0] }); });
      ws.columns.forEach((c, i) => c.width = Math.min(34, Math.max(6, ...M.rows.filter(x => !x.cat).slice(0, 300).map(x => String(x[i] ?? '').length * 1.6), String(M.head[i] || '').length * 2)));
      ws.views = [{ state: 'frozen', ySplit: 7 }]; ws.autoFilter = { from: { row: 7, column: 1 }, to: { row: 7, column: n } };
      ws.headerFooter.oddFooter = '&L대외비 · 개인정보 포함&C- &P -&RS-Tec Integrated Access Control System · Rat Rae Choi';
      if (view === 'log' || view === 'period') { const s2 = wb.addWorksheet('요약 · 차트'); s2.getCell('A1').value = '기간 출입 추이'; s2.getCell('A1').font = { bold: true, size: 14, name: W_FONT }; const id = wb.addImage({ base64: chartForPeriod(F), extension: 'png' }); s2.addImage(id, { tl: { col: 0, row: 2 }, ext: { width: 900, height: 368 } }); }
      await xlSave(wb, nm + '.xlsx');
    } else if (fmt === 'docx') { const { B } = viewBlocks(view, F); await download(await packDocx(blocksToDocx(B), nm), nm + '.docx'); }
    else if (fmt === 'pdf') { const { B } = viewBlocks(view, F); await download(await blocksToPdf(B, nm), nm + '.pdf'); }
    else if (fmt === 'pptx') await download(await slidesToPptx(viewSlides(view, F), nm), nm + '.pptx');
    toast(`${M.title}을(를) 만들었습니다`);
  } catch (e) { console.error(e); toast('만들지 못했습니다: ' + (e.message || e), 5000); } finally { busy(false); OUT_CONF = false; }
}
/* ---------- 슬라이드 ---------- */
function coverSlide(title, sub, sub2) {
  return [Rc(0, 0, SW, SH, '0C2350'), Im(SW * .44, 0, SW * .56, SH, ASSET.hero, { cover: true, alpha: .92 }), Rc(.7, 1.3, .14, 1.5, C.green),
    T(1.0, 1.15, 6.6, .5, `${APP.org} · ${siteName()}`, { size: 15, color: 'B9C3EC' }), T(1.0, 1.65, 6.4, 1.5, title, { size: 34, bold: true, color: 'FFFFFF' }), T(1.0, 3.05, 6.4, .5, sub, { size: 15, color: 'D7DEFF' }), sub2 ? T(1.0, 3.5, 6.4, .5, sub2, { size: 12, color: 'B9C3EC' }) : null,
    Tb(1.0, 4.2, 3.2, [[{ text: '결재', fill: 'EEF1F5', bold: true, align: 'center' }, { text: '반 장', fill: 'EEF1F5', bold: true, align: 'center' }, { text: '소 장', fill: 'EEF1F5', bold: true, align: 'center' }], [{ text: '', fill: 'FFFFFF' }, { text: '', fill: 'FFFFFF' }, { text: '', fill: 'FFFFFF' }]], [.8, 1.2, 1.2], { rowH: [.32, .62], size: 11 }),
    Im(1.0, 5.5, 1.1, 1.1, ASSET.icon), T(2.25, 5.55, 5, .5, APP.name, { size: 14, bold: true, color: 'FFFFFF' }), T(2.25, 5.95, 5, .5, '대외비 · 개인정보 포함 — 출입관리 목적 외 사용 금지', { size: 11, color: 'FFB4A9' })].filter(Boolean);
}
function tableSlides(title, head, rows, colW, align, sub, per = 13) {
  const S = []; for (let i = 0; i < Math.max(1, rows.length); i += per) S.push(slideBase(title + (rows.length > per ? ` (${Math.floor(i / per) + 1}/${Math.ceil(rows.length / per)})` : ''), 0, sub).concat([Tb(.45, 1.12, 12.45, tblRows(head, rows.slice(i, i + per), { align }), colW, { size: 10 })]));
  return S;
}
function numberSlides(S) { S.forEach((els, i) => { if (!i) return; const n = els.find(e => e.t === 'text' && e.text === '0'); if (n) n.text = String(i + 1); }); return S; }
function viewSlides(view, F) {
  const M = viewModel(view, F), S = [coverSlide(M.title, rangeTxt(F), condTxt(F))];
  S.push(summarySlide(M, F));
  const head = M.pick ? M.pick.map(i => M.head[i]) : M.head, w = M.w, sum = w.reduce((a, b) => a + b, 0);
  S.push(...tableSlides(M.title, head, M.rows.map(r => r.cat ? r : pickCols(M, r)).slice(0, 260), w.map(x => x / sum * 12.45), M.align, siteName()));
  return numberSlides(S);
}
function summarySlide(M, F) {
  const kp = [['출입 건수', nf(M.S.n) + '건', C.navy], ['방문자', nf(M.S.p) + '명', '2A44D4'], ['차량', nf(M.S.v) + '대', C.green], ['방문 회사', nf(M.S.cos) + '곳', '7A2E8E'], ['방문부서', nf(M.S.depts) + '곳', 'E8750A']];
  const s2 = slideBase('Ⅰ. 출입 실적 요약', 0, siteName()); kp.forEach((k, i) => { const x = .45 + i * 2.5; s2.push(Rc(x, 1.15, 2.35, 1.3, i ? 'FFFFFF' : k[2], { line: i ? 'DCE3F3' : undefined, r: .12 }), T(x + .15, 1.2, 2.1, .35, k[0], { size: 11, bold: true, color: i ? C.gray : 'D7DEFF' }), T(x + .15, 1.55, 2.1, .7, k[1], { size: 24, bold: true, color: i ? k[2] : 'FFFFFF' })); });
  s2.push(Im(.45, 2.7, 7.6, 3.6, chartForPeriod(F, 1520, 720)), Rc(8.3, 2.7, 4.6, 3.6, 'EEF7F1', { r: .1 }), T(8.5, 2.8, 4.3, .4, '요약', { size: 14, bold: true, color: C.greenD }), T(8.5, 3.25, 4.3, 3, summaryBox(M.S, F).map(x => '✔ ' + x).join('\n'), { size: 11.5, line: 1.35 }));
  return s2;
}
/* ---------- 출입관리 실적 보고(발표자료) ---------- */
async function outDeck(F, fmt) {
  const list = queryVisits(F); if (!list.length) return toast('출력할 기록이 없습니다');
  busy(true, '실적 보고 만드는 중…'); OUT_CONF = true;
  try {
    const S = [coverSlide('출입관리 실적 보고', rangeTxt(F), condTxt(F))], Sm = summary(list);
    // 목차
    S.push(slideBase('목 차', 0).concat([Im(.6, 1.3, 4.2, 5.3, ASSET.fig.dio_sec || ASSET.icon, { contain: true }), T(5.4, 1.4, 7.4, 5.4, 'Ⅰ. 출입 실적 요약\nⅡ. 기간 추이 · 시간대 분석\nⅢ. 방문 회사 · 방문부서 순위\nⅣ. 차량 출입 현황(차종 · 다빈도 차량)\nⅤ. 출입 통제 · 보안 활동(출입제한 확인 · 미퇴실)\nⅥ. 개선 사항 및 차월 계획', { size: 19, line: 1.5 })]));
    // 요약
    S.push(summarySlide(viewModel('log', F), F));
    // 시간대 분석
    const hrs = [...Array(24)].map((_, h) => list.filter(v => +String(v.tin).slice(0, 2) === h).length);
    const wk = [...Array(7)].map((_, d) => list.filter(v => parseD(v.d).getDay() === d).length);
    S.push(slideBase('Ⅱ. 시간대 · 요일별 출입', 0, siteName()).concat([Im(.45, 1.15, 6.2, 4.8, chartPng('bar', { title: '입실 시간대(시)', labels: hrs.map((_, h) => String(h)), bars: [{ name: '출입', data: hrs, color: '#2A44D4' }] }, 1240, 960)), Im(6.75, 1.15, 6.15, 4.8, chartPng('bar', { title: '요일별', labels: WKK, bars: [{ name: '출입', data: wk, color: '#1B7A34' }] }, 1230, 960)), T(.45, 6.1, 12.45, .6, `최다 시간대 ${hrs.indexOf(Math.max(...hrs))}시 (${Math.max(...hrs)}건) · 최다 요일 ${WKK[wk.indexOf(Math.max(...wk))]}요일 — 근무 배치 · 출입구 운영 시간 검토 자료로 활용합니다.`, { size: 12, color: C.gray })]));
    // 회사 · 부서 순위
    const gc = groupBy(list, v => norm(v.co), v => v.co).slice(0, 10), gd = groupBy(list, v => v.dept || '(미기재)').slice(0, 10);
    S.push(slideBase('Ⅲ. 방문 회사 · 방문부서 순위 (TOP 10)', 0, siteName()).concat([Tb(.45, 1.15, 6.1, tblRows(['순', '회사', '출입', '방문자', '차량'], gc.map((g, i) => [i + 1, g.label, g.n, new Set(g.list.map(v => v.pid).filter(Boolean)).size, new Set(g.list.map(v => v.cid).filter(Boolean)).size]), { align: ['c', '', 'r', 'r', 'r'] }), [.5, 2.9, .9, .9, .9], { size: 10.5 }), Tb(6.8, 1.15, 6.1, tblRows(['순', L('dept'), '출입', '주요 회사'], gd.map((g, i) => [i + 1, g.k, g.n, topOf(g.cos, 2)]), { align: ['c', '', 'r', ''] }), [.5, 1.6, .8, 3.2], { size: 10.5 })]));
    // 차량
    const cl = list.filter(v => v.cid), vt = {}; cl.forEach(v => { const t = v.vtype || (AC.cars[v.cid] || {}).type || '미기재'; vt[t] = (vt[t] || 0) + 1; });
    const gv2 = groupBy(cl, v => v.cid).slice(0, 10);
    S.push(slideBase('Ⅳ. 차량 출입 현황', 0, siteName()).concat([Im(.45, 1.15, 5.6, 4.7, chartPng('donut', { title: '차종별 입차', data: Object.entries(vt).map(([n, v], i) => ({ n, v, c: PAL[i % PAL.length] })), center: nf(cl.length), centerSub: '입차' }, 1120, 940)), Tb(6.3, 1.15, 6.6, tblRows(['순', '차량번호', '소속', '입차', '최근'], gv2.map((g, i) => [i + 1, (AC.cars[g.k] || {}).plate || g.list[0].plate, (AC.cars[g.k] || {}).company || g.list[0].co, g.n, fmtDs(g.last).slice(5)]), { align: ['c', 'c', '', 'r', 'c'] }), [.5, 1.6, 2.7, .8, 1], { size: 10.5 })]));
    // 보안 활동
    const bans = list.filter(v => v.banHit), longs = list.filter(v => !v.out && v.d < today()), noId = list.filter(v => v.pid && !v.idChk && v.src === 'manual').length;
    S.push(slideBase('Ⅴ. 출입 통제 · 보안 활동', 0, siteName()).concat([Rc(.45, 1.15, 12.45, 1.4, 'FDECEA', { r: .1 }), T(.7, 1.22, 12, .45, '출입제한 대상 확인 · 미퇴실 관리', { size: 15, bold: true, color: 'B3261E' }), T(.75, 1.65, 11.9, .85, `출입제한 대상 확인 후 입실 ${bans.length}건 · 퇴실 미처리(전일 이전) ${longs.length}건 · 신분 확인 미표시 ${noId}건`, { size: 13 }),
      Tb(.45, 2.8, 12.45, tblRows(['일자', '시각', '성명', '차량', '회사', '방문부서', '내용'], (bans.length ? bans.slice(0, 8).map(v => [fmtDs(v.d), v.tin, v.name, v.plate, v.co, v.dept, '출입제한 대상 — 책임자 확인 후 입실']) : [['-', '-', '-', '-', '-', '-', '기간 중 출입제한 대상 입실 없음']])), [1.2, .8, 1.4, 1.5, 2.4, 1.6, 3.55], { size: 10 })]));
    // 개선 · 계획
    S.push(slideBase('Ⅵ. 개선 사항 및 차월 계획', 0, siteName()).concat([Tb(.45, 1.15, 12.45, [[{ text: '구분', fill: C.navy, color: 'FFFFFF', bold: true, align: 'center' }, { text: '내용', fill: C.navy, color: 'FFFFFF', bold: true, align: 'center' }], [{ text: '개선 사항', fill: 'EEF1F5', bold: true, align: 'center' }, { text: `· 다빈도 방문 회사(${gc.slice(0, 3).map(g => g.label).join(', ')}) 사전 등록으로 대기 시간 단축\n· 퇴실 미처리 ${longs.length}건 — 근무 교대 시 구내 체류 점검 의무화\n· 출입증 회수 확인 · 신분 확인 체크 강화` }], [{ text: '차월 계획', fill: 'EEF1F5', bold: true, align: 'center' }, { text: '· 방문 예약(사전 등록) · 차량번호인식 연동 확대\n· 출입제한 대상 목록 고객사와 분기 점검\n· 개인정보 보유기간 경과 기록 정기 파기' }]], [2, 10.45], { size: 13, rowH: [.4, 2, 1.6] })]));
    numberSlides(S);
    const nm = `${fileStamp()}_${safeName(siteName())}_출입관리_실적보고`;
    if (fmt === 'pdf') await download(await slidesToPdf(S, nm), nm + '.pdf'); else await download(await slidesToPptx(S, nm), nm + '.pptx');
    toast('실적 보고를 만들었습니다');
  } catch (e) { console.error(e); toast('만들지 못했습니다: ' + (e.message || e), 5000); } finally { busy(false); OUT_CONF = false; }
}
/* ---------- 개인 · 차량 · 회사 이력서 ---------- */
function histRows(vs) { return vs.map((v, i) => [i + 1, fmtDs(v.d), `${v.tin}~${v.tout || ''}`, v.co || '', v.dept || '', v.purpose || '', v.host || '', [v.plate, v.name].filter(Boolean).join(' / '), v.gate || '']); }
async function outDossier(kind, id, fmt) {
  OUT_CONF = true; busy(true, '이력서 만드는 중…');
  try {
    let B = [], nm;
    if (kind === 'p') {
      const p = AC.people[id], vs = visitsOfPerson(id), h = coHistory(vs), cars = carsOfPerson(id); nm = `${fileStamp()}_개인출입이력_${safeName(p.name)}`;
      B = [{ k: 'title', t: '개인별 출입 이력서', approval: ['담 당', '반 장', '소 장'], sub: `${siteName()} · 작성 ${fmtD(today())}` },
        { k: 'info', rows: [['성명', p.name + (p.title ? ' ' + p.title : ''), '현재 소속', p.company], ['연락처', maskPhone(p.phone) || '-', '이용 차량', cars.map(c => c.plate).join(', ') || '-'], ['누적 방문', `${vs.length}회 · ${new Set(vs.map(v => v.d)).size}일`, '첫/최근 방문', `${vs.length ? fmtDs(vs[vs.length - 1].d) : '-'} / ${vs.length ? fmtDs(vs[0].d) : '-'}`], ['출입 제한', p.ban && p.ban.on ? `지정 — ${p.ban.reason || ''} (${p.ban.at || ''})` : '없음', '동명이인', findPeopleByName(p.name).length > 1 ? `${findPeopleByName(p.name).length - 1}명(연락처 · 소속으로 구분)` : '없음']] },
        { k: 'h', t: '1. 소속 이력 (방문 당시 소속 기준)' }, { k: 'table', head: ['순', '소속 회사', '기간', '방문'], rows: h.map((x, i) => [i + 1, x.co, `${fmtDs(x.from)} ~ ${fmtDs(x.to)}`, x.n + '회']), w: [.5, 3, 3, 1], align: ['c', '', 'c', 'r'] },
        { k: 'h', t: '2. 출입 기록' }, { k: 'table', head: ['No', '일자', '입·퇴실', '당시 소속', L('dept'), L('purpose'), L('host'), '차량', L('gate')], rows: histRows(vs).map(r => { r[7] = r[7].split(' / ')[0]; return r; }), w: [.4, 1, 1, 1.5, 1, 1.2, .8, 1, .7], align: ['c', 'c', 'c', '', '', '', '', 'c', 'c'], size: 15 }];
    } else if (kind === 'v') {
      const c = AC.cars[id], vs = visitsOfCar(id), h = coHistory(vs), ppl = peopleOfCar(id); nm = `${fileStamp()}_차량출입이력_${safeName(c.plate)}`;
      B = [{ k: 'title', t: '차량별 출입 이력서', approval: ['담 당', '반 장', '소 장'], sub: `${siteName()} · 작성 ${fmtD(today())}` },
        { k: 'info', rows: [['차량번호', c.plate, '차종 · 모델', [c.type, c.model, c.color].filter(Boolean).join(' · ') || '-'], ['현재 소속', c.company, '운전자', ppl.map(p => p.name).join(', ') || '-'], ['누적 입차', `${vs.length}회 · ${new Set(vs.map(v => v.d)).size}일`, '출입 제한', c.ban && c.ban.on ? `지정 — ${c.ban.reason || ''}` : '없음']] },
        { k: 'h', t: '1. 소속 이력' }, { k: 'table', head: ['순', '소속 회사', '기간', '입차'], rows: h.map((x, i) => [i + 1, x.co, `${fmtDs(x.from)} ~ ${fmtDs(x.to)}`, x.n + '회']), w: [.5, 3, 3, 1], align: ['c', '', 'c', 'r'] },
        { k: 'h', t: '2. 출입 기록' }, { k: 'table', head: ['No', '일자', '입·퇴차', '당시 소속', L('dept'), L('purpose'), L('host'), '운전자', L('gate')], rows: histRows(vs).map(r => { const v = vs[r[0] - 1]; r[7] = v.name || ''; return r; }), w: [.4, 1, 1, 1.5, 1, 1.2, .8, .9, .7], align: ['c', 'c', 'c', '', '', '', '', '', 'c'], size: 15 }];
    } else {
      const co = ensureCo(id), i = Object.assign({}, co.info || {}, co.manual || {}), vs = visitsOfCo(id), ppl = peopleOfCo(id), cars = carsOfCo(id); nm = `${fileStamp()}_회사출입현황_${safeName(id)}`;
      B = [{ k: 'title', t: '회사별 출입 현황', approval: ['담 당', '반 장', '소 장'], sub: `${co.name} · ${siteName()} · 작성 ${fmtD(today())}` },
        { k: 'info', rows: [['회사명', co.name, '업종', i.ind || '-'], ['주소', i.addr || i.hq || '-', '대표전화', i.tel || '-'], ['대표자', i.ceo || '-', '홈페이지', i.home || '-'], ['소속 방문자', ppl.length + '명', '소속 차량', cars.length + '대'], ['누적 출입', vs.length + '건', '최근 방문', vs[0] ? fmtDs(vs[0].d) : '-']] },
        { k: 'p', t: `※ 회사 기본정보 출처: ${(i.src || ['-']).join(' · ')} — 인터넷 공개 정보로 실제와 다를 수 있습니다.`, size: 16, color: C.gray },
        { k: 'h', t: '1. 소속 방문자 명단' }, { k: 'table', head: ['순', '성명', '직위', '현재 소속', '연락처', '방문', '최근 방문'], rows: ppl.map((p, k) => { const x = visitsOfPerson(p.id); return [k + 1, p.name, p.title || '', norm(p.company) === norm(id) ? '현 소속' : '→ ' + p.company, maskPhone(p.phone), x.filter(v => norm(v.co) === norm(id)).length + '회', x[0] ? fmtDs(x[0].d) : '-']; }), w: [.4, 1, .8, 1.6, 1.3, .7, 1], align: ['c', '', '', '', 'c', 'r', 'c'] },
        { k: 'h', t: '2. 소속 차량 명단' }, { k: 'table', head: ['순', '차량번호', '차종', '모델', '입차', '최근 방문'], rows: cars.map((c, k) => { const x = visitsOfCar(c.id); return [k + 1, c.plate, c.type || '', c.model || '', x.length + '회', x[0] ? fmtDs(x[0].d) : '-']; }), w: [.4, 1.3, 1.2, 1.2, .7, 1], align: ['c', 'c', '', '', 'r', 'c'] },
        { k: 'h', t: '3. 출입 기록(최근 200건)' }, { k: 'table', head: ['No', '일자', '입·퇴실', '성명', '차량', L('dept'), L('purpose'), L('host')], rows: vs.slice(0, 200).map((v, k) => [k + 1, fmtDs(v.d), `${v.tin}~${v.tout || ''}`, v.name || '', v.plate || '', v.dept || '', v.purpose || '', v.host || '']), w: [.4, 1, 1, .9, 1.1, 1, 1.2, .8], align: ['c', 'c', 'c', '', 'c', '', '', ''], size: 15 }];
    }
    B.push({ k: 'p', t: '※ 대외비 · 개인정보 포함 — 출입관리 목적 외 사용 · 외부 반출 금지. 연락처는 일부 가려 표기했습니다.', size: 16, color: C.gray });
    if (fmt === 'pdf') await download(await blocksToPdf(B, nm), nm + '.pdf'); else await download(await packDocx(blocksToDocx(B), nm), nm + '.docx');
    toast('이력서를 만들었습니다');
  } catch (e) { console.error(e); toast('만들지 못했습니다: ' + (e.message || e), 5000); } finally { busy(false); OUT_CONF = false; }
}
const outPerson = (id, f) => outDossier('p', id, f), outCar = (id, f) => outDossier('v', id, f), outCo = (n, f) => outDossier('c', n, f);
/* ---------- 방문증(출입증) — 명함 크기 2장(보관 · 패용) ---------- */
async function outPass(id) {
  const v = AC.visits[id]; if (!v) return;
  busy(true, '방문증 만드는 중…');
  try {
    const q = qrcode(0, 'M'); q.addData(`STAC|${v.id}|${v.d}|${v.badge || ''}`); q.make(); const qr = q.createDataURL(4, 8);
    const card = `<div style="width:340px;height:520px;border-radius:18px;overflow:hidden;background:#fff;font-family:${FONT};box-shadow:0 0 0 2px #0B1F8A inset;position:relative">
      <div style="background:linear-gradient(135deg,#0B1F8A,#1B7A34);color:#fff;padding:16px 18px;display:flex;gap:10px;align-items:center"><img src="${ASSET.icon}" style="width:52px;height:52px;border-radius:12px"><div><div style="font-size:12px;opacity:.85">${esc(siteName())}</div><div style="font-size:26px;font-weight:900;letter-spacing:.1em">${v.cid && !v.pid ? '차량 출입증' : '방 문 증'}</div></div></div>
      <div style="padding:16px 18px;font-size:15px;line-height:1.75;color:#1C2333">
       <div style="font-size:30px;font-weight:900;margin-bottom:4px">${esc(v.badge || 'VISITOR')}</div>
       ${v.name ? `<div><b>성명</b> ${esc(v.name)}</div>` : ''}${v.plate ? `<div><b>차량</b> <span style="border:2px solid #222;border-radius:5px;padding:0 6px;font-weight:900">${esc(v.plate)}</span></div>` : ''}
       <div><b>소속</b> ${esc(v.co || '')}</div><div><b>방문</b> ${esc(v.dept || '')}${v.host ? ' · ' + esc(v.host) : ''}</div><div><b>목적</b> ${esc(v.purpose || '')}</div>
       <div><b>유효</b> ${fmtD(v.d)} ${esc(v.tin)} ~ 당일</div></div>
      <img src="${qr}" style="position:absolute;right:18px;bottom:44px;width:96px;height:96px;image-rendering:pixelated">
      <div style="position:absolute;left:18px;bottom:48px;font-size:11px;color:#B3261E;width:190px;line-height:1.5">· 구내에서 항상 패용하십시오<br>· 퇴실 시 보안실에 반납하십시오<br>· 사진 · 영상 촬영 금지 구역 준수</div>
      <div style="position:absolute;left:0;right:0;bottom:0;background:#EEF1F5;font-size:10px;color:#5B6475;padding:7px 18px">S-Tec Integrated Access Control System · ${esc(v.id)}</div></div>`;
    const host = $('#render'); host.innerHTML = `<div id="passWrap" style="display:flex;gap:30px;padding:30px;background:#fff">${card}${card}</div>`;
    await Promise.all([...host.querySelectorAll('img')].map(i => i.decode ? i.decode().catch(() => { }) : 0));
    const cv = await html2canvas(host.firstChild, { scale: 2, backgroundColor: '#ffffff', logging: false });
    const { jsPDF } = window.jspdf; const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
    const w = 200, h = w * cv.height / cv.width; pdf.addImage(cv.toDataURL('image/jpeg', .92), 'JPEG', 5, (148 - h) / 2, w, h); host.innerHTML = '';
    await download(pdf.output('blob'), `${fileStamp()}_방문증_${safeName(v.badge || v.name || v.plate)}.pdf`); toast('방문증을 만들었습니다 — 인쇄해 반으로 잘라 쓰세요');
  } catch (e) { toast('만들지 못했습니다: ' + (e.message || e)); } finally { busy(false); }
}
