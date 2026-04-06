# Design System — 오늘 뭐 먹지?

## Product Context
- **What this is:** 팀 점심 룰렛 웹앱. 메뉴 등록, 팀 투표, 가중치 룰렛, 히스토리.
- **Who it's for:** 팀/동료들. 한 기기에서 같이 보면서 사용.
- **Space/industry:** 팀 문화 / 의사결정 도구
- **Project type:** 모바일 퍼스트 웹앱 (Vanilla JS, 백엔드 없음)

## Aesthetic Direction
- **Direction:** Playful/Toy-like
- **Decoration level:** intentional (미묘한 grain 텍스처, 룰렛 색상 섹터)
- **Mood:** 밝고, 둥글고, 에너지 넘치는. 점심 시간의 재미를 시각적으로 전달. 진지한 도구가 아니라 팀 이벤트.
- **Reference sites:** 없음 (디자인 지식 기반 제안)

## Typography
- **Display/Hero:** Cabinet Grotesk — 둥글고 활기찬 제목체. 친근하면서 개성 있음.
- **Body:** DM Sans — 깨끗하고 가독성 좋은 본문체. tabular-nums 지원.
- **UI/Labels:** DM Sans (same as body)
- **Data/Tables:** JetBrains Mono — 투표 수치, 히스토리 날짜 표시. tabular-nums.
- **Code:** JetBrains Mono
- **Loading:** Cabinet Grotesk는 Fontsource, DM Sans / JetBrains Mono는 Google Fonts CDN
- **Scale:**
  - hero: 36px (2.25rem)
  - h1: 24px (1.5rem)
  - h2: 18px (1.125rem)
  - body: 16px (1rem)
  - small: 14px (0.875rem)
  - caption: 12px (0.75rem)
  - tiny: 11px (0.6875rem)

## Color
- **Approach:** balanced
- **Primary:** #FF6B35 — 망고 오렌지. 식욕, 에너지, 재미. 돌리기 버튼, 헤딩, 강조.
- **Primary hover:** #E85A2A
- **Secondary:** #004E89 — 딥 블루. 신뢰, 투표 버튼, UI 보조 요소.
- **Secondary hover:** #003D6B
- **Background:** #FFFBF5 — 따뜻한 크림. 음식과 어울리는 따뜻함.
- **Surface:** #FFFFFF
- **Text:** #1A1A2E — 다크 네이비. 순수 블랙보다 부드러움.
- **Muted:** #6B7280
- **Border:** #E5E7EB
- **Neutrals:** #FFFBF5 (lightest) → #F9FAFB → #F3F4F6 → #E5E7EB → #D1D5DB → #9CA3AF → #6B7280 → #4B5563 → #374151 → #1F2937 → #1A1A2E (darkest)
- **Semantic:** success #10B981, warning #F59E0B, error #EF4444, info #3B82F6
- **Dark mode:** 배경 #1A1A2E, 서피스 #242438, 텍스트 #F0F0F5, 채도 10-20% 감소

## Spacing
- **Base unit:** 8px
- **Density:** comfortable
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px)

## Layout
- **Approach:** grid-disciplined
- **Grid:** 단일 컬럼, 420px 고정 폭
- **Max content width:** 420px
- **Border radius:**
  - sm: 6px (인풋, 태그, 작은 버튼)
  - md: 12px (카드, 버튼, 알러트)
  - lg: 16px (모달, 큰 컨테이너)
  - full: 9999px (뱃지, 토글)
- **Shadow:**
  - default: 0 2px 8px rgba(26,26,46,0.08)
  - lg: 0 8px 24px rgba(26,26,46,0.12)

## Motion
- **Approach:** expressive — 룰렛 회전이 제품의 핵심이므로 모션에 투자.
- **Easing:**
  - enter: ease-out
  - exit: ease-in
  - move: ease-in-out
  - roulette: cubic-bezier(0.17, 0.67, 0.12, 0.99) — 감속 회전
  - bounce: cubic-bezier(0.34, 1.56, 0.64, 1)
- **Duration:**
  - micro: 50-100ms (호버, 포커스)
  - short: 150-250ms (버튼 클릭, 탭 전환)
  - medium: 250-400ms (카드 입장, 슬라이드)
  - long: 400-700ms (컨페티, 바운스)
  - roulette: 3000ms (룰렛 회전)

## CSS Variables
```css
:root {
  --primary: #FF6B35;
  --primary-hover: #E85A2A;
  --secondary: #004E89;
  --secondary-hover: #003D6B;
  --bg: #FFFBF5;
  --surface: #FFFFFF;
  --text: #1A1A2E;
  --muted: #6B7280;
  --border: #E5E7EB;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --shadow: 0 2px 8px rgba(26,26,46,0.08);
  --shadow-lg: 0 8px 24px rgba(26,26,46,0.12);
}
```

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-06 | Initial design system created | /design-consultation. Playful aesthetic for team lunch roulette. |
| 2026-04-06 | Cabinet Grotesk for display | 개성 있는 둥근 제목체. Inter/Poppins 대비 차별화. |
| 2026-04-06 | #FF6B35 primary | 음식 앱의 따뜻한 오렌지. 식욕 자극 + 에너지. |
| 2026-04-06 | #004E89 secondary | 오렌지와 보색 대비. 투표 UI에 신뢰감. |
| 2026-04-06 | Expressive motion | 룰렛 애니메이션이 제품 핵심이므로 모션 최대 투자. |
