# 오늘 뭐 먹지? — 팀 점심 룰렛

## Project
- 팀 점심 메뉴를 룰렛으로 결정하는 웹앱
- Vanilla JS (IIFE 패턴), 프레임워크 없음, 백엔드 없음
- localStorage로 데이터 저장
- `file://`에서도 동작 (로컬 서버 불필요)
- 모바일 퍼스트 420px 고정 폭

## How to run
`index.html`을 브라우저에서 열면 됨. 빌드 없음.

## File structure and load order
`<script>` 태그로 의존성 순서대로 로드. 순서가 중요함.

```
index.html              — 메인 HTML, 모든 JS/CSS 로드
css/
  style.css             — 전체 스타일 (DESIGN.md 기반)
js/
  storage.js            — 1. localStorage 래퍼 (의존성 없음)
  menu.js               — 2. 메뉴 CRUD (Storage 의존)
  history.js            — 3. 히스토리 + 가중치 (Storage 의존)
  vote.js               — 4. 투표 (Storage 의존)
  roulette.js           — 5. 룰렛 휠 + 스핀 (Menu, Vote, LunchHistory 의존)
  app.js                — 6. 앱 오케스트레이션 (전체 의존)
```

## Module APIs
각 모듈은 IIFE로 감싸고 `window.*`에 공개 API 노출.

| Module | Global | Key methods |
|--------|--------|-------------|
| storage.js | `window.Storage` | `get(key, default)`, `set(key, val)`, `remove(key)` |
| menu.js | `window.Menu` | `getAll()`, `add(name)`, `remove(id)`, `exists(name)` |
| history.js | `window.LunchHistory` | `getAll()`, `add(menuName)`, `getWeight(menuName)`, `cleanup()` |
| vote.js | `window.Vote` | `getAll()`, `increment(menuId)`, `getCount(menuId)`, `reset()` |
| roulette.js | `window.Roulette` | `buildWheel(container)`, `calcWeights()`, `spin()`, `isSpinning()` |
| app.js | `window.App` | `init()` |

주의: `window.LunchHistory`임 (`window.History` 아님 — 브라우저 내장 history API와 충돌 방지).

## Data model (localStorage)
| Key | Type | Description |
|-----|------|-------------|
| `lunch-roulette-menus` | `Array<{id, name, createdAt}>` | 등록된 메뉴 목록 |
| `lunch-roulette-votes` | `Object<menuId, count>` | 현재 라운드 투표수 |
| `lunch-roulette-history` | `Array<{menuName, date, timestamp}>` | 히스토리 (최대 30일) |

## Coding rules
- **XSS 방지**: 사용자 입력 렌더링 시 반드시 `textContent` 사용. `innerHTML`은 빈값 리셋(`= ''`)에만 허용.
- **IIFE 패턴**: 모든 JS 모듈은 `window.ModuleName = (function() { ... })();` 형태.
- **ES 모듈 사용 금지**: `<script>` 태그 방식. `import`/`export` 쓰지 않음.
- **에러 처리**: `Storage.set()`은 `try/catch`로 QuotaExceeded 처리. `Storage.get()`은 손상 JSON시 기본값 반환.
- **spin safety**: `Roulette.spin()`에 4초 setTimeout fallback 있음 (transitionend 미발생 방지).

## Weight algorithm
최종 가중치 = 투표 가중치 x 히스토리 가중치
- 투표 가중치: `votes[id] / totalVotes` (0표 전체 → 1/N, 부분 0표 → 0.5/N)
- 히스토리 가중치: 3일 내 = 0.5, 4-7일 = 0.75, 8일+ = 1.0
- 섹터 각도: `(최종 가중치 / 전체 합) x 360`

## Related docs
- [SRS.md](SRS.md) — 요구사항 명세 (FR 37개 + NFR 6그룹)
- [DESIGN.md](DESIGN.md) — 디자인 시스템 (색상, 폰트, 스페이싱, 모션)
- [CHANGELOG.md](CHANGELOG.md) — 변경 이력
- [tests/test-plan.md](tests/test-plan.md) — QA 테스트 플랜

## V1 vs V2 scope
| V1 (현재) | V2 (미래) |
|-----------|-----------|
| 룰렛 + 투표 + 히스토리 | 카테고리 태그 + 필터 |
| 메뉴 추가/삭제 | 다크모드 |
| 컨페티 (간단) | 컨페티 (풍성) |
| localStorage | PWA / 오프라인 (미정) |

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.
