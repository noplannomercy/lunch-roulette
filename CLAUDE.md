# 오늘 뭐 먹지? — 팀 점심 룰렛

## 작업 시작 전
이 파일을 끝까지 읽은 뒤 작업을 시작하라.
DESIGN.md를 반드시 먼저 읽고 UI/스타일 작업에 착수하라.

## 개요
팀 점심 메뉴 결정 룰렛 웹앱. Vanilla JS (IIFE), localStorage, 백엔드 없음.
`index.html`을 브라우저에서 열면 동작. 빌드 없음. `file://` 호환.

## 제약 사항

| # | 제약 | 이유 |
|---|------|------|
| C1 | `innerHTML`로 사용자 입력을 렌더링하지 마라. `textContent`만 사용하라. `innerHTML = ''` (빈값 리셋)만 허용. | XSS 방지. 사용자가 메뉴명에 `<script>` 넣을 수 있음. |
| C2 | `import`/`export` 사용하지 마라. `<script>` 태그 방식만 허용. | `file://`에서 ES 모듈 CORS 에러 발생. |
| C3 | 히스토리 모듈 이름은 `window.LunchHistory`다. `window.History` 사용하지 마라. | 브라우저 내장 `window.history` API와 충돌. eng-review에서 발견. |
| C4 | `Roulette.spin()`의 setTimeout fallback (SPIN_DURATION + 1000ms)을 제거하지 마라. | `transitionend`가 안 뜨면 앱이 영구 spinning 상태에 빠짐. eng-review에서 발견. |
| C5 | `<script>` 로드 순서를 바꾸지 마라: storage → menu → history → vote → roulette → app. | 의존성 체인. 순서 틀리면 undefined 에러. |

## 준수 사항

| # | 규칙 |
|---|------|
| D1 | 모든 JS 모듈은 IIFE 패턴: `window.X = (function() { return {...}; })();` |
| D2 | `Storage.set()`은 반드시 `try/catch`로 감싸라 (QuotaExceeded 대비). |
| D3 | 새 기능 추가 시 DESIGN.md의 색상/폰트/스페이싱을 CSS 변수로 참조하라. |
| D4 | 메뉴명 중복 체크는 대소문자 무시 (`toLowerCase()` 비교). |
| D5 | 결과 확인 버튼 클릭 시: 히스토리 저장 → 투표 초기화 → 오버레이 닫기 순서를 지켜라. |

## 스택

| 항목 | 값 |
|------|-----|
| 언어 | Vanilla JS (ES5 호환) |
| 스타일 | CSS3 (conic-gradient, CSS transitions, CSS variables) |
| 저장소 | localStorage (prefix: `lunch-roulette-`) |
| 폰트 | Cabinet Grotesk (CDN) + DM Sans + JetBrains Mono |
| 디자인 | DESIGN.md 참조. Primary #FF6B35, Secondary #004E89, BG #FFFBF5 |

## 구조

| 경로 | 역할 | 전역 객체 | 의존 |
|------|------|-----------|------|
| `index.html` | 메인 HTML, 모든 리소스 로드 | — | — |
| `css/style.css` | 전체 스타일 + 애니메이션 + 반응형 | — | — |
| `js/storage.js` | localStorage CRUD + 에러 처리 | `window.Storage` | 없음 |
| `js/menu.js` | 메뉴 CRUD + 카테고리 + 중복체크 | `window.Menu` | Storage |
| `js/history.js` | 히스토리 기록 + 가중치 계산 | `window.LunchHistory` | Storage |
| `js/vote.js` | 투표 집계 + 리셋 | `window.Vote` | Storage |
| `js/roulette.js` | 휠 렌더링 + 가중치 합산 + 스핀 | `window.Roulette` | Menu, Vote, LunchHistory |
| `js/app.js` | 탭, 이벤트, 오버레이, 컨페티, 필터, 다크모드 | `window.App` | 전체 |

## 데이터 모델

| localStorage 키 | 타입 | 설명 |
|-----------------|------|------|
| `lunch-roulette-menus` | `[{id, name, category, createdAt}]` | 메뉴 목록 (category: 한식/일식/중식/양식/아시안/기타) |
| `lunch-roulette-votes` | `{menuId: count}` | 현재 라운드 투표 |
| `lunch-roulette-history` | `[{menuName, date, timestamp}]` | 최대 30일 기록 |
| `lunch-roulette-filters` | `["한식","일식",...]` | 활성 카테고리 필터 (빈 배열 = 전체) |
| `lunch-roulette-theme` | `"light"` or `"dark"` | 다크모드 설정 |

## 가중치 공식
최종 가중치 = 투표 가중치 x 히스토리 가중치
- 투표: `votes[id] / totalVotes` (전체 0표 → 1/N, 부분 0표 → 0.5/N)
- 히스토리: 3일내 0.5, 4-7일 0.75, 8일+ 1.0
- 섹터 각도: `(최종 / 합계) x 360`

## 완료 조건
작업이 끝났다고 판단하기 전에 아래를 모두 확인하라.

```bash
# 1. 미커밋 파일 없음
git status --porcelain  # 출력 없어야 함

# 2. 브라우저 콘솔 에러 없음
# index.html 열고 DevTools Console 확인 — 에러 0건

# 3. 빈 상태에서 전체 플로우 동작
# 메뉴 2개 추가 → 돌리기 → 결과 오버레이 → 확인 → 히스토리 기록 확인
```

## 관련 문서
| 문서 | 용도 |
|------|------|
| [SRS.md](SRS.md) | 요구사항 명세 (FR 37개 + NFR 6그룹) |
| [DESIGN.md](DESIGN.md) | 디자인 시스템 (색상, 폰트, 스페이싱, 모션) |
| [CHANGELOG.md](CHANGELOG.md) | 변경 이력 |
| [tests/test-plan.md](tests/test-plan.md) | QA 테스트 플랜 |

## V2 vs V3 scope
| V2 (현재) | V3 (미래) |
|-----------|-----------|
| 룰렛 + 투표 + 히스토리 | 컨페티 (풍성) |
| 메뉴 추가/삭제 | PWA / 오프라인 (미정) |
| 카테고리 태그 + 필터 | |
| 다크모드 | |

## 하네스 진화 원칙
- 이 CLAUDE.md는 프로젝트와 함께 진화한다.
- 새 제약 사항이 발견되면 (버그, 리뷰 피드백, 런타임 에러) 즉시 제약 사항 테이블에 추가하라. 이유 컬럼을 반드시 채워라.
- 구현 순서, 진행 상태 같은 일시적 정보는 여기에 적지 마라. 플랜 파일이나 TODO에 적어라.
- 준수 사항이 7개를 넘으면 제약 사항으로 승격하거나 불필요한 것을 제거하라.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.

Key routing rules:
- Bugs, errors → invoke investigate
- Ship, deploy, PR → invoke ship
- QA, test the site → invoke qa
- Code review → invoke review
- Docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system → invoke design-consultation
- Visual audit → invoke design-review
- Architecture review → invoke plan-eng-review
