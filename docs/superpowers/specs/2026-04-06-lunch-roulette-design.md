# Design Spec: 오늘 뭐 먹지? — 팀 점심 룰렛

> Date: 2026-04-06
> Status: APPROVED
> References: SRS.md, DESIGN.md, office-hours 설계문서, CEO Review (HOLD SCOPE)

---

## Overview

팀 점심 메뉴 결정을 재미있게 해결하는 웹앱. 메뉴 등록 → 팀 투표 → 가중치 룰렛 → 히스토리 기록.
Vanilla JS, localStorage, 백엔드 없음. `file://`에서도 동작.

## Architecture

```
index.html ──── css/style.css
    │
    └── <script> (IIFE 패턴, 의존성 순 로드):
        storage.js ─┬─ menu.js ──┬─ vote.js ──┐
                    └─ history.js ┘            ├─ roulette.js ── app.js
                                               │
                                    (가중치 계산)
```

- 각 JS 파일은 IIFE로 감싸고 `window.*`로 공개 API만 노출
- 데이터: localStorage 3키 (`lunch-roulette-menus`, `-votes`, `-history`)
- UI: app.js가 탭 전환, 이벤트 바인딩, 초기 렌더 담당

## Implementation Strategy

**Bottom-up**: storage → menu → history → vote → roulette → app 순서.
의존성 방향과 `<script>` 로드 순서 일치. 각 레이어 완성 후 콘솔 테스트 가능.

## Components

### storage.js
```
window.Storage = (function() {
  // private: 없음
  return {
    get(key): any        // JSON.parse, 실패시 기본값 반환 + 키 삭제
    set(key, val): void  // JSON.stringify, try/catch (QuotaExceeded → console.warn)
    remove(key): void
  };
})();
```
- localStorage 키 prefix: `lunch-roulette-`
- 손상 JSON → `SyntaxError` catch → 기본값(`[]` or `{}`) 반환 + 해당 키 삭제
- QuotaExceeded → console.warn + 앱은 메모리 상태로 계속 동작

### menu.js
```
window.Menu = (function() {
  // private: menus 배열 (메모리 캐시)
  return {
    getAll(): Array<{id, name, createdAt}>
    add(name): {id, name, createdAt} | null  // 빈/공백/중복 → null + 에러 사유
    remove(id): boolean
    exists(name): boolean
  };
})();
```
- id: `crypto.randomUUID()` (없으면 `Date.now() + Math.random()` fallback)
- add(): trim() 적용, 빈문자열/중복 거부
- 변경 시 Storage.set() 호출

### history.js
```
window.History = (function() {
  // private: history 배열 (메모리 캐시)
  return {
    getAll(): Array<{menuName, date, timestamp}>
    add(menuName): void              // 현재 날짜+시간으로 기록
    getWeight(menuName): number      // 0.5 | 0.75 | 1.0
    cleanup(): void                  // 30일 초과 삭제
  };
})();
```
- getWeight(): 최근 3일 내 = 0.5, 4-7일 = 0.75, 8일+ = 1.0, 기록없음 = 1.0
- add() 호출 시 cleanup() 자동 실행

### vote.js
```
window.Vote = (function() {
  // private: votes 객체 (메모리 캐시)
  return {
    getAll(): Object<menuId, count>
    increment(menuId): number        // 새 투표수 반환
    getCount(menuId): number
    reset(): void
  };
})();
```
- 존재하지 않는 menuId → 0에서 시작
- reset(): 전체 투표 초기화 + Storage 저장

### roulette.js
```
window.Roulette = (function() {
  // private: currentRotation, isSpinning, sectors[]
  return {
    buildWheel(container): void      // conic-gradient 휠 + 라벨 DOM 생성
    calcWeights(): Array<{menu, weight, degrees}>  // 공개 (디버깅용)
    spin(): Promise<{menu, degrees}> // 회전 시작, transitionend에서 resolve
    isSpinning(): boolean
  };
})();
```

**가중치 계산 알고리즘:**
1. 각 메뉴의 투표 가중치: `votes[id] / totalVotes` (totalVotes=0이면 `1/N`)
2. 투표 있는데 0표인 메뉴: `0.5 / N`
3. 히스토리 가중치: `History.getWeight(name)`
4. 최종 가중치 = 투표 가중치 x 히스토리 가중치
5. 섹터 각도 = `(weight / totalWeight) * 360`

**회전 로직:**
1. 랜덤 목표 섹터 선택 (가중치 비례 확률)
2. 목표 각도 = 1800 (5바퀴) + 목표 섹터 중심각
3. CSS transition: `transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)`
4. transitionend → `transition: none` → `rotate(최종 % 360)` 리셋

**섹터 라벨 배치:**
- 각 라벨 `<div>`: `position: absolute` + `transform: rotate(섹터중심각) translateY(-radius*0.6)`
- 메뉴 변경 시 라벨 DOM 재생성

### app.js
```
window.App = (function() {
  // private: DOM refs, state
  return {
    init(): void  // DOMContentLoaded에서 호출
  };
})();
```

**책임:**
- 탭 네비게이션: URL hash 기반 (#roulette, #vote, #history)
- 메뉴 관리 UI: 접이식 accordion, 추가/삭제 이벤트
- 투표 UI: +1 버튼, 바 차트 렌더
- 히스토리 UI: 날짜별 리스트 렌더
- 결과 오버레이: 반투명 배경 + 메뉴명 + 확인 버튼
- 컨페티: CSS @keyframes + JS로 20개 div 생성, 1.5초 후 제거
- 돌리기 버튼 상태 관리 (disabled during spin, 메뉴 <2)

## Data Flow

```
돌리기 클릭
  → app.js: spin 버튼 disabled
  → Roulette.spin():
      Menu.getAll() → 메뉴 목록
      Vote.getAll() → 투표수
      History.getWeight(각 메뉴) → 히스토리 가중치
      calcWeights() → 섹터 각도 배열
      랜덤 목표 선택 → CSS rotate 적용
  → transitionend:
      각도 리셋 → 0.3초 딜레이
      결과 오버레이 + 컨페티 표시
  → 확인 클릭:
      History.add(결과)
      Vote.reset()
      오버레이 닫기 + spin 버튼 재활성화
```

## Error Handling

| 시점 | 에러 | 처리 |
|------|------|------|
| Storage.get | 손상 JSON | 기본값 반환, 키 삭제 |
| Storage.set | QuotaExceeded | console.warn, 메모리 동작 |
| Menu.add | 빈/공백 | 거부 + "메뉴명을 입력하세요" |
| Menu.add | 중복 | 거부 + "이미 있는 메뉴입니다" |
| 가중치 계산 | 합계 0 | 균등 분배 (1/N) |
| DOM 렌더 | XSS | textContent만 사용, innerHTML 금지 |

## UI States

| 화면 | 빈 상태 | 정상 상태 | 에러 상태 |
|------|---------|-----------|-----------|
| 룰렛 (0메뉴) | "메뉴를 추가해주세요" + disabled | 컬러 휠 + 돌리기 버튼 | — |
| 룰렛 (1메뉴) | "더 추가하면 재밌어요!" + disabled | — | — |
| 투표 | 메뉴 리스트 (0표) | 바 차트 + +1 버튼 | — |
| 히스토리 | "아직 기록이 없어요" | 날짜별 리스트 | — |
| 메뉴 관리 | 입력란만 표시 | 메뉴 리스트 + 삭제 버튼 | 중복/빈값 안내 |

## Design System Reference

DESIGN.md 준수:
- Primary: #FF6B35 / Secondary: #004E89 / Background: #FFFBF5
- Display: Cabinet Grotesk (CDN, system-ui fallback)
- Body: DM Sans / Data: JetBrains Mono
- Spacing: 8px base / Border radius: sm:6px, md:12px, lg:16px
- Motion: expressive (bounce easing, 컨페티, 3s 룰렛 회전)

## Testing

- 자동화 없음 (Vanilla JS + file://)
- `/qa`로 브라우저 기반 수동 QA
- `Roulette.calcWeights()` 공개하여 콘솔 디버깅 가능

## Build Sequence (Bottom-up)

1. git init + 파일 구조 생성 + index.html 기본 뼈대
2. storage.js + menu.js (데이터 레이어)
3. history.js + vote.js (데이터 레이어 2)
4. roulette.js (핵심 로직 + 휠 UI)
5. app.js (전체 오케스트레이션 + 탭 + 오버레이 + 컨페티)
6. style.css (DESIGN.md 기반 스타일링 + 반응형)
7. 통합 테스트 + `/qa`
