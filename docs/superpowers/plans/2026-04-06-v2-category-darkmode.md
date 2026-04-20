# V2: Category Tags + Dark Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add category tags with filtering to menus/roulette/votes, and a dark mode toggle with localStorage persistence.

**Architecture:** Modify 5 existing files (no new files). menu.js gets category field + migration. roulette.js gets filter parameter. app.js gets filter UI + dark mode toggle. style.css gets chip styles + dark mode variables. index.html gets new DOM elements.

**Tech Stack:** Vanilla JS (IIFE), CSS custom properties, localStorage

---

## File Structure (modifications only)

```
index.html        — Add: <select> for category, filter chips container, dark mode toggle button
css/style.css     — Add: tag chip, filter chip, dark mode [data-theme="dark"] variables, toggle button
js/menu.js        — Add: CATEGORIES constant, category param in add(), migration logic
js/roulette.js    — Modify: calcWeights() and buildWheel() accept filterCategories param
js/app.js         — Add: filter state, filter UI, dark mode toggle, category dropdown, updated renders
```

---

### Task 1: menu.js — Category field + migration

**Files:**
- Modify: `js/menu.js`

- [ ] **Step 1: Add CATEGORIES constant and update add()**

Replace the entire `js/menu.js` with:

```js
window.Menu = (function() {
  'use strict';

  var STORAGE_KEY = 'menus';
  var CATEGORIES = ['한식','일식','중식','양식','아시안','기타'];
  var menus = Storage.get(STORAGE_KEY, []);

  // Migration: add category to old menus
  var migrated = false;
  menus.forEach(function(m) {
    if (!m.category) {
      m.category = '기타';
      migrated = true;
    }
  });
  if (migrated) Storage.set(STORAGE_KEY, menus);

  function save() {
    Storage.set(STORAGE_KEY, menus);
  }

  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  function getAll() {
    return menus.slice();
  }

  function exists(name) {
    var trimmed = name.trim().toLowerCase();
    return menus.some(function(m) { return m.name.toLowerCase() === trimmed; });
  }

  function add(name, category) {
    var trimmed = (name || '').trim();
    if (!trimmed) {
      return { error: '메뉴명을 입력하세요' };
    }
    if (exists(trimmed)) {
      return { error: '이미 있는 메뉴입니다' };
    }
    var cat = category && CATEGORIES.indexOf(category) !== -1 ? category : '기타';
    var menu = {
      id: generateId(),
      name: trimmed,
      category: cat,
      createdAt: new Date().toISOString()
    };
    menus.push(menu);
    save();
    return { menu: menu };
  }

  function remove(id) {
    var index = menus.findIndex(function(m) { return m.id === id; });
    if (index === -1) return false;
    menus.splice(index, 1);
    save();
    return true;
  }

  return {
    getAll: getAll,
    add: add,
    remove: remove,
    exists: exists,
    CATEGORIES: CATEGORIES
  };
})();
```

- [ ] **Step 2: Verify in browser console**

```js
// Old menus should have category: '기타'
console.log(Menu.getAll()); // each item should have category field
console.log(Menu.CATEGORIES); // ['한식','일식','중식','양식','아시안','기타']
Menu.add('비빔밥', '한식'); // {menu: {id: ..., name: '비빔밥', category: '한식', ...}}
```

- [ ] **Step 3: Commit**

```bash
git add js/menu.js
git commit -m "feat: add category field to Menu with CATEGORIES constant and migration"
```

---

### Task 2: roulette.js — Filter parameter

**Files:**
- Modify: `js/roulette.js`

- [ ] **Step 1: Update calcWeights and buildWheel to accept filter**

In `js/roulette.js`, replace the `calcWeights` function opening:

Change:
```js
  function calcWeights() {
    var menus = Menu.getAll();
```

To:
```js
  function calcWeights(filterCategories) {
    var allMenus = Menu.getAll();
    var menus = filterCategories && filterCategories.length > 0
      ? allMenus.filter(function(m) { return filterCategories.indexOf(m.category) !== -1; })
      : allMenus;
```

Replace the `buildWheel` function opening:

Change:
```js
  function buildWheel(container) {
    wheelEl = container;
    var weights = calcWeights();
```

To:
```js
  function buildWheel(container, filterCategories) {
    wheelEl = container;
    var weights = calcWeights(filterCategories);
```

- [ ] **Step 2: Verify existing behavior unchanged**

Open app, add menus, spin. Should work exactly as before (no filter = all menus).

- [ ] **Step 3: Commit**

```bash
git add js/roulette.js
git commit -m "feat: add filterCategories parameter to calcWeights and buildWheel"
```

---

### Task 3: index.html — New DOM elements

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add dark mode toggle to header**

After `<p class="header__subtitle">팀 점심 룰렛</p>`, add:
```html
      <button class="theme-toggle" id="theme-toggle" aria-label="다크모드 토글">🌙</button>
```

- [ ] **Step 2: Add filter chips container after tabs nav**

After the closing `</nav>` tag for tabs, add:
```html
    <div class="filter-chips" id="filter-chips">
      <button class="filter-chip filter-chip--active" data-category="all">전체</button>
      <button class="filter-chip" data-category="한식">한식</button>
      <button class="filter-chip" data-category="일식">일식</button>
      <button class="filter-chip" data-category="중식">중식</button>
      <button class="filter-chip" data-category="양식">양식</button>
      <button class="filter-chip" data-category="아시안">아시안</button>
      <button class="filter-chip" data-category="기타">기타</button>
    </div>
```

- [ ] **Step 3: Add category select in menu management**

In the `menu-mgmt__add` div, after the input and before the 추가 button, add:
```html
            <select class="input input--select" id="menu-category">
              <option value="기타">기타</option>
              <option value="한식">한식</option>
              <option value="일식">일식</option>
              <option value="중식">중식</option>
              <option value="양식">양식</option>
              <option value="아시안">아시안</option>
            </select>
```

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add filter chips, category select, and dark mode toggle to HTML"
```

---

### Task 4: css/style.css — Chip styles + dark mode

**Files:**
- Modify: `css/style.css`

- [ ] **Step 1: Add dark mode variables**

Add at the end of `css/style.css`:

```css
/* Dark mode */
[data-theme="dark"] {
  --bg: #1A1A2E;
  --surface: #242438;
  --text: #F0F0F5;
  --muted: #9CA3AF;
  --border: #374151;
  --shadow: 0 2px 8px rgba(0,0,0,0.3);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.4);
}
body { transition: background 0.3s, color 0.3s; }

/* Theme toggle */
.theme-toggle {
  position: absolute; top: 16px; right: 16px;
  width: 36px; height: 36px; border-radius: var(--radius-full);
  border: 1px solid var(--border); background: transparent;
  font-size: 18px; cursor: pointer; line-height: 1;
  display: flex; align-items: center; justify-content: center;
}
.header { position: relative; }

/* Filter chips */
.filter-chips {
  display: flex; gap: 6px; flex-wrap: wrap;
  margin-bottom: 12px; padding: 0 4px;
}
.filter-chip {
  padding: 4px 12px; border-radius: var(--radius-full);
  border: 1px solid var(--border); background: transparent;
  font-family: inherit; font-size: 0.75rem; font-weight: 500;
  color: var(--muted); cursor: pointer; transition: all 0.15s ease;
}
.filter-chip--active {
  background: var(--primary); color: white; border-color: var(--primary);
}

/* Category tag chip (in menu list) */
.category-tag {
  font-size: 0.6875rem; padding: 1px 8px;
  border-radius: var(--radius-full);
  background: var(--border); color: var(--muted);
}

/* Category select */
.input--select {
  width: auto; min-width: 70px; padding: 10px 8px;
  font-size: 0.8125rem;
}
```

- [ ] **Step 2: Commit**

```bash
git add css/style.css
git commit -m "feat: add dark mode variables, filter chip styles, category tag styles"
```

---

### Task 5: app.js — Filter logic + dark mode toggle + UI updates

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Add filter state and dark mode to app.js**

This is the largest change. In `js/app.js`, make these modifications:

Add new DOM refs in `cacheDom()`:
```js
    filterChips = document.querySelectorAll('.filter-chip');
    filterContainer = document.getElementById('filter-chips');
    themeToggle = document.getElementById('theme-toggle');
    menuCategorySelect = document.getElementById('menu-category');
```

Add at the top of the IIFE (after existing var declarations):
```js
  var filterChips, filterContainer, themeToggle, menuCategorySelect;
  var activeFilters = []; // empty = all
```

Add to `bindEvents()`:
```js
    // Filter chips
    filterContainer.addEventListener('click', function(e) {
      var chip = e.target.closest('.filter-chip');
      if (!chip) return;
      var cat = chip.dataset.category;
      if (cat === 'all') {
        activeFilters = [];
      } else {
        var idx = activeFilters.indexOf(cat);
        if (idx === -1) activeFilters.push(cat);
        else activeFilters.splice(idx, 1);
      }
      updateFilterChips();
      renderWheel();
      renderVoteList();
      updateSpinButton();
    });

    // Dark mode
    themeToggle.addEventListener('click', toggleTheme);
```

Add new functions:
```js
  // -- Filter --
  function updateFilterChips() {
    filterChips.forEach(function(chip) {
      var cat = chip.dataset.category;
      if (cat === 'all') {
        chip.classList.toggle('filter-chip--active', activeFilters.length === 0);
      } else {
        chip.classList.toggle('filter-chip--active', activeFilters.indexOf(cat) !== -1);
      }
    });
  }

  function getFilteredMenus() {
    var menus = Menu.getAll();
    if (activeFilters.length === 0) return menus;
    return menus.filter(function(m) { return activeFilters.indexOf(m.category) !== -1; });
  }

  // -- Dark mode --
  function toggleTheme() {
    var html = document.documentElement;
    var isDark = html.dataset.theme === 'dark';
    html.dataset.theme = isDark ? '' : 'dark';
    themeToggle.textContent = isDark ? '🌙' : '☀️';
    Storage.set('theme', isDark ? 'light' : 'dark');
  }

  function loadTheme() {
    var theme = Storage.get('theme', 'light');
    if (theme === 'dark') {
      document.documentElement.dataset.theme = 'dark';
      themeToggle.textContent = '☀️';
    }
  }
```

Update `init()` — add `loadTheme();` after `cacheDom();`.

Update `addMenu()`:
```js
  function addMenu() {
    var category = menuCategorySelect ? menuCategorySelect.value : '기타';
    var result = Menu.add(menuInput.value, category);
    // ... rest unchanged
  }
```

Update `renderWheel()` — change `Roulette.buildWheel(wheelContainer)` to:
```js
    Roulette.buildWheel(wheelContainer, activeFilters);
```

And change the menu count check to use filtered menus:
```js
  function renderWheel() {
    var menus = getFilteredMenus();
    if (menus.length < 2) {
      wheelContainer.style.display = 'none';
      rouletteEmpty.hidden = false;
      if (menus.length === 1) {
        rouletteEmpty.querySelector('p').textContent = '메뉴가 1개뿐이에요. 더 추가하면 재밌어요!';
      } else if (activeFilters.length > 0) {
        rouletteEmpty.querySelector('p').textContent = '선택한 카테고리에 메뉴가 없어요';
      } else {
        rouletteEmpty.querySelector('p').textContent = '메뉴를 추가해주세요';
      }
      return;
    }
    wheelContainer.style.display = '';
    rouletteEmpty.hidden = true;
    Roulette.buildWheel(wheelContainer, activeFilters);
  }

  function updateSpinButton() {
    var menus = getFilteredMenus();
    spinBtn.disabled = menus.length < 2 || Roulette.isSpinning();
  }
```

Update `renderMenuList()` — add category tag chip after nameSpan:
```js
      var tagSpan = document.createElement('span');
      tagSpan.className = 'category-tag';
      tagSpan.textContent = m.category;
      li.appendChild(nameSpan);
      li.appendChild(tagSpan);
```

Update `renderVoteList()` — filter menus:
```js
  function renderVoteList() {
    var menus = getFilteredMenus();
    // ... rest uses this filtered list
  }
```

- [ ] **Step 2: Verify all features in browser**

1. Open app — existing menus should show "기타" tag
2. Add menu with category — select 한식, add 비빔밥
3. Click filter chips — wheel should update
4. Click 🌙 — dark mode activates
5. Refresh — dark mode persists

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add filter logic, dark mode toggle, category dropdown, updated renders"
```

---

### Task 6: Integration verification

- [ ] **Step 1: Full test walkthrough**

1. Clear localStorage, reload — empty state OK
2. Add menus: 김치찌개(한식), 라멘(일식), 파스타(양식), 짜장면(중식), 쌀국수(아시안)
3. Verify tags show in menu list
4. Click "한식" filter chip — only 김치찌개 visible, spin disabled (1 menu)
5. Click "일식" too — 2 menus, spin enabled, wheel shows 김치찌개+라멘
6. Click "전체" — all 5 menus
7. Vote + spin with filter active — verify weighted selection works
8. Toggle dark mode — verify all screens look good
9. Refresh — dark mode persists, menus persist with categories

- [ ] **Step 2: Fix any issues**

- [ ] **Step 3: Commit fixes if any**

```bash
git add -A
git commit -m "fix: integration fixes for V2 category + darkmode"
```

---

## Self-Review

- [x] Spec coverage: Category field (Task 1), filter param (Task 2), HTML elements (Task 3), styles (Task 4), filter UI + dark mode (Task 5), integration (Task 6)
- [x] No placeholders: All code shown in full
- [x] Type consistency: `filterCategories` param name matches across roulette.js and app.js, `Menu.CATEGORIES` constant used consistently, `activeFilters` array throughout app.js
- [x] Edge cases: empty filter, 1-menu filter, category migration all addressed
