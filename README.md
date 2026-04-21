# 오늘 뭐 먹지? 🎰

팀 점심 메뉴를 재미있게 결정하는 룰렛 웹앱.

## 기능

- **룰렛** — 컬러풀한 원형 휠이 돌아가면서 메뉴 선정. CSS conic-gradient + 감속 애니메이션.
- **팀 투표** — +1 버튼으로 투표. 투표수에 비례해 룰렛 섹터 크기 조절.
- **히스토리** — 30일간 기록 보관. 최근 먹은 메뉴는 가중치 감소 (중복 방지).
- **메뉴 관리** — 추가/삭제. 중복 자동 거부.

## 사용법

`index.html`을 브라우저에서 열면 됩니다. 서버 불필요.

1. 메뉴 관리에서 메뉴 추가 (최소 2개)
2. 돌리기 버튼 클릭
3. 결과 확인 → 히스토리에 자동 저장

투표 탭에서 팀원 의견을 모은 뒤 "투표 결과로 룰렛 돌리기"로 가중치 반영 가능.

## 기술 스택

- Vanilla JS (IIFE 패턴, 프레임워크 없음)
- CSS3 (conic-gradient, CSS transitions)
- localStorage (백엔드 없음)
- `file://`에서도 동작

## 파일 구조

```
index.html          — 메인 HTML
css/style.css       — 전체 스타일 (DESIGN.md 기반)
js/
  storage.js        — localStorage 래퍼
  menu.js           — 메뉴 CRUD
  history.js        — 히스토리 + 가중치 계산
  vote.js           — 팀 투표
  roulette.js       — 룰렛 휠 + 스핀 애니메이션
  app.js            — 앱 오케스트레이션
```

## 디자인

[DESIGN.md](DESIGN.md) 참조. Playful/Toy-like 미학, #FF6B35 오렌지 + #004E89 블루.

## 문서

- [SRS.md](SRS.md) — 요구사항 명세
- [DESIGN.md](DESIGN.md) — 디자인 시스템
- [CHANGELOG.md](CHANGELOG.md) — 변경 이력
