/* =====================================================================
 * 매뉴얼 — 사용자 매뉴얼 · 제작자 관리매뉴얼 (프로그램 안 보기 · Word · PPT · PDF)
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const MANUAL = {
  user: {
    title: '사용자 매뉴얼', en: 'User Guide', file: '에스텍_통합출입관리시스템_사용자매뉴얼',
    sub: '보안 근무자 · 현장 관리자가 방문자 · 방문차량을 등록하고 누적 DATA를 찾는 방법',
    sections: [
      { h: '이 프로그램은', key: ['방문자 · 방문차량 출입 등록', '사람 · 차량 · 회사별 누적 DATA', '초성 · 번호판 앞 두 자리 · 업체 통합 검색', '기존 사업장 시스템과 연동'], img: 'm_main', blocks: [
        { p: 'S-Tec Integrated Access Control System(통합 출입관리 시스템)은 사업장 보안실에서 방문자와 방문차량의 출입을 등록하고, 쌓인 기록을 개인별 · 차량별 · 회사별 · 방문부서별 · 기간별로 바로 찾아 보는 프로그램입니다. 에스텍 운영 및 영업 통합관리 시스템의 11번째 프로그램(코드 stac)입니다.' },
        { table: { head: ['핵심', '내용'], rows: [['① 누적 DATA 관리', '개인별 · 차량별로 방문일자 · 방문시간 · 방문부서 · 방문 당시 소속 회사를 모두 쌓아 둠 — 동명이인과 이직(A사 → B사)도 구분'], ['② 통합 검색', '사람 · 부서 · 업무는 초성(ㅎㄱㄷ), 차량은 번호판 숫자 앞 두 자리, 업체명만 넣어도 소속 방문자 · 차량이 함께'], ['③ 회사 기본정보', '회사 이름을 누르면 주소 · 대표전화 · 업종 · 홈페이지 · 전경 사진 · 대표자(인터넷 공개 정보)'], ['④ 연동 · 커스터마이징', '기존 차량번호인식(LPR) · 출입카드 · 방문예약 시스템의 엑셀 · CSV 가져오기, 내보내기, 웹훅, 서버 수신'], ['⑤ 정보 보호', '연락처 가림 · 보유기간 파기 · 화면 자동 잠금 · 외부 전송 최소화']] } }] },
      { h: '설치하고 시작하기', key: ['통합관리 시스템 메인 → 11번째 카드', '웹 주소 · 안드로이드 앱 · 홈 화면 추가', '통합 로그인(같은 아이디)', '처음 한 번 「출입 담당」 · 「운영 사업장」 지정'], img: 'm_gate', blocks: [
        { table: { head: ['기기', '여는 방법'], rows: [['통합관리 시스템', '메인 화면 맨 아래 「S-Tec Integrated Access Control System」 카드 → 열기(다시 로그인하지 않음)'], ['보안실 PC', '크롬 · 엣지로 웹 주소 열기 → 주소창 오른쪽 설치 아이콘 → 바탕화면 앱'], ['안드로이드', '상단 「다운로드 QR」 → 안드로이드 앱(APK) → 「출처를 알 수 없는 앱」 허용 → 설치'], ['아이폰 · 아이패드', '사파리로 웹 주소 → 공유 → 「홈 화면에 추가」']] } },
        { p: '웹 주소: https://sadness500-boop.github.io/S-Tec-Integrated-Access-Control-System/' },
        { ol: ['통합관리 시스템과 같은 아이디(이메일) · 비밀번호로 로그인합니다. 제작자가 「프로그램별 권한」에서 「출입 관리(stac) 사용」을 주어야 열립니다.', '처음 열면 「출입 담당 지정」 화면이 나옵니다. 근무자 성명(필수) · 직책 · 지사 · 연락처를 넣고 시작합니다. 교대 때 상단 「출입 담당」 카드를 눌러 바꿉니다.', '상단 「운영 사업장」 카드 → 「⚙ 설정 · 연동」에서 이 기기가 쓰이는 사업장을 고르고 저장합니다.'] },
        { tip: '로그인하지 않아도 이 기기에서는 쓸 수 있지만, 로그인하면 공유 서버에 저장되어 다른 기기(교대 근무 PC · 휴대폰)에서 같은 기록을 찾을 수 있습니다.' }] },
      { h: '사업장 유형 선택 — 공장 · 아파트 · 병원 · 빌딩 · 연수원 · 공사현장 등', key: ['처음 열면 사업장 유형부터 고름', '유형에 맞게 방문처 · 목적 · 출입구 · 차종 · 확인 항목 자동', '항목 이름도 유형 용어로(동 · 호수 / 병동 · 진료과 / 공종)', '⚙ 설정 · 연동 → 「유형 바꾸기」'], img: 'm_gate', blocks: [
        { p: '사업장마다 출입관리의 개념이 다릅니다. 공장은 협력업체 · 납품 차량, 아파트는 세대 방문 · 택배 · 이사, 병원은 면회 · 보호자 · 의약품 납품, 공사현장은 일용 · 협력업체 작업자와 장비 반입이 중심입니다. 처음 실행하면 「사업장 유형 선택」 창이 나오며, 고른 유형에 맞게 화면이 자동으로 바뀝니다.' },
        { table: { head: ['유형', '방문처(부서 자리)', '확인 항목 예'], rows: [['🏭 공장 · 산업시설', '방문부서', '신분 확인 · 보안서약'], ['🏢 아파트 · 주거단지', '방문 동 · 호수', '세대 확인(인터폰) · 출입 안내'], ['🏥 병원 · 의료시설', '방문 병동 · 진료과', '발열 · 감염 증상 확인 · 면회 수칙'], ['🏙 오피스 빌딩', '방문 층 · 입주사', '신분 확인 · 방문증 교부'], ['🎓 연수원 · 교육시설', '교육과정 · 숙소동', '입소 확인 · 시설 이용 안내'], ['🏗 공사현장', '공종 · 작업 구역', '안전교육 이수 · 보호구 착용'], ['🏫 학교 · 대학교', '학과 · 건물', '신분 확인 · 방문 목적 확인'], ['🚚 물류센터 · 창고', '도크 · 창고동', '기사 신분 · 적재 확인'], ['🏛 공공기관 · 영사관', '방문 부서', '신분 확인 · 보안 검색'], ['⛳ 골프장 · 레저 · 리조트', '시설 · 코스', '예약 확인 · 안내'], ['🧩 기타 · 직접 구성', '직접 설정', '직접 설정']] } },
        { ol: ['처음 열면 11가지 유형 카드 중 하나를 누릅니다(고르기 전에는 닫히지 않습니다).', '유형에 맞는 출입구 · 방문처 · 방문 목적 · 차종 · 확인 항목 · 항목 이름이 채워집니다. 아파트 등 개인 방문이 많은 유형은 소속 회사를 비워 두면 「개인」으로 저장됩니다.', '바꾸려면 「⚙ 설정 · 연동」 맨 위 「🏷 사업장 유형」 → 「유형 바꾸기」. 목록은 「목록 · 항목 커스터마이징」에서 사업장에 맞게 더 고칠 수 있습니다.', '「운영 사업장」에서 에스텍베스트 사업장을 고르면 그 사업장의 유형(아파트 · 병원 등)에 맞는 프로필로 바꿀지 물어봅니다.'] },
        { warn: '유형을 바꾸면 출입구 · 방문처 · 목적 · 차종 목록과 항목 이름이 그 유형 기본값으로 다시 채워집니다. 이미 쌓인 출입 기록은 그대로 남습니다.' }] },
      { h: '메인 화면 둘러보기', key: ['좌측 상단 아이콘 · 운영 사업장 · 출입 담당', '통합 검색 칸(히어로)', '현장 영상(숨기기 가능)', '6개 메뉴 탭'], img: 'm_main', blocks: [
        { table: { head: ['위치', '하는 일'], rows: [['좌측 상단 아이콘', '누르면 맨 위로(앱 아이콘과 같은 그림)'], ['운영 사업장', '이 기기가 처리하는 사업장 지정'], ['출입 담당', '근무자 지정 · 변경(지정해야 프로그램이 열림)'], ['다운로드 QR · 친구 추천', '설치 주소 QR · 안내 문구 복사'], ['☀ 주간 · ☾ 야간 · ▣ 시스템', '화면 밝기(야간 근무 때 「야간」 권장)'], ['🔍 통합 검색', '이름 초성 · 차량번호 앞 두 자리 · 업체 · 부서 · 업무를 한 칸에서'], ['히어로 숫자', '오늘 방문자 · 오늘 방문차량 · 현재 구내 체류 · 누적 출입 DATA'], ['🎬 현장 영상 숨기기', '영상 칸을 접어 입력 화면을 넓게(기억됨)'], ['왼쪽 아래 「메인」', '통합관리 시스템 메인 화면으로']] } },
        { table: { head: ['메뉴 탭', '하는 일'], rows: [['🚪 출입 등록', '방문자 입력 | 방문차량 입력(나뉨) + 통합 출입 현황(한곳에)'], ['📋 출입 현황', '구내 체류(미퇴실) · 일괄 퇴실 · 최근 14일 추이'], ['🗂 DATA 조회 · 관리', '개인별 · 차량별 · 회사 소속 명단 · 방문부서별 · 기간별'], ['🏢 회사 정보', '방문 회사 목록 · 인터넷 공개 기본정보'], ['🖨 출력', '출입 관리대장 · 현황표 · 실적 보고(엑셀 · Word · PDF · PPT)'], ['⚙ 설정 · 연동', '사업장 유형 · 사업장 · 목록 · 항목 이름 · 개인정보 · 기존 시스템 연동 · 백업']] } }] },
      { h: '통합 검색 — 초성 · 번호판 · 업체', key: ['ㅎㄱㄷ → 홍길동 (초성 · 섞어 쓰기)', '34 → 34나5678 · 1234 (앞 두 자리부터)', '업체명 → 소속 방문자 · 차량 모두', '↑↓ · Enter로 바로 열기'], img: 'm_search', blocks: [
        { p: '메인 화면 가운데 검색 칸에 무엇이든 넣으면 방문자 · 방문차량 · 회사 · 방문부서 · 업무로 나누어 바로 보여 줍니다. 결과를 누르면 그 사람 · 차량 · 회사의 통합 화면이 열립니다.' },
        { table: { head: ['넣는 것', '찾는 방법', '예'], rows: [['사람 이름', '초성만 · 일부 글자 · 섞어 쓰기', 'ㅎㄱㄷ · 홍ㄱ · 길동 → 홍길동'], ['차량번호', '숫자 두 자리부터 — 앞자리 · 뒷자리 모두', '12 → 12가3456 / 34 → 3456 · 34나5678'], ['업체(회사)', '회사 이름 초성 · 일부 — 그 회사 방문자 · 차량도 함께', 'ㅎㅂ → (주)한빛기계 + 소속 김민수 · 34나5678'], ['방문부서 · 업무', '초성 · 일부 → 누르면 DATA 조회로', 'ㅊㅁ → 총무팀 / ㄴㅍ → 납품'], ['연락처', '뒤 4자리', '1234']] } },
        { tip: '같은 이름이 여럿이면 소속 · 연락처(가림) · 방문 횟수가 함께 보여 구분할 수 있습니다. ⛔ 표시는 출입제한 대상입니다.' }] },
      { h: '방문자 출입 등록', key: ['이름을 치면 기존 방문자 제안', '고르면 소속 · 연락처 · 최근 부서 자동', '필수: 성명 · 소속 회사 · 방문부서 · 목적', '함께 온 차량번호 → 차량 DATA에도'], img: 'm_entry', blocks: [
        { ol: ['「🚪 출입 등록」 탭 왼쪽 「👤 방문자 입력」을 씁니다.', '성명을 치면(초성도 됨) 기존 방문자가 아래에 나옵니다. 같은 사람이면 눌러 고릅니다 — 연락처 · 소속 · 직위와 최근 방문부서 · 목적이 채워집니다.', '처음 온 사람은 그대로 입력합니다. 연락처는 동명이인 구분에 쓰입니다.', '소속 회사 · 방문부서 · 피방문자 · 방문 목적 · 출입구 · 출입증 번호 · 반입 물품을 넣습니다(부서 · 목적은 목록에서 고르거나 직접 입력).', '차를 타고 왔으면 「함께 들어오는 차량번호」에 넣습니다 — 사람과 차량 DATA에 함께 연결됩니다.', '신분 확인 · 보안서약 체크 후 「👤 방문자 입실 등록」.'] },
        { table: { head: ['상황', '프로그램이 하는 일'], rows: [['같은 이름이 이미 있음', '「👥 동명이인 확인」 창 — 같은 사람이면 고르고, 다른 사람이면 「새 방문자로 등록」'], ['다른 회사 소속으로 다시 옴', '같은 사람을 고르면 현재 소속이 바뀌고 소속 이력(A사 → B사)으로 남음'], ['출입제한 대상', '빨간 경고 — 책임자 확인 후 「확인 후 등록」하면 기록에 「출입제한 확인」 표시']] } }] },
      { h: '방문차량 출입 등록', key: ['번호판 숫자 두 자리부터 기존 차량 제안', '소속 · 차종 · 운전자 자동', '필수: 차량번호 · 소속 · 부서 · 목적', '운전자 이름 → 방문자 DATA에도'], img: 'm_entry', blocks: [
        { ol: ['오른쪽 「🚗 방문차량 입력」에 차량번호를 칩니다(예: 12가3456). 숫자 두 자리부터 기존 차량이 나옵니다.', '고르면 차종 · 소속 · 모델 · 운전자 · 최근 방문부서가 채워집니다.', '운전자 이름을 넣으면 그 사람의 방문자 DATA에도 연결됩니다(동명이인 확인 동일).', '적재물 · 주차 위치 · 계근 값이 있으면 넣고 「🚗 차량 입차 등록」.'] },
        { tip: '일반 번호판 형식(12가3456 · 123가4567 · 서울12가3456)이 아니면 한 번 더 물어봅니다. 임시번호 · 외교 · 건설기계도 그대로 저장할 수 있습니다.' }] },
      { h: '통합 출입 현황 · 퇴실', key: ['입력은 나뉘고 결과는 한 목록', '👤 방문자 · 🚗 차량 · 👤🚗 함께', '「퇴실」 버튼 · 일괄 퇴실', '8시간 넘은 체류는 빨간 줄'], img: 'm_list', blocks: [
        { p: '입력 칸 아래 「📌 통합 출입 현황」에 오늘 등록한 방문자와 방문차량이 시간순으로 한곳에 나옵니다. 「오늘 전체 · 구내 체류 · 오늘 방문자 · 오늘 차량」으로 걸러 봅니다.' },
        { ul: ['행을 누르면 출입 1건 상세(수정 · 삭제 · 방문증 인쇄 · 퇴실)', '이름을 누르면 방문자 통합 화면, 번호판을 누르면 차량 통합 화면, 회사를 누르면 회사 기본정보', '「퇴실」을 누르면 지금 시각으로 퇴실 처리(체류 시간 자동 계산)', '「📋 출입 현황」 탭에서 여러 줄을 체크해 일괄 퇴실'] }] },
      { h: '방문자 · 차량 통합 화면 (누적 DATA)', key: ['누적 방문 · 방문일수 · 첫/최근 방문', '소속 이력(이직 · 전배)', '이용 차량 · 운전자 · 방문부서별', '출입 기록 전체 · 이력서 출력'], img: 'm_person', blocks: [
        { p: '방문자 이름이나 차량번호를 누르면 그 사람(차량)의 모든 출입이 한 화면에 모입니다. 방문일자 · 시간 · 방문부서 · 방문 당시 소속 회사가 모두 남아, 한 사람이 A회사 퇴직 후 B회사 소속으로 방문해도 이력이 이어집니다.' },
        { table: { head: ['버튼', '하는 일'], rows: [['✏ 정보 수정', '연락처 · 소속 · 직위 · 사진 · 메모(소속을 바꾸면 이력에 남음)'], ['⛔ 출입제한 지정 / 해제', '사유와 함께 지정 — 입실 때 경고'], ['⬇ 개인(차량) 출입 이력서', 'Word · PDF'], ['🚪 이 사람 입실 등록', '입력 칸에 바로 채워서 등록'], ['방문자 삭제', '정보주체 삭제 요청 시 — 그 사람의 출입 기록도 함께 삭제']] } }] },
      { h: 'DATA 조회 · 관리', key: ['기간: 오늘 · 7일 · 이번 달 · 올해 · 전체 · 직접', '개인별 · 차량별 · 기간별 · 방문부서별', '회사 소속 명단 전부', '보이는 그대로 엑셀 · Word · PDF · PPT'], img: 'm_data', blocks: [
        { table: { head: ['보기', '내용'], rows: [['📄 출입 기록 전체', '조건에 맞는 모든 출입(100건씩 쪽 넘김)'], ['👤 개인별', '방문 횟수 · 방문일수 · 첫/최근 · 방문 당시 소속(이력) · 주요 부서 · 차량'], ['🚗 차량별', '입차 횟수 · 소속 · 운전자 · 주요 부서'], ['🏢 회사 소속 명단', '회사마다 소속 방문자 · 차량 명단 전부와 출입 건수'], ['🏷 방문부서별', '부서별 출입 · 방문 회사 · 주요 업무'], ['📅 기간별', '일별(두 달 넘으면 월별) 추이 차트와 표']] } },
        { ul: ['검색어 칸도 초성 · 번호판 앞 두 자리 · 업체를 그대로 씁니다.', '부서 · 회사 · 업무 · 상태(구내 · 퇴실) · 구분(방문자 · 차량)으로 좁힙니다.', '「☁ 서버 기록 받기」로 다른 기기 · 다른 근무조가 올린 같은 기간 기록을 합칩니다.'] }] },
      { h: '회사 기본정보', key: ['회사 이름을 누르면 바로', '주소 · 대표전화 · 업종 · 홈페이지 · 대표자 · 전경 사진', '인터넷 공개 정보 + 직접 입력', '소속 방문자 · 차량 명단'], img: 'm_co', blocks: [
        { p: '어디서든 회사 이름(파란 글씨)을 누르면 회사 화면이 열립니다. 처음 열 때 인터넷 공개 정보(위키백과 · 위키데이터, 서버 설정 시 지도 검색)를 찾아 채우고, 찾지 못한 값은 네이버 · 카카오맵 · 구글 검색 버튼으로 확인한 뒤 「✏ 직접 입력」합니다. 전경 사진도 직접 올릴 수 있습니다.' },
        { warn: '인터넷 공개 정보는 실제와 다를 수 있으니 중요한 연락 전에는 확인하세요. 검색에는 회사 이름만 보내며 방문자 정보는 보내지 않습니다.' }] },
      { h: '출력 — 검색 결과 그대로', key: ['출입 관리대장(결재란)', '개인별 · 차량별 · 회사별 · 부서별 현황', '출입관리 실적 보고(PPT)', '방문증 · 개인 · 차량 · 회사 이력서'], img: 'm_report', blocks: [
        { table: { head: ['출력물', '형식', '내용'], rows: [['출입 관리대장', '엑셀 · Word · PDF · PPT', '요약 · 추이 차트 · 기록 전체(결재 담당 · 반장 · 소장)'], ['개인별 · 차량별 출입 현황', '엑셀 · Word · PDF · PPT', '사람 · 차량마다 방문 횟수 · 이력'], ['회사 소속 명단', '엑셀 · Word · PDF · PPT', '회사별 소속 방문자 · 차량 전부'], ['방문부서별 · 기간별', '엑셀 · Word · PDF · PPT', '부서 · 일/월 집계'], ['출입관리 실적 보고', 'PPT · PDF', '고객사 월간 보고용 — KPI · 시간대 · 순위 · 차량 · 보안 활동 · 계획'], ['개인 · 차량 · 회사 이력서', 'Word · PDF', '통합 화면에서 출력'], ['방문증', 'PDF', 'QR · 출입증 번호 · 유효 일자(2장)']] } },
        { tip: '출력 범위는 「🗂 DATA 조회 · 관리」에서 정한 조건을 그대로 씁니다. 검색 → 확인 → 출력 순서로 하면 됩니다.' }] },
      { h: '설정 · 연동(커스터마이징)', key: ['출입구 · 부서 · 목적 · 차종 목록', '항목 이름을 사업장 용어로', '기존 시스템 엑셀 · CSV 가져오기(열 맞춤 저장)', '웹훅 · 서버 수신'], img: 'm_set', blocks: [
        { ol: ['「⚙ 설정 · 연동 › 목록 · 항목 커스터마이징」에서 출입구 · 방문부서 · 방문 목적 · 차종을 한 줄에 하나씩 넣고 저장합니다.', '항목 이름(예: 방문부서 → 방문처, 피방문자 → 면담자)을 사업장 용어로 바꿀 수 있습니다. 연락처 · 피방문자 · 출입증 번호를 필수로 정할 수 있습니다.', '기존 출입 프로그램의 엑셀 · CSV를 「① 가져오기」로 고르면 열을 자동으로 맞춥니다. 확인 후 「가져오기 실행」 — 같은 사람 · 차량은 기존 DATA에 이어 붙고 중복은 건너뜁니다. 「열 맞춤 저장」을 해 두면 다음부터 고르기만 합니다.'] }] },
      { h: '개인정보 보호 수칙', key: ['연락처 가림(기본)', '보유기간 지나면 파기', '화면 자동 잠금(PIN)', '출력물은 대외비'], blocks: [
        { ul: ['출입 기록에는 개인정보(성명 · 연락처 · 차량번호)가 있습니다. 출입관리 목적 외에 쓰지 않습니다.', '방문자에게 수집 · 이용 목적과 보유기간을 안내하고 동의(보안서약 체크)를 받습니다.', '보안실 PC는 「화면 자동 잠금」과 PIN을 켜 둡니다. 자리를 비울 때는 로그아웃합니다.', '출력물 · 엑셀 파일은 외부로 보내지 않고, 보유기간이 지나면 「보유기간 지난 기록 파기」로 지웁니다.', '정보주체가 삭제를 요청하면 방문자 통합 화면 → 정보 수정 → 「방문자 삭제」.'] },
        { warn: '이 프로그램은 개인정보 보호법에 따른 사업장(고객사)의 출입관리 업무를 돕는 도구입니다. 수집 항목 · 보유기간 · 안내 문구는 고객사의 개인정보 처리방침에 맞추세요.' }] },
      { h: '자주 묻는 질문', key: ['같은 이름 두 사람?', '회사를 옮긴 사람?', '번호판 일부만 기억?', '인터넷이 끊기면?'], blocks: [
        { table: { head: ['질문', '답'], rows: [['같은 이름이 두 명이에요', '연락처로 구분합니다. 등록할 때 「동명이인 확인」 창에서 고르면 각자 따로 쌓입니다.'], ['A회사에서 B회사로 옮겨 다시 왔어요', '같은 사람을 고르고 소속을 B회사로 넣으면 됩니다. 통합 화면 「소속 이력」에 A사 → B사로 남습니다.'], ['차량번호 뒷자리만 기억나요', '숫자 두 자리부터 앞자리 · 뒷자리 모두 찾습니다(예: 56 → 3456, 5678).'], ['업체 직원이 몇 명 왔는지 보고 싶어요', '검색 칸에 업체명 → 회사를 누르거나 DATA 조회 「회사 소속 명단」.'], ['인터넷이 끊겼어요', '이 기기에 저장되고, 연결되면 공유 서버로 올라갑니다.'], ['예전 출입 프로그램 기록을 옮기고 싶어요', '「⚙ 설정 · 연동 › ① 가져오기」로 엑셀 · CSV를 불러옵니다.']] } }] }
    ]
  },
  admin: {
    title: '제작자 관리매뉴얼', en: 'Administrator Guide', file: '에스텍_통합출입관리시스템_제작자관리매뉴얼',
    sub: '권한 · Supabase 서버 · 연동 · 보안 · 배포 · 유지보수',
    sections: [
      { h: '역할과 관리 구조', key: ['통합 로그인 — 11개 프로그램 같은 서버', '제작자 · 관리자 · 사용자', '권한은 통합관리 시스템 관리 콘솔에서', '프로그램 코드 stac'], img: 'm_launch', blocks: [
        { p: '통합 출입관리 시스템은 통합관리 시스템의 11번째 프로그램(코드 stac, 메인 화면 맨 아래 카드)입니다. 계정 · 가입 승인 · 사용기한 · 기기 · 접속기록은 통합관리 시스템 「🛡️ 제작자 관리 콘솔」에서 한 번에 관리합니다.' },
        { table: { head: ['역할', '출입관리 시스템에서'], rows: [['제작자(owner)', '모든 기능 · 공유 서버 전체 기록 · 수신 토큰 발급 · 기록 파기'], ['관리자(admin)', '모든 기능 · 공유 서버 전체 기록 · 수신 토큰 발급'], ['사용자(user)', '「프로그램별 권한」에서 stac 「사용」을 받아야 실행 · 자기 기록 + 지정된 담당 지사 기록']] } }] },
      { h: 'Supabase 서버 준비', key: ['server/supabase_stac.sql', '프로그램 등록부 11번째(sort 110)', '공유 표 ac_records · 수신 토큰 ac_tokens', '다시 실행해도 안전'], blocks: [
        { ol: ['Supabase → 통합 로그인 프로젝트 → SQL Editor', '저장소의 server/supabase_stac.sql 전체를 붙여넣고 Run', '마지막 확인 결과에 stac · 통합 출입관리 시스템 · 110 이 보이면 완료'] },
        { table: { head: ['만드는 것', '내용'], rows: [['program_registry: stac', '통합관리 시스템 메인 화면 11번째(맨 아래) 카드'], ['app_access', 'stac 권한을 지정할 수 있게 허용'], ['ac_records 표', '방문자 · 차량 · 회사 · 출입 기록(종류 · id) — 표 직접 접근 차단(RLS), 함수로만'], ['ac_put · ac_list · ac_delete', '올리기 · 받기 · 지우기 — 권한 · 지사 범위 검사'], ['ac_tokens · ac_token_create · ac_ingest', '기존 장비 수신용 토큰(해시만 저장) · 발급(관리자) · 수신'], ['ac_purge', '보유기간 지난 출입 기록 서버 파기(관리자)']] } },
        { tip: '확인: select code, name, sort from program_registry order by sort; → 마지막 줄 stac · 통합 출입관리 시스템 · 110' }] },
      { h: '회사 정보 서버 함수(선택)', key: ['supabase/functions/ac-company', '카카오 지역검색 키는 서버 비밀값으로만', '없으면 위키백과 · 위키데이터로 동작', '로그인 사용자만 호출'], blocks: [
        { p: '회사 주소 · 대표전화 · 업종을 더 많이 찾으려면 카카오 지역검색(REST API) 키를 서버 함수에 넣습니다. 키는 브라우저 · 저장소에 넣지 않고 Supabase 비밀값(Secrets)에만 둡니다.' },
        { ol: ['Kakao Developers에서 앱을 만들고 REST API 키를 받습니다.', 'Supabase → Edge Functions → 「Deploy a new function」 → 이름 ac-company → 저장소 supabase/functions/ac-company/index.ts 내용을 붙여넣고 배포', 'Edge Functions → Secrets → KAKAO_REST_KEY = (REST API 키) 저장', '프로그램에서 회사 「🌐 인터넷에서 기본정보 찾기」 → 자료 출처에 「카카오 지역검색」이 보이면 완료'] }] },
      { h: '기존 시스템 연동(서버 수신)', key: ['관리자가 사업장별 수신 토큰 발급', '토큰은 한 번만 표시 · 서버엔 해시', 'POST /rest/v1/rpc/ac_ingest', '받은 기록은 「☁ 서버 기록 받기」'], blocks: [
        { ol: ['프로그램 「⚙ 설정 · 연동 › ④ 서버 수신」에서 「🔑 수신 토큰 만들기」(제작자 · 관리자 로그인 필요)', '나온 토큰을 차량번호인식기 · 출입카드 서버 담당 업체에 전달(메일 · 메신저에 남기지 않도록 주의)', '장비가 아래 형식으로 보내면 공유 서버에 출입 기록이 쌓입니다', '현장 PC에서 「☁ 수신 기록 받기」 또는 DATA 조회 「☁ 서버 기록 받기」'] },
        { p: 'POST https://(서버)/rest/v1/rpc/ac_ingest · 헤더 apikey: 공개 키 · 본문 {"p_token":"…","p_rows":[{"date":"2026-11-20","time_in":"09:12","time_out":"","plate":"12가3456","name":"","phone":"","company":"","dept":"","purpose":"납품","gate":"정문","badge":""}]} — 한 번에 최대 500행' },
        { warn: '토큰이 유출되면 SQL Editor에서 update ac_tokens set active=false where label=\'…\'; 로 즉시 끄고 새로 발급하세요.' }] },
      { h: '보안 · 정보 누출 방지', key: ['검색엔진 차단 · 리퍼러 차단', '외부 스크립트 · 분석 도구 없음', '표 직접 접근 차단(RLS) · 함수 권한 검사', '비밀값은 서버 · 이 기기에만'], blocks: [
        { table: { head: ['항목', '적용 내용'], rows: [['웹 주소 노출', 'noindex · nofollow 메타, robots.txt 전체 차단'], ['리퍼러', 'no-referrer — 외부 링크로 프로그램 주소가 새지 않음'], ['콘텐츠 보안 정책(CSP)', '외부 스크립트 · 프레임 · 폼 전송 · object 차단, 라이브러리는 모두 파일 안에 포함'], ['공유 서버', 'ac_records RLS 사용 · 정책 없음(직접 조회 불가) · security definer 함수에서 승인 · 권한 · 지사 범위 검사'], ['계정 동기화', '출입 DATA는 user_data(계정 동기화)에 올리지 않음 — 화면 설정만'], ['비밀값', '카카오 키 = 서버 Secrets / 웹훅 토큰 · 잠금 PIN = 이 기기만(해시)'], ['외부 검색', '회사 이름만 전송(방문자 정보 전송 없음)'], ['출력물', '연락처 가림 · 「대외비 · 개인정보 포함」 표시'], ['공개 저장소', '실제 방문자 · 고객사 출입 자료를 넣지 않음 — 예시 자료는 모두 가상']] } },
        { warn: 'service_role(secret) 키는 절대 저장소 · auth-config.json에 넣지 않습니다. auth-config.json의 publishable(anon) 키는 공개되어도 되는 키입니다.' }] },
      { h: '배포 · 버전 올리기', key: ['source/ 수정 → python3 source/build.py', 'index.html · version.json 올리면 APK 자동 빌드', 'releases/ · 릴리스 app-latest', '통합관리 시스템 카드 버전 갱신'], blocks: [
        { ol: ['source/의 app.js · views.js · out.js · guide.js 등을 고칩니다.', '저장소 최상위에서 python3 source/build.py → index.html(한 파일)', 'source/app.js의 APP.version · version.json · package.json · manifest 버전을 함께 올립니다.', 'main에 push → GitHub Actions 「Android APK」가 약 5분 뒤 releases/와 릴리스(app-latest)에 APK를 올립니다.', '웹 주소가 열리지 않으면 Settings › Pages › Branch main /(root)를 켭니다.'] },
        { p: '저장소: https://github.com/sadness500-boop/S-Tec-Integrated-Access-Control-System · 서명 키: android-keystore/stac-debug.keystore(같은 키로 덮어 설치)' }] },
      { h: '데이터 관리 · 파기 · 백업', key: ['이 기기 한도 약 5MB(수만 건)', '공유 서버에 올리고 오래된 기록 파기', '보유기간 기본 3년', 'JSON 백업 · 복원'], blocks: [
        { ul: ['「⚙ 설정 · 연동 › 백업」의 이 기기 사용량을 주기적으로 확인합니다.', '사업장 규정 보유기간(기본 3년)을 정하고 「보유기간 지난 기록 파기」를 분기마다 실행합니다. 서버는 select ac_purge(\'2023-11-20\'); (관리자)로 파기합니다.', '전체 백업(JSON)은 개인정보 파일이므로 암호가 걸린 사내 저장소에만 보관합니다.'] }] },
      { h: '문제 해결', key: ['공유 서버: 준비 전', '권한 없음 화면', '회사 정보가 안 나옴', '앱이 예전 화면'], blocks: [
        { table: { head: ['증상', '원인 · 조치'], rows: [['☁ 공유 서버: 준비 전', 'server/supabase_stac.sql 미실행 — SQL 실행'], ['🔒 권한 없음', '관리 콘솔 「프로그램별 권한」에서 출입 관리(stac) 사용 지정'], ['통합관리 메인에 카드가 없음', 'program_registry에 stac 확인(SQL 재실행) 또는 메인 프로그램 새 버전'], ['회사 정보를 못 찾음', '작은 회사는 공개 정보가 없음 — 서버 함수(카카오) 설정 또는 직접 입력'], ['웹훅 전송 실패', '받는 서버가 https · CORS 허용인지 확인(사내 http 장비는 중계 필요)'], ['저장 공간 부족 안내', '공유 서버에 올린 뒤 오래된 기록 파기 · 백업'], ['앱이 예전 화면', '웹은 새로고침, 앱은 stac-latest.apk 재설치']] } }] }
    ]
  }
};
/* ---------- 매뉴얼 화면 사진 (media/manual/*.jpg — 없으면 사진 없이) ---------- */
const MAN_IMG = {};
async function manualImgs(kind) {
  const ids = [...new Set(MANUAL[kind].sections.map(s => s.img).filter(Boolean))];
  await Promise.all(ids.map(async id => {
    if (MAN_IMG[id] !== undefined) return;
    try { const r = await fetch(mediaUrl(`media/manual/${id}.jpg`)); if (!r.ok) throw 0; const b = await r.blob(); MAN_IMG[id] = await new Promise(res => { const f = new FileReader(); f.onload = () => res(f.result); f.readAsDataURL(b); }); }
    catch (e) { MAN_IMG[id] = null; }
  }));
}
const MAN_CAP = { m_main: '메인 화면 — 좌측 상단 아이콘 · 통합 검색 · 디오라마', m_search: '통합 검색 — 초성 · 차량번호 앞 두 자리 · 업체', m_gate: '출입 담당 지정 화면', m_entry: '출입 등록 — 방문자 | 방문차량 입력', m_list: '통합 출입 현황 — 방문자 · 차량 한곳에', m_dup: '동명이인 확인', m_person: '방문자 통합 정보(소속 이력 · 차량 · 출입 기록)', m_car: '차량 통합 정보', m_co: '회사 기본정보(인터넷 공개 정보) · 소속 명단', m_now: '출입 현황 — 구내 체류 · 추이', m_data: 'DATA 조회 · 관리', m_dataco: '회사 소속 명단', m_report: '출력', m_set: '설정 · 연동(커스터마이징)', m_launch: '통합관리 시스템 메인 — 11번째 카드' };

/* ---------- 매뉴얼 → 문서 블록(Word·PDF) ---------- */
function manualBlocks(kind) {
  const M = MANUAL[kind], B = [];
  B.push({ k: 'title', t: `${APP.name}\n${M.title}`, sub: `${APP.ko} ${APP.version} · ${M.en} · ${M.sub}` });
  B.push({ k: 'info', rows: [['프로그램', `${APP.name} (${APP.ko})`, '버전', `${APP.version} · ${fmtDs(kstNow())}`], ['대상', kind === 'user' ? '보안 근무자 · 현장 관리자 · 지사 담당' : '제작자(owner) · 관리자(admin)', '웹 주소', APP.shareUrl]] });
  B.push({ k: 'h', t: '목 차' }); B.push({ k: 'p', t: M.sections.map((s, i) => `${i + 1}. ${s.h}`).join('\n') });
  M.sections.forEach((s, i) => {
    B.push({ k: 'pb' }); B.push({ k: 'h', t: `${i + 1}. ${s.h}` });
    B.push({ k: 'box', title: '핵심', items: s.key });
    if (s.img && MAN_IMG[s.img]) B.push({ k: 'img', src: MAN_IMG[s.img], wIn: 6.4, ratio: MAN_RATIO[s.img] || .56, caption: '▲ ' + (MAN_CAP[s.img] || '') });
    s.blocks.forEach(b => {
      if (b.p) B.push({ k: 'p', t: b.p });
      if (b.ol) B.push({ k: 'p', t: b.ol.map((x, j) => `${j + 1}) ${x}`).join('\n') });
      if (b.ul) B.push({ k: 'bullets', items: b.ul });
      if (b.table) B.push({ k: 'table', head: b.table.head, rows: b.table.rows, w: b.table.head.length === 2 ? [1.3, 4] : b.table.head.length === 3 ? [1.4, 1.2, 3.4] : undefined });
      if (b.tip) B.push({ k: 'box', title: '💡 도움말', items: [b.tip] });
      if (b.warn) B.push({ k: 'box', title: '⚠ 주의', items: [b.warn] });
    });
  });
  B.push({ k: 'p', t: `\n${APP.name} ${APP.version} — Designed & Developed by Rat Rae Choi` });
  return B;
}
const MAN_RATIO = {};
/* ---------- 매뉴얼 → 슬라이드(PPT·PDF) ---------- */
function manualSlides(kind) {
  const M = MANUAL[kind], S = []; let no = 1;
  S.push([Rc(0, 0, SW, SH, '0C2350'), Im(SW * .46, 0, SW * .54, SH, ASSET.hero, { cover: true, alpha: .9 }), Rc(.7, 1.4, .14, 1.9, C.green),
    T(1.0, 1.25, 6.5, .5, `${APP.org} · ${APP.ko}`, { size: 15, color: 'B9C3EC' }), T(1.0, 1.75, 6.5, 1.2, M.title, { size: 40, bold: true, color: 'FFFFFF' }),
    T(1.0, 2.85, 6.5, .5, `${M.en} · ${APP.version}`, { size: 16, color: 'D7DEFF' }), T(1.0, 3.5, 6.3, 1, M.sub, { size: 13, color: 'B9C3EC' }),
    Im(1.0, 5.4, 1.1, 1.1, ASSET.icon), T(2.25, 5.5, 5, .5, APP.name, { size: 14, bold: true, color: 'FFFFFF' }), T(2.25, 5.9, 5, .5, 'Designed & Developed by Rat Rae Choi', { size: 11, color: 'B9C3EC', it: true })]);
  S.push(slideBase('목 차', ++no).concat([Im(.6, 1.3, 4, 5.3, ASSET.fig.dio_sec, { contain: true }), T(5.2, 1.25, 7.6, 5.7, M.sections.map((s, i) => `${i + 1}.  ${s.h}`).join('\n'), { size: 17, color: C.ink, line: 1.45 })]));
  M.sections.forEach((s, i) => {
    const im = s.img && MAN_IMG[s.img], els = slideBase(`${i + 1}. ${s.h}`, ++no, M.title);
    els.push(Rc(.45, 1.15, im ? 5.2 : 12.45, 5.75, 'EEF7F1', { r: .1 }), T(.7, 1.25, im ? 4.8 : 12, .45, '핵심', { size: 14, bold: true, color: C.greenD }), T(.75, 1.75, im ? 4.75 : 11.9, 5.0, s.key.map(k => '✔  ' + k).join('\n'), { size: 16, color: C.ink, line: 1.55 }));
    if (im) els.push(Im(5.85, 1.15, 7.05, 5.2, im, { contain: true }), T(5.85, 6.4, 7.05, .4, '▲ ' + (MAN_CAP[s.img] || ''), { size: 10, color: C.gray, align: 'center' }));
    S.push(els);
    s.blocks.filter(b => b.table).forEach(b => {
      const n = b.table.head.length, cw = n === 2 ? [3.2, 9.25] : n === 3 ? [3, 2.2, 7.25] : b.table.head.map(() => 12.45 / n);
      S.push(slideBase(`${i + 1}. ${s.h}`, ++no, M.title).concat([Tb(.45, 1.15, 12.45, tblRows(b.table.head, b.table.rows.slice(0, 12)), cw, { size: b.table.rows.length > 7 ? 10 : 12 })]));
    });
    const tx = s.blocks.filter(b => b.ol || b.p || b.ul || b.tip || b.warn).map(b => b.ol ? b.ol.map((x, j) => `${j + 1}) ${x}`).join('\n') : b.ul ? b.ul.map(x => '• ' + x).join('\n') : b.tip ? '💡 ' + b.tip : b.warn ? '⚠ ' + b.warn : b.p).join('\n\n');
    if (tx) S.push(slideBase(`${i + 1}. ${s.h}`, ++no, M.title).concat([T(.6, 1.2, 12.2, 5.8, tx, { size: tx.length > 700 ? 12 : 14, color: C.ink, line: 1.4 })]));
  });
  return S;
}
async function outManual(kind, fmt) {
  busy(true, `${MANUAL[kind].title} 만드는 중…`);
  try {
    await manualImgs(kind);
    await Promise.all(Object.entries(MAN_IMG).filter(([k, v]) => v && !MAN_RATIO[k]).map(async ([k, v]) => { const im = await loadImg(v); MAN_RATIO[k] = im.naturalHeight / im.naturalWidth; }));
    const nm = `${MANUAL[kind].file}_${APP.version}`;
    if (fmt === 'docx') await download(await packDocx(blocksToDocx(manualBlocks(kind)), nm), nm + '.docx');
    else if (fmt === 'pptx') await download(await slidesToPptx(manualSlides(kind), nm), nm + '.pptx');
    else if (fmt === 'pptpdf') await download(await slidesToPdf(manualSlides(kind), nm), nm + '_슬라이드.pdf');
    else await download(await blocksToPdf(manualBlocks(kind), nm), nm + '.pdf');
    toast(`${MANUAL[kind].title}를 만들었습니다`);
  } catch (e) { console.error(e); toast('만들지 못했습니다: ' + (e.message || e), 5000); } finally { busy(false); }
}
/* ---------- 프로그램 안 매뉴얼 창 ---------- */
function openManual(kind) {
  if (kind === 'admin' && !isAdminUser() && !window.__STAC_DOCGEN) return toast('제작자 관리매뉴얼은 제작자 · 관리자만 볼 수 있습니다');
  const M = MANUAL[kind];
  const html = M.sections.map((s, i) => `<section id="man${i}" style="margin-bottom:18px"><h3 style="margin:0 0 6px;color:var(--nv)">${i + 1}. ${esc(s.h)}</h3><ul class="hl" style="margin-bottom:8px">${s.key.map(k => `<li>${esc(k)}</li>`).join('')}</ul>
    ${s.blocks.map(b => b.p ? `<p style="font-size:13.5px">${esc(b.p)}</p>` : b.ol ? `<ol style="font-size:13.5px;padding-left:20px">${b.ol.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : b.ul ? `<ul style="font-size:13.5px;padding-left:20px">${b.ul.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : b.table ? `<div class="tblw" style="margin:6px 0"><table class="t" style="min-width:0"><thead><tr>${b.table.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${b.table.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : b.tip ? `<p class="spiform">💡 ${esc(b.tip)}</p>` : b.warn ? `<p class="spiform" style="background:#FFF4E5">⚠ ${esc(b.warn)}</p>` : '').join('')}</section>`).join('');
  openModal(`<h2>📘 ${esc(M.title)} <small class="hint">${esc(M.en)} · ${APP.version}</small></h2><div class="sub">${esc(M.sub)}</div>
    <div class="row" style="margin-bottom:10px">${kind === 'user' ? (isAdminUser() ? '<button class="btn sm" id="mnOther">🛡️ 제작자 관리매뉴얼</button>' : '') : '<button class="btn sm" id="mnOther">👤 사용자 매뉴얼</button>'}<button class="btn sm bw" style="color:#fff;border:0" data-mf="docx">⬇ Word</button><button class="btn sm bp" style="color:#fff;border:0" data-mf="pptx">⬇ PPT</button><button class="btn sm bf" style="color:#fff;border:0" data-mf="pdf">⬇ PDF</button></div>
    <div class="row" style="margin-bottom:10px">${M.sections.map((s, i) => `<a class="chip" href="#man${i}">${i + 1}. ${esc(s.h)}</a>`).join('')}</div>
    <div style="max-height:62vh;overflow:auto;padding-right:6px">${html}</div>
    <div class="mrow"><a class="btn" href="${APP.repo}#readme" target="_blank" rel="noopener">GitHub 안내</a><button class="btn pri" id="mClose">닫기</button></div>`, md => {
    md.querySelector('#mClose').onclick = closeModal; const mo = md.querySelector('#mnOther'); if (mo) mo.onclick = () => openManual(kind === 'user' ? 'admin' : 'user');
    md.querySelectorAll('[data-mf]').forEach(b => b.onclick = () => outManual(kind, b.dataset.mf));
  }, 2);
}
