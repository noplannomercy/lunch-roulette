# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0.0] - 2026-04-06

### Added
- Category tags: menus now have a category (한식/일식/중식/양식/아시안/기타)
- Category filter chips on roulette and vote tabs — filter by food type before spinning
- Dark mode toggle with localStorage persistence
- Category select dropdown in menu management
- Filter state persistence across page refreshes

### Changed
- Menu data model extended with `category` field (existing menus auto-migrate to '기타')
- Roulette wheel and vote list respect active category filters
- Empty state messages adapt to filter context ("선택한 카테고리에 메뉴가 없어요")

## [0.1.0.0] - 2026-04-06

### Added
- Team lunch roulette wheel with animated CSS conic-gradient sectors
- Menu management: add/delete menus with duplicate and empty input validation
- Team voting system with +1 buttons and visual bar chart
- Weighted roulette: votes and lunch history affect sector sizes
- History tracking with 30-day retention and weight decay (3-day: 50%, 7-day: 75%)
- Result overlay with confetti animation on menu selection
- Tab navigation with URL hash persistence (룰렛/투표/히스토리)
- Playful design system: orange primary (#FF6B35), deep blue secondary (#004E89)
- Mobile-first responsive layout (420px max-width)
- localStorage persistence for menus, votes, and history
- Safety timeout fallback for spin animation (prevents stuck state)
- Empty state messages for all screens
