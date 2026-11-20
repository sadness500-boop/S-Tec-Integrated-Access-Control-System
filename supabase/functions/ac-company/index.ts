// =====================================================================
//  S-Tec Integrated Access Control System — 회사 기본정보 서버 함수(선택)
//  Supabase Edge Function 「ac-company」 · Designed & Developed by Rat Rae Choi
//  · 로그인한 사용자만 호출(JWT 검사 켜 둔 채 배포) · 받는 값은 회사 이름(q) 하나
//  · 카카오 지역검색 REST 키는 Supabase Secrets 의 KAKAO_REST_KEY 에만 둡니다(브라우저 · 저장소에 넣지 않음)
//  · 응답: { ok, source, info: { addr, tel, ind, home, place, lat, lng } }
// =====================================================================
const CORS = {
  "Access-Control-Allow-Origin": "https://sadness500-boop.github.io",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Referrer-Policy": "no-referrer",
};
const j = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const q = (new URL(req.url).searchParams.get("q") || "").replace(/\(주\)|㈜|주식회사|유한회사/g, "").trim().slice(0, 60);
  if (!q) return j({ ok: false, error: "q required" }, 400);
  const key = Deno.env.get("KAKAO_REST_KEY");
  if (!key) return j({ ok: false, error: "KAKAO_REST_KEY not set" });
  try {
    const r = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&size=5`, { headers: { Authorization: `KakaoAK ${key}` } });
    if (!r.ok) return j({ ok: false, error: `kakao ${r.status}` });
    const d = await r.json();
    const docs = (d.documents || []) as Record<string, string>[];
    const norm = (s: string) => s.replace(/\s|\(주\)|㈜|주식회사/g, "");
    const hit = docs.find((x) => norm(x.place_name).includes(norm(q))) || docs[0];
    if (!hit) return j({ ok: false, error: "not found" });
    return j({ ok: true, source: "카카오 지역검색", info: {
      addr: hit.road_address_name || hit.address_name || "", tel: hit.phone || "",
      ind: (hit.category_name || "").split(" > ").slice(-2).join(" · "), place: hit.place_url || "",
      lat: +hit.y || null, lng: +hit.x || null,
    } });
  } catch (e) {
    return j({ ok: false, error: String(e) }, 500);
  }
});
