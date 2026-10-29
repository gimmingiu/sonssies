# 다국어 지원 계획 (보류 — 사용자가 요청하면 실행)

지원 언어: **한국어(기본) · 영어 · 일본어 · 중국어(간체)**
상태: 방식·글꼴·명칭 확정, 구현은 아직 안 함 (2026-10-29 정리)

## 1. 문구 분리
- 화면의 모든 글자를 언어별 문구표로 분리: 탭 이름, 버튼, 슬라이더 이름(길이·너비·두께…), 안내 문구, 통계 말풍선 설명, 저장 메시지, 푸터 제외 문구 등.
- 저장 카드 안의 글자도 포함: 말풍선 기본 글("반가워!"), 이름표 윗띠("내 이름은").
- 번역 초안은 Claude가 작성, 공개 전 원어민 검수 권장.

## 2. 언어 고르기
- 첫 접속: 브라우저/휴대폰 언어(`navigator.language`)로 자동 선택, 없으면 한국어.
- 화면 위쪽에 언어 버튼 `한 / EN / 日 / 中`.
- 주소로 고정 가능: `https://sonssies.com/?lang=en|ja|zh|ko` (공유 시 언어 고정).
- 고른 언어는 브라우저에 기억(편의용, 없어도 동작).

## 3. 글꼴 (확정)
| 언어 | 이름·말풍선 | 본문 | 숫자·푸터 |
|---|---|---|---|
| 한국어 | Jua | Noto Sans KR 500 | Nanum Gothic Coding |
| 영어 | Jua (라틴 포함) | Noto Sans KR 500 (라틴) | Nanum Gothic Coding |
| 일본어 | **Kosugi Maru** | Noto Sans JP 500 | Nanum Gothic Coding |
| 중국어 | **ZCOOL KuaiLe** | Noto Sans SC 500 | Nanum Gothic Coding |
- 고른 언어의 글꼴만 Google Fonts에서 불러옴.
- 캔버스(저장 카드)에 그릴 때도 언어별 글꼴 사용 → `document.fonts.load(글꼴, 글자)`로 미리 받기.
- 글꼴마다 글자 크기가 달라 보이니 이름표·말풍선 크기 배율을 언어별로 맞출 것.

## 4. 명칭·규칙 (확정/제안)
- **도깨비 = `Dokkaebi`** (영어·일본어·중국어 모두 고유명사로 표기, 번역하지 않음). 일본어 표기는 `ドッケビ`를 병기할지 검토.
- 서비스 이름 예: EN "Make your Dokkaebi buddy" / JA「わたしのDokkaebiをつくろう」/ ZH「制作我的Dokkaebi」 (검수 필요)
- 랜덤 이름 목록: 언어별로 따로 (영어는 짧은 귀여운 이름, 일본어는 가타카나, 중국어는 2자 이름 위주).
- 이름 글자 수: 한국어 8자 / 영문 12자 그대로, 일본어·중국어 8자. 띄어쓰기 불가는 공통.
- 저장 파일명: 한국어 이름은 지금처럼 로마자 변환, 그 외 글자는 `dokkaebi_yyyymmdd_hhmmss.png`.

## 5. 구현 메모
- `src/dokkaebi-artifact.html` 안에 `I18N={ko:{…},en:{…},ja:{…},zh:{…}}`와 `t(key)` 함수, `data-i18n` 속성으로 정적 문구 교체.
- GROUPS(슬라이더 정의)의 이름도 키로 바꿔 `t()`로 표시.
- `<html lang>`과 OG 태그(사이트 빌드)도 언어 반영.
- 확인: `tools/test_page.js`에 `?lang=` 별로 렌더해 글자 넘침·줄바꿈 점검 (일본어·중국어 폰트는 @fontsource/kosugi-maru, @fontsource/zcool-kuaile, @fontsource/noto-sans-jp, @fontsource/noto-sans-sc 로 대체 가능).
