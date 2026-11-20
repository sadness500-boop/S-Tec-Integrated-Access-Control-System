# S-Tec Integrated Access Control System (통합 출입관리 시스템)

<img src="icons/icon-192.png" width="96" alt="통합 출입관리 시스템 아이콘">

**에스텍 그룹 통합 출입관리 시스템** · v1.0.1 · 통합관리 시스템 11번째 프로그램 (`stac`)

> 들어오는 모든 사람과 차량을 한 화면에서 — 이름 초성 · 차량번호 앞 두 자리 · 업체명만 넣어도
> 방문자와 방문차량의 누적 출입 DATA가 바로 나옵니다.

## 내려받기

| 구분 | 주소 |
|---|---|
| 웹 버전 | https://sadness500-boop.github.io/S-Tec-Integrated-Access-Control-System/ |
| 파일 하나로 여는 배포본 | `releases/S-Tec-Integrated-Access-Control-System_v1.0.1.html` |
| 안드로이드 앱 (최신) | https://github.com/sadness500-boop/S-Tec-Integrated-Access-Control-System/releases/download/app-latest/stac-latest.apk |

- **APK는 GitHub Actions가 만듭니다.** `index.html` · `version.json`을 올리면 Actions 「Android APK」가 약 5분 뒤 `releases/`와 릴리스에 APK를 올립니다.
- **웹 주소를 열려면** 저장소 Settings › Pages › Branch를 `main` / `/(root)`로 한 번 켜야 합니다.

## 핵심 기능

| 기능 | 내용 |
|---|---|
| 출입 등록 | 「👤 방문자 입력」 · 「🚗 방문차량 입력」을 나누어 받고, 결과는 「📌 통합 출입 현황」 한곳에 — 사람+차량 함께 들어오면 한 기록으로 연결 |
| 통합 검색 | 사람 · 방문부서 · 업무 **초성 검색**(ㅎㄱㄷ → 홍길동) · 차량번호 **숫자 앞 두 자리**부터(앞자리 · 뒷자리 모두) · **업체만 넣어도** 소속 방문자 · 차량 |
| 누적 DATA | 개인별 · 차량별로 방문일자 · 방문시간 · 방문부서 · **방문 당시 소속 회사**를 모두 보관 — 동명이인(연락처 · 소속으로 구분) · 이직(A사 퇴직 → B사 소속 방문)을 **소속 이력**으로 이어서 관리 |
| DATA 조회 · 관리 | 개인별 · 차량별 · 기간별(일 · 월) · 방문부서별 · 회사 소속 명단 전부 — 보이는 그대로 엑셀 · Word · PDF · PPT · CSV |
| 회사 기본정보 | 회사 이름을 누르면 주소 · 대표전화 · 업종 · 홈페이지 · 전경 사진 · 대표자(위키백과 · 위키데이터, 서버 함수 설정 시 카카오 지역검색) + 직접 입력 |
| 연동(커스터마이징) | 기존 출입 · 차량번호인식(LPR) · 출입카드 · 방문예약 시스템 ① 엑셀 · CSV 가져오기(열 맞춤 저장) ② 내보내기 ③ 웹훅(입 · 퇴실 즉시 POST) ④ 서버 수신(`ac_ingest`, 사업장별 토큰) · 출입구 · 부서 · 목적 · 차종 목록과 항목 이름 · 필수 항목 변경 |
| 출입 통제 | 출입제한(블랙리스트) 지정 · 입실 시 경고 · 구내 체류(미퇴실) · 8시간 초과 표시 · 일괄 퇴실 · 방문증(QR) 인쇄 |
| 정보 보호 | 연락처 가림 · 보유기간 파기 · 화면 자동 잠금(PIN) · 출력물 「대외비 · 개인정보 포함」 · 아래 「정보 누출 방지」 |

## 화면

- **메인**: 상단 바 한 줄(좌측 앱 아이콘 · 이름 | 사업장 · 담당 · QR · 추천 · 계정 · 테마) · 히어로(통합 출입관리 시스템 디오라마) · **통합 검색 칸** · 오늘 방문자 · 차량 · 구내 체류 · 누적 DATA
- **S-Tec Media Wall**: 통합관리 시스템 메인과 같은 사진(크로스페이드) · 영상(연속 재생) · 흐르는 띠 — 통합관리 시스템 `media/`를 함께 사용, 「🎬 사진 · 영상 숨기기」로 접기
- **🚪 출입 등록** · **📋 출입 현황** · **🗂 DATA 조회 · 관리** · **🏢 회사 정보** · **🖨 출력** · **⚙ 설정 · 연동**
- 통합관리 시스템 공통: 담당 카드 · 다운로드 QR · 친구 추천 · 내 계정 · ☀ 주간 / ☾ 야간 / ▣ 시스템 · 왼쪽 아래 「메인」

## 출력물

| 출력 | 형식 |
|---|---|
| 출입 관리대장(결재란 · 요약 · 추이 차트 · 기록 전체) | 엑셀 · Word · PDF · PPT · CSV |
| 개인별 · 차량별 · 회사 소속 명단 · 방문부서별 · 기간별 현황 | 엑셀 · Word · PDF · PPT |
| 출입관리 실적 보고(고객사 월간 보고) | PPT · PDF |
| 개인 · 차량 · 회사 출입 이력서 | Word · PDF |
| 방문증(QR) | PDF |

예시 파일: `docs/출력예시/` · 매뉴얼: `docs/매뉴얼/` (모두 가상 예시 자료로 만들었습니다).

## 통합 로그인 · Supabase

- `auth-config.json`이 통합관리 시스템 · 11개 프로그램과 **같은 Supabase 서버**를 가리킵니다 — 하나의 아이디.
- **처음 한 번:** Supabase → SQL Editor → [`server/supabase_stac.sql`](server/supabase_stac.sql) 실행 (다시 실행해도 안전)
  1. 프로그램 등록부에 `stac` 11번째(맨 아래, sort 110) 등록 → 통합관리 시스템 메인 카드 · 「🔐 프로그램별 권한」
  2. 공유 출입 DATA `ac_records` + `ac_put` · `ac_list` · `ac_delete` — 표 직접 조회 차단(RLS), 함수에서 승인 · stac 권한 · 지사 범위 검사
  3. 기존 장비 수신 `ac_tokens` · `ac_token_create`(관리자) · `ac_ingest`(토큰, 해시만 저장) · 파기 `ac_purge`(관리자)
- **회사 정보 서버 함수(선택):** [`supabase/functions/ac-company`](supabase/functions/ac-company/index.ts) 배포 + Secrets `KAKAO_REST_KEY`
- SQL 실행 전에도 이 기기 저장으로 동작합니다. 출입 DATA(개인정보)는 계정 동기화(user_data)에 올리지 않습니다.

## 정보 누출 방지

- 검색엔진 차단(`noindex` 메타 · `robots.txt`) · `no-referrer` · 콘텐츠 보안 정책(CSP: 외부 스크립트 · 프레임 · 폼 전송 · object 차단)
- 외부 CDN · 분석 도구 없음 — 라이브러리 · 그림은 모두 `index.html` 한 파일 안에 포함
- 회사 정보 검색에는 **회사 이름만** 보냄(방문자 정보 전송 없음) · 웹훅은 연락처 뒤 4자리만
- 비밀값: 카카오 키 = 서버 Secrets / 웹훅 토큰 · 잠금 PIN = 이 기기에만(PIN은 해시) / 수신 토큰 = 서버에 해시만
- 공개 저장소에는 실제 방문자 · 고객사 출입 자료를 넣지 않습니다 — 예시 자료는 모두 가상

## 파일 구성

```
index.html            프로그램 전체 (한 파일, 라이브러리 내장)
source/               원본: app.js(DATA · 초성/번호판 검색 · 회사 정보 · 공유 서버 · 연동) · ui.js · views.js(화면)
                      media.js(영상 · 차트) · out.js(엑셀 · Word · PDF · PPT) · guide.js(매뉴얼) · build.py
server/               Supabase SQL (supabase_stac.sql)
supabase/functions/   회사 정보 서버 함수(선택)
media/manual          매뉴얼 화면 (사진 · 영상은 통합관리 시스템 media/ 공용)
icons/ · assets/      앱 아이콘 · 히어로
docs/                 출력물 예시 · 사용자 매뉴얼 · 제작자 관리매뉴얼 (Word · PDF · PPT · PDF)
.github/workflows/    안드로이드 앱 자동 빌드
```
빌드: `python3 source/build.py`

Designed & Developed by Rat Rae Choi
