# Design Spec: V2 — 카테고리 태그 + 다크모드

> Date: 2026-04-06
> Status: APPROVED
> Branch: feature/v2-category-darkmode
> References: SRS.md (FR-01-6), CLAUDE.md, DESIGN.md

---

## Overview

기존 "오늘 뭐 먹지?" 앱에 두 가지 V2 기능 추가:
1. **카테고리 태그 + 필터** — 메뉴에 카테고리 부여, 룰렛/투표 시 카테고리 필터링
2. **다크모드** — CSS variables 전환, localStorage 저장

## Feature 1: 카테고리 태그 + 필터

### 데이터 모델 변경

기존 메뉴: `{ id, name, createdAt }`
변경 후: `{ id, name, category, createdAt }`

- 고정 카테고리 6개: `['한식','일식','중식','양식','아시안','기타']`
- `Menu.CATEGORIES` 상수로 노출
- `Menu.add(name, category)` — category 파라미터 추가 (기본값: '기타')
- **마이그레이션**: localStorage 로드 시 category 필드 없는 메뉴는 '기타' 자동 부여

### UI: 메뉴 추가

- 기존 텍스트 입력 옆에 `<select>` 드롭다운 추가
- 옵션: 한식/일식/중식/양식/아시안/기타 (기본: 기타)
- 메뉴 리스트에서 이름 옆에 카테고리 태그 칩 표시

### UI: 카테고리 필터

- 룰렛 탭 상단 (탭 바로 아래): 필터 칩 행
- 칩 목록: [전체] [한식] [일식] [중식] [양식] [아시안] [기타]
- 기본 상태: "전체" 활성
- 클릭 동작: "전체" 클릭 → 모든 필터 해제. 개별 카테고리 클릭 → 토글 (복수 선택 가능)
- 투표 탭에도 동일한 필터 적용
- 필터 상태는 탭 전환 시 유지, 새로고침 시 초기화 (localStorage 저장 안 함)

### 룰렛 연동

- `Roulette.buildWheel(container, filterCategories)` — filterCategories 배열이 비어있으면 전체
- `Roulette.calcWeights(filterCategories)` — 필터된 메뉴만 대상
- `Roulette.spin()` — 기존과 동일 (sectors 배열이 이미 필터됨)

### 엣지 케이스

- 필터 결과 메뉴 0개: "선택한 카테고리에 메뉴가 없어요" + 돌리기 disabled
- 필터 결과 메뉴 1개: "메뉴가 1개뿐이에요. 더 추가하면 재밌어요!" + disabled
- 메뉴 삭제로 필터 결과가 0이 되면: 자동으로 빈 상태 표시

## Feature 2: 다크모드

### CSS

- `[data-theme="dark"]` 셀렉터로 CSS variables 오버라이드:
  - `--bg: #1A1A2E`
  - `--surface: #242438`
  - `--text: #F0F0F5`
  - `--muted: #9CA3AF`
  - `--border: #374151`
- 알러트 색상도 다크모드 대응 (design-preview.html 참고)
- 룰렛 휠: 밝은 배경에서와 동일하게 유지 (색상 섹터는 자체 색)

### UI

- 헤더 우측에 토글 버튼: 🌙 (라이트 시) / ☀️ (다크 시)
- 버튼 스타일: 작은 원형, border, transparent bg
- 전환 시 `document.documentElement.dataset.theme` 변경
- transition: `background 0.3s, color 0.3s` (부드러운 전환)

### 저장

- localStorage 키: `lunch-roulette-theme` (값: `'dark'` 또는 `'light'`)
- 페이지 로드 시: 저장된 값 있으면 적용, 없으면 라이트 (기본)
- `Storage` 모듈 사용 (기존 try/catch 패턴)

## 영향 파일

| 파일 | 변경 내용 |
|------|-----------|
| `index.html` | `<select>` 드롭다운, 필터 칩 컨테이너, 다크모드 토글 버튼 |
| `js/menu.js` | category 필드, CATEGORIES 상수, add() 파라미터 추가, 마이그레이션 |
| `js/roulette.js` | buildWheel/calcWeights에 filter 파라미터 |
| `js/app.js` | 필터 UI 로직, 다크모드 토글, 카테고리 드롭다운, 렌더 함수 수정 |
| `css/style.css` | 태그 칩, 필터 칩, 다크모드 variables, 토글 버튼 |

## 에러 처리

| 상황 | 처리 |
|------|------|
| 필터 결과 0개 | 빈 상태 안내 + disabled |
| 필터 결과 1개 | 기존 1개 메뉴 로직과 동일 |
| 기존 메뉴 category 없음 | '기타' 자동 마이그레이션 |
| 다크모드 저장 실패 | 메모리 상태로 유지 |

## DESIGN.md 준수

- 태그 칩: `--radius-full`, 작은 텍스트, 카테고리별 색상 (DESIGN.md 팔레트 내)
- 필터 칩: active 상태 = primary bg + white text, inactive = ghost
- 다크모드 토글: `--radius-full`, border만
- 다크모드 색상: DESIGN.md에 이미 정의됨 (Dark mode 섹션)
