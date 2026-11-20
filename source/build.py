# S-Tec Integrated Access Control System (통합 출입관리 시스템) — 한 파일 index.html 빌드
# 사용법: python3 source/build.py [출력경로]   (저장소 최상위에서 실행)
# 라이브러리 · 그림을 모두 파일 안에 넣어 외부 스크립트 · CDN을 쓰지 않습니다(정보 누출 방지).
# Designed & Developed by Rat Rae Choi
import base64, json, os, sys
S = os.path.dirname(os.path.abspath(__file__)) + '/'
V = S + 'vendor/'
ROOT = os.path.abspath(S + '..') + '/'
def rd(p): return open(p, encoding='utf-8').read()
def scr(s): return s.replace('</script', '<\\/script')
def uri(p, mime): return f'data:{mime};base64,' + base64.b64encode(open(p, 'rb').read()).decode()
asset = json.loads(rd(V + 'assets-base.json'))
asset['icon'] = uri(V + 'icon.png', 'image/png')        # 메인화면 좌측 상단 아이콘 · 앱 아이콘 (업로드 사진)
asset['hero'] = uri(V + 'hero.jpg', 'image/jpeg')        # 출력물(PPT · Word) 표지용 정지 그림
asset['heroAnim'] = uri(V + 'hero-anim.gif', 'image/gif')      # 메인화면 히어로 — 통합 출입관리 시스템 디오라마 애니메이션
asset['fig'] = {k: v for k, v in asset['fig'].items() if k in ('dio_sec', 'cute_sec', 'hq', 'mgr')}
html = rd(S + 'index.html')
APPJS = '\n'.join(rd(S + f) for f in ['app.js', 'ui.js', 'views.js', 'media.js', 'out.js', 'guide.js'])
LIBS = rd(V + 'libs.html') + '\n<script>/* ExcelJS (MIT) */\n' + scr(rd(V + 'exceljs.min.js')) + '\n</script>'
for ph, val in [('<!--LIBS-->', LIBS), ('<!--QR-->', rd(V + 'qr.html')),
                ('/*ASSETS*/', 'const ASSET=' + json.dumps(asset, ensure_ascii=False) + ';'),
                ('/*HF*/', scr(rd(S + 'hf.js'))), ('/*SITES*/', scr(rd(S + 'sites.js'))),
                ('/*APP*/', scr(APPJS)), ('<!--AUTHCSS-->', rd(V + 'auth-css.html')),
                ('/*SUPABASE*/', rd(V + 'supabase.js')), ('/*AUTH*/', rd(V + 'auth.js')), ('/*APPACCESS*/', scr(rd(S + 'app-access.js')))]:
    assert html.count(ph) == 1, ph
    html = html.replace(ph, val)
out = sys.argv[1] if len(sys.argv) > 1 else ROOT + 'index.html'
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8').write(html); print(out, len(html) // 1024, 'KB')
