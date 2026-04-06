# 오늘 뭐 먹지? Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a team lunch roulette web app with animated wheel, team voting, weighted selection, and history tracking.

**Architecture:** Vanilla JS with IIFE pattern, 6 modules loaded via `<script>` tags in dependency order. localStorage for persistence. No backend, no framework, works on `file://`.

**Tech Stack:** HTML5, CSS3 (conic-gradient, CSS transitions), Vanilla JS, localStorage

---

## File Structure

```
index.html              — Main HTML, loads all scripts and CSS
css/
  style.css             — All styles (DESIGN.md based, responsive, animations)
js/
  storage.js            — localStorage wrapper with error handling
  menu.js               — Menu CRUD with duplicate/validation checks
  history.js            — History records with weight calculation (exports as LunchHistory)
  vote.js               — Vote counting with reset
  roulette.js           — Wheel rendering, weight calc, spin animation
  app.js                — Tab nav, event binding, overlay, confetti
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/storage.js`, `js/menu.js`, `js/history.js`, `js/vote.js`, `js/roulette.js`, `js/app.js`

- [ ] **Step 1: Initialize git repo**

```bash
git init
```

- [ ] **Step 2: Create index.html with full HTML structure**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>오늘 뭐 먹지?</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="app">
    <header class="header">
      <h1 class="header__title">오늘 뭐 먹지?</h1>
      <p class="header__subtitle">팀 점심 룰렛</p>
    </header>

    <nav class="tabs">
      <button class="tabs__btn tabs__btn--active" data-tab="roulette">룰렛</button>
      <button class="tabs__btn" data-tab="vote">투표</button>
      <button class="tabs__btn" data-tab="history">히스토리</button>
    </nav>

    <!-- Roulette Tab -->
    <section class="tab-content" id="tab-roulette">
      <div class="roulette">
        <div class="roulette__pointer">▼</div>
        <div class="roulette__wheel" id="wheel"></div>
      </div>
      <button class="btn btn--primary btn--spin" id="spin-btn" disabled>돌리기!</button>
      <div class="roulette__empty" id="roulette-empty">
        <p>메뉴를 추가해주세요</p>
      </div>

      <!-- Menu Management (accordion) -->
      <details class="menu-mgmt">
        <summary class="menu-mgmt__toggle">메뉴 관리</summary>
        <div class="menu-mgmt__body">
          <div class="menu-mgmt__add">
            <input type="text" class="input" id="menu-input" placeholder="새 메뉴 입력..." maxlength="30">
            <button class="btn btn--ghost" id="menu-add-btn">추가</button>
          </div>
          <div class="menu-mgmt__error" id="menu-error"></div>
          <ul class="menu-mgmt__list" id="menu-list"></ul>
        </div>
      </details>
    </section>

    <!-- Vote Tab -->
    <section class="tab-content" id="tab-vote" hidden>
      <h2 class="section-title">오늘의 투표</h2>
      <p class="section-subtitle" id="vote-count">0명 참여 중</p>
      <div id="vote-list"></div>
      <button class="btn btn--secondary btn--spin" id="vote-spin-btn">투표 결과로 룰렛 돌리기</button>
    </section>

    <!-- History Tab -->
    <section class="tab-content" id="tab-history" hidden>
      <h2 class="section-title">먹은 기록</h2>
      <div id="history-list"></div>
      <div class="history__empty" id="history-empty" hidden>
        <p>아직 기록이 없어요</p>
      </div>
    </section>

    <!-- Result Overlay -->
    <div class="overlay" id="result-overlay" hidden>
      <div class="overlay__content">
        <div class="overlay__confetti" id="confetti-container"></div>
        <p class="overlay__result" id="result-text"></p>
        <button class="btn btn--primary" id="result-confirm-btn">확인</button>
      </div>
    </div>
  </div>

  <script src="js/storage.js"></script>
  <script src="js/menu.js"></script>
  <script src="js/history.js"></script>
  <script src="js/vote.js"></script>
  <script src="js/roulette.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create empty JS files and minimal CSS**

Create `css/style.css` with just the CSS variable definitions from DESIGN.md:

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
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --shadow: 0 2px 8px rgba(26,26,46,0.08);
  --shadow-lg: 0 8px 24px rgba(26,26,46,0.12);
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'DM Sans', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}
.app {
  max-width: 420px;
  margin: 0 auto;
  padding: 16px;
  min-height: 100vh;
}
```

Create each JS file with an empty IIFE shell:

`js/storage.js`:
```js
window.Storage = (function() {
  'use strict';
  // TODO: implement in Task 2
  return { get: function(){}, set: function(){}, remove: function(){} };
})();
```

Same pattern for `menu.js`, `history.js`, `vote.js`, `roulette.js`, `app.js`.

- [ ] **Step 4: Verify file:// works**

Open `index.html` in a browser. Should show "오늘 뭐 먹지?" title with warm cream background. No console errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: project scaffolding with HTML structure, CSS variables, empty JS modules"
```

---

### Task 2: storage.js — localStorage Wrapper

**Files:**
- Modify: `js/storage.js`

- [ ] **Step 1: Implement Storage module**

```js
window.Storage = (function() {
  'use strict';

  var PREFIX = 'lunch-roulette-';

  function get(key, defaultValue) {
    try {
      var raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Storage.get failed for key:', key, e);
      localStorage.removeItem(PREFIX + key);
      return defaultValue;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage.set failed (quota?):', key, e);
    }
  }

  function remove(key) {
    localStorage.removeItem(PREFIX + key);
  }

  return { get: get, set: set, remove: remove };
})();
```

- [ ] **Step 2: Verify in browser console**

Open `index.html`, open DevTools console:
```js
Storage.set('test', {a: 1});
console.log(Storage.get('test')); // {a: 1}
console.log(Storage.get('missing', [])); // []
Storage.remove('test');
console.log(Storage.get('test', null)); // null
```

- [ ] **Step 3: Commit**

```bash
git add js/storage.js
git commit -m "feat: implement Storage module with localStorage wrapper and error handling"
```

---

### Task 3: menu.js — Menu CRUD

**Files:**
- Modify: `js/menu.js`

- [ ] **Step 1: Implement Menu module**

```js
window.Menu = (function() {
  'use strict';

  var STORAGE_KEY = 'menus';
  var menus = Storage.get(STORAGE_KEY, []);

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

  function add(name) {
    var trimmed = (name || '').trim();
    if (!trimmed) {
      return { error: '메뉴명을 입력하세요' };
    }
    if (exists(trimmed)) {
      return { error: '이미 있는 메뉴입니다' };
    }
    var menu = {
      id: generateId(),
      name: trimmed,
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

  return { getAll: getAll, add: add, remove: remove, exists: exists };
})();
```

- [ ] **Step 2: Verify in browser console**

```js
Menu.add('김치찌개');        // {menu: {id: ..., name: '김치찌개', ...}}
Menu.add('김치찌개');        // {error: '이미 있는 메뉴입니다'}
Menu.add('');               // {error: '메뉴명을 입력하세요'}
Menu.add('  ');             // {error: '메뉴명을 입력하세요'}
Menu.add('라멘');           // {menu: ...}
console.log(Menu.getAll()); // [{...김치찌개}, {...라멘}]
```

- [ ] **Step 3: Commit**

```bash
git add js/menu.js
git commit -m "feat: implement Menu module with CRUD, duplicate check, validation"
```

---

### Task 4: history.js — History & Weight Calculation

**Files:**
- Modify: `js/history.js`

- [ ] **Step 1: Implement History module**

```js
window.LunchHistory = (function() {
  'use strict';

  var STORAGE_KEY = 'history';
  var MAX_DAYS = 30;
  var records = Storage.get(STORAGE_KEY, []);

  function save() {
    Storage.set(STORAGE_KEY, records);
  }

  function cleanup() {
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - MAX_DAYS);
    var cutoffStr = cutoff.toISOString().slice(0, 10);
    records = records.filter(function(r) { return r.date >= cutoffStr; });
    save();
  }

  function getAll() {
    return records.slice();
  }

  function add(menuName) {
    var now = new Date();
    records.unshift({
      menuName: menuName,
      date: now.toISOString().slice(0, 10),
      timestamp: now.toISOString()
    });
    cleanup();
  }

  function getWeight(menuName) {
    var today = new Date();
    for (var i = 0; i < records.length; i++) {
      if (records[i].menuName === menuName) {
        var recordDate = new Date(records[i].date);
        var diffDays = Math.floor((today - recordDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) return 0.5;
        if (diffDays <= 7) return 0.75;
        return 1.0;
      }
    }
    return 1.0;
  }

  return { getAll: getAll, add: add, getWeight: getWeight, cleanup: cleanup };
})();
```

- [ ] **Step 2: Verify in browser console**

```js
LunchHistory.add('김치찌개');
console.log(LunchHistory.getAll());          // [{menuName: '김치찌개', date: '2026-04-06', ...}]
console.log(LunchHistory.getWeight('김치찌개')); // 0.5 (just added today)
console.log(LunchHistory.getWeight('라멘'));     // 1.0 (no record)
```

- [ ] **Step 3: Commit**

```bash
git add js/history.js
git commit -m "feat: implement History module with weight calculation and 30-day cleanup"
```

---

### Task 5: vote.js — Team Voting

**Files:**
- Modify: `js/vote.js`

- [ ] **Step 1: Implement Vote module**

```js
window.Vote = (function() {
  'use strict';

  var STORAGE_KEY = 'votes';
  var votes = Storage.get(STORAGE_KEY, {});

  function save() {
    Storage.set(STORAGE_KEY, votes);
  }

  function getAll() {
    var copy = {};
    for (var key in votes) {
      if (votes.hasOwnProperty(key)) {
        copy[key] = votes[key];
      }
    }
    return copy;
  }

  function increment(menuId) {
    votes[menuId] = (votes[menuId] || 0) + 1;
    save();
    return votes[menuId];
  }

  function getCount(menuId) {
    return votes[menuId] || 0;
  }

  function reset() {
    votes = {};
    save();
  }

  return { getAll: getAll, increment: increment, getCount: getCount, reset: reset };
})();
```

- [ ] **Step 2: Verify in browser console**

```js
Vote.increment('uuid-1'); // 1
Vote.increment('uuid-1'); // 2
Vote.increment('uuid-2'); // 1
console.log(Vote.getAll()); // {'uuid-1': 2, 'uuid-2': 1}
Vote.reset();
console.log(Vote.getAll()); // {}
```

- [ ] **Step 3: Commit**

```bash
git add js/vote.js
git commit -m "feat: implement Vote module with increment, count, and reset"
```

---

### Task 6: roulette.js — Wheel Rendering & Spin Logic

**Files:**
- Modify: `js/roulette.js`

- [ ] **Step 1: Implement Roulette module**

```js
window.Roulette = (function() {
  'use strict';

  var COLORS = ['#FF6B35', '#004E89', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];
  var SPIN_DURATION = 3000;
  var BASE_ROTATIONS = 5;
  var spinning = false;
  var currentRotation = 0;
  var sectors = [];
  var wheelEl = null;

  function calcWeights() {
    var menus = Menu.getAll();
    var allVotes = Vote.getAll();
    var totalVotes = 0;
    var hasAnyVotes = false;

    menus.forEach(function(m) {
      var v = allVotes[m.id] || 0;
      totalVotes += v;
      if (v > 0) hasAnyVotes = true;
    });

    var n = menus.length;
    var results = [];
    var totalWeight = 0;

    menus.forEach(function(m) {
      var voteWeight;
      if (!hasAnyVotes) {
        voteWeight = 1 / n;
      } else if ((allVotes[m.id] || 0) === 0) {
        voteWeight = 0.5 / n;
      } else {
        voteWeight = allVotes[m.id] / totalVotes;
      }
      var historyWeight = LunchHistory.getWeight(m.name);
      var weight = voteWeight * historyWeight;
      totalWeight += weight;
      results.push({ menu: m, weight: weight, degrees: 0 });
    });

    if (totalWeight === 0) totalWeight = 1;
    var degOffset = 0;
    results.forEach(function(r) {
      r.degrees = (r.weight / totalWeight) * 360;
      r.startDeg = degOffset;
      r.endDeg = degOffset + r.degrees;
      degOffset += r.degrees;
    });

    sectors = results;
    return results;
  }

  function buildWheel(container) {
    wheelEl = container;
    var weights = calcWeights();
    if (weights.length === 0) {
      container.style.background = 'var(--border)';
      container.innerHTML = '';
      return;
    }

    // Build conic-gradient
    var gradientParts = [];
    weights.forEach(function(w, i) {
      var color = COLORS[i % COLORS.length];
      gradientParts.push(color + ' ' + w.startDeg + 'deg ' + w.endDeg + 'deg');
    });
    container.style.background = 'conic-gradient(' + gradientParts.join(', ') + ')';

    // Build labels
    container.innerHTML = '';
    var radius = container.offsetWidth / 2;
    weights.forEach(function(w, i) {
      var midDeg = w.startDeg + w.degrees / 2;
      var label = document.createElement('div');
      label.className = 'roulette__label';
      label.textContent = w.menu.name;
      label.style.transform = 'rotate(' + midDeg + 'deg) translateY(-' + (radius * 0.6) + 'px)';
      container.appendChild(label);
    });
  }

  function pickWeightedRandom() {
    var total = 0;
    sectors.forEach(function(s) { total += s.weight; });
    var rand = Math.random() * total;
    var acc = 0;
    for (var i = 0; i < sectors.length; i++) {
      acc += sectors[i].weight;
      if (rand <= acc) return i;
    }
    return sectors.length - 1;
  }

  function spin() {
    if (spinning || sectors.length < 2) return Promise.resolve(null);
    spinning = true;

    var targetIndex = pickWeightedRandom();
    var target = sectors[targetIndex];
    var targetMidDeg = target.startDeg + target.degrees / 2;

    // Spin to: 5 full rotations + land on target sector
    // The pointer is at the top (0deg), wheel rotates clockwise
    // To land pointer on targetMidDeg: rotate (360 - targetMidDeg) + random offset within sector
    var sectorOffset = (Math.random() - 0.5) * target.degrees * 0.6;
    var finalAngle = (BASE_ROTATIONS * 360) + (360 - targetMidDeg) + sectorOffset;

    wheelEl.style.transition = 'transform ' + SPIN_DURATION + 'ms cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    wheelEl.style.transform = 'rotate(' + (currentRotation + finalAngle) + 'deg)';

    return new Promise(function(resolve) {
      var resolved = false;

      function onComplete() {
        if (resolved) return;
        resolved = true;
        wheelEl.removeEventListener('transitionend', onComplete);
        // Reset rotation to avoid accumulation
        currentRotation = (currentRotation + finalAngle) % 360;
        wheelEl.style.transition = 'none';
        wheelEl.style.transform = 'rotate(' + currentRotation + 'deg)';
        spinning = false;
        resolve({ menu: target.menu, degrees: finalAngle });
      }

      wheelEl.addEventListener('transitionend', onComplete);
      // Safety fallback: 4s timeout in case transitionend never fires
      setTimeout(onComplete, SPIN_DURATION + 1000);
    });
  }

  function isSpinning() {
    return spinning;
  }

  return {
    buildWheel: buildWheel,
    calcWeights: calcWeights,
    spin: spin,
    isSpinning: isSpinning
  };
})();
```

- [ ] **Step 2: Verify in browser console**

```js
// After adding menus in previous tasks
console.log(Roulette.calcWeights());
// Should show array with menu, weight, degrees, startDeg, endDeg
```

- [ ] **Step 3: Commit**

```bash
git add js/roulette.js
git commit -m "feat: implement Roulette module with weighted wheel, conic-gradient, spin animation"
```

---

### Task 7: app.js — App Orchestration, Tabs, UI

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Implement App module**

```js
window.App = (function() {
  'use strict';

  // DOM refs
  var tabBtns, tabContents;
  var wheelContainer, spinBtn, rouletteEmpty;
  var menuInput, menuAddBtn, menuError, menuList;
  var voteList, voteCount, voteSpinBtn;
  var historyList, historyEmpty;
  var overlay, resultText, confirmBtn, confettiContainer;

  function init() {
    cacheDom();
    bindEvents();
    switchTab(location.hash.slice(1) || 'roulette');
    renderMenuList();
    renderVoteList();
    renderHistoryList();
    updateSpinButton();
    renderWheel();
  }

  function cacheDom() {
    tabBtns = document.querySelectorAll('.tabs__btn');
    tabContents = document.querySelectorAll('.tab-content');
    wheelContainer = document.getElementById('wheel');
    spinBtn = document.getElementById('spin-btn');
    rouletteEmpty = document.getElementById('roulette-empty');
    menuInput = document.getElementById('menu-input');
    menuAddBtn = document.getElementById('menu-add-btn');
    menuError = document.getElementById('menu-error');
    menuList = document.getElementById('menu-list');
    voteList = document.getElementById('vote-list');
    voteCount = document.getElementById('vote-count');
    voteSpinBtn = document.getElementById('vote-spin-btn');
    historyList = document.getElementById('history-list');
    historyEmpty = document.getElementById('history-empty');
    overlay = document.getElementById('result-overlay');
    resultText = document.getElementById('result-text');
    confirmBtn = document.getElementById('result-confirm-btn');
    confettiContainer = document.getElementById('confetti-container');
  }

  function bindEvents() {
    // Tabs
    tabBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchTab(btn.dataset.tab);
      });
    });
    window.addEventListener('hashchange', function() {
      switchTab(location.hash.slice(1) || 'roulette');
    });

    // Menu management
    menuAddBtn.addEventListener('click', addMenu);
    menuInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') addMenu();
    });

    // Spin
    spinBtn.addEventListener('click', handleSpin);
    voteSpinBtn.addEventListener('click', function() {
      switchTab('roulette');
      setTimeout(handleSpin, 300);
    });

    // Result confirm
    confirmBtn.addEventListener('click', handleConfirm);
  }

  function switchTab(tabName) {
    if (!tabName || !document.getElementById('tab-' + tabName)) {
      tabName = 'roulette';
    }
    location.hash = tabName;
    tabBtns.forEach(function(btn) {
      btn.classList.toggle('tabs__btn--active', btn.dataset.tab === tabName);
    });
    tabContents.forEach(function(content) {
      content.hidden = content.id !== 'tab-' + tabName;
    });
  }

  // -- Menu Management --
  function addMenu() {
    var result = Menu.add(menuInput.value);
    if (result.error) {
      menuError.textContent = result.error;
      menuError.hidden = false;
      return;
    }
    menuError.hidden = true;
    menuInput.value = '';
    renderMenuList();
    renderVoteList();
    renderWheel();
    updateSpinButton();
  }

  function removeMenu(id) {
    Menu.remove(id);
    renderMenuList();
    renderVoteList();
    renderWheel();
    updateSpinButton();
  }

  function renderMenuList() {
    var menus = Menu.getAll();
    menuList.innerHTML = '';
    menus.forEach(function(m) {
      var li = document.createElement('li');
      li.className = 'menu-mgmt__item';
      var nameSpan = document.createElement('span');
      nameSpan.textContent = m.name;
      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn--ghost btn--sm';
      deleteBtn.textContent = '삭제';
      deleteBtn.addEventListener('click', function() { removeMenu(m.id); });
      li.appendChild(nameSpan);
      li.appendChild(deleteBtn);
      menuList.appendChild(li);
    });
  }

  // -- Wheel --
  function renderWheel() {
    var menus = Menu.getAll();
    if (menus.length < 2) {
      wheelContainer.style.display = 'none';
      rouletteEmpty.hidden = false;
      if (menus.length === 1) {
        rouletteEmpty.querySelector('p').textContent = '메뉴가 1개뿐이에요. 더 추가하면 재밌어요!';
      } else {
        rouletteEmpty.querySelector('p').textContent = '메뉴를 추가해주세요';
      }
      return;
    }
    wheelContainer.style.display = '';
    rouletteEmpty.hidden = true;
    Roulette.buildWheel(wheelContainer);
  }

  function updateSpinButton() {
    var menus = Menu.getAll();
    spinBtn.disabled = menus.length < 2 || Roulette.isSpinning();
  }

  // -- Spin --
  var lastResult = null;

  function handleSpin() {
    if (Roulette.isSpinning()) return;
    spinBtn.disabled = true;
    Roulette.spin().then(function(result) {
      if (!result) return;
      lastResult = result;
      setTimeout(function() {
        showResult(result.menu.name);
      }, 300);
    });
  }

  function showResult(menuName) {
    resultText.textContent = menuName;
    overlay.hidden = false;
    spawnConfetti();
  }

  function handleConfirm() {
    if (lastResult) {
      LunchHistory.add(lastResult.menu.name);
    }
    Vote.reset();
    overlay.hidden = true;
    confettiContainer.innerHTML = '';
    lastResult = null;
    updateSpinButton();
    renderVoteList();
    renderHistoryList();
    renderWheel();
  }

  // -- Confetti --
  function spawnConfetti() {
    confettiContainer.innerHTML = '';
    var colors = ['#FF6B35', '#004E89', '#10B981', '#F59E0B', '#EF4444'];
    for (var i = 0; i < 20; i++) {
      var particle = document.createElement('div');
      particle.className = 'confetti';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.backgroundColor = colors[i % colors.length];
      particle.style.animationDelay = (Math.random() * 0.5) + 's';
      particle.style.animationDuration = (1 + Math.random() * 0.5) + 's';
      confettiContainer.appendChild(particle);
    }
    setTimeout(function() {
      confettiContainer.innerHTML = '';
    }, 1500);
  }

  // -- Vote UI --
  function renderVoteList() {
    var menus = Menu.getAll();
    var allVotes = Vote.getAll();
    var totalVotes = 0;
    menus.forEach(function(m) { totalVotes += (allVotes[m.id] || 0); });
    voteCount.textContent = totalVotes + '표 참여 중';

    voteList.innerHTML = '';
    menus.forEach(function(m) {
      var count = allVotes[m.id] || 0;
      var pct = totalVotes > 0 ? (count / totalVotes * 100) : 0;

      var item = document.createElement('div');
      item.className = 'vote-item';

      var label = document.createElement('span');
      label.className = 'vote-item__label';
      label.textContent = m.name;

      var bar = document.createElement('div');
      bar.className = 'vote-item__bar';
      var fill = document.createElement('div');
      fill.className = 'vote-item__fill';
      fill.style.width = pct + '%';
      bar.appendChild(fill);

      var countEl = document.createElement('span');
      countEl.className = 'vote-item__count';
      countEl.textContent = count;

      var btn = document.createElement('button');
      btn.className = 'btn btn--vote';
      btn.textContent = '+1';
      btn.addEventListener('click', function() {
        Vote.increment(m.id);
        renderVoteList();
        renderWheel();
      });

      item.appendChild(label);
      item.appendChild(bar);
      item.appendChild(countEl);
      item.appendChild(btn);
      voteList.appendChild(item);
    });
  }

  // -- History UI --
  function renderHistoryList() {
    var records = LunchHistory.getAll();
    historyList.innerHTML = '';
    historyEmpty.hidden = records.length > 0;

    records.forEach(function(r) {
      var item = document.createElement('div');
      item.className = 'history-item';
      var name = document.createElement('span');
      name.textContent = r.menuName;
      var date = document.createElement('span');
      date.className = 'history-item__date';
      date.textContent = r.date;
      item.appendChild(name);
      item.appendChild(date);
      historyList.appendChild(item);
    });
  }

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', App.init);
```

- [ ] **Step 2: Verify basic tab navigation**

Open `index.html`. Click each tab. URL hash should change. Content sections should toggle.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: implement App module with tabs, menu UI, vote UI, history, spin, overlay, confetti"
```

---

### Task 8: style.css — Full Styling (DESIGN.md)

**Files:**
- Modify: `css/style.css`

- [ ] **Step 1: Add complete styling**

Add all styles after the existing CSS variables. Key sections:
- Header (hero title #FF6B35, subtitle muted)
- Tabs (active = primary bg white text, inactive = ghost)
- Roulette wheel (circular, labels positioned, pointer)
- Spin button (primary full width, hover transform)
- Menu management (accordion, list items, delete buttons)
- Vote items (label + bar + count + +1 button)
- History items (name + date)
- Result overlay (fixed full screen, semi-transparent bg, centered result)
- Confetti (@keyframes fall + sway)
- Buttons (.btn variants: primary, secondary, ghost, vote, sm)
- Input styling
- Responsive (min 280px wheel)
- Empty states
- Utility classes

This is a large CSS file (~300 lines). Key patterns:

```css
/* Header */
.header { text-align: center; padding: 24px 0 8px; }
.header__title { font-size: 2.25rem; font-weight: 700; color: var(--primary); }
.header__subtitle { font-size: 0.875rem; color: var(--muted); }

/* Tabs */
.tabs { display: flex; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; margin: 16px 0; }
.tabs__btn { flex: 1; padding: 10px; font-family: inherit; font-size: 0.8125rem; font-weight: 500; border: none; background: var(--surface); color: var(--muted); cursor: pointer; border-right: 1px solid var(--border); }
.tabs__btn:last-child { border-right: none; }
.tabs__btn--active { background: var(--primary); color: white; font-weight: 600; }

/* Roulette */
.roulette { position: relative; margin: 16px auto; width: min(280px, 80vw); height: min(280px, 80vw); }
.roulette__wheel { width: 100%; height: 100%; border-radius: 50%; position: relative; box-shadow: var(--shadow-lg), inset 0 0 0 4px rgba(255,255,255,0.3); }
.roulette__pointer { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); font-size: 24px; color: var(--primary); z-index: 3; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
.roulette__label { position: absolute; top: 50%; left: 50%; font-size: 0.6875rem; font-weight: 600; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.5); white-space: nowrap; transform-origin: 0 0; pointer-events: none; }
.roulette__empty { text-align: center; padding: 48px 0; color: var(--muted); }

/* Buttons */
.btn { display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; border-radius: var(--radius-md); font-family: inherit; font-size: 0.9375rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s ease; }
.btn--primary { background: var(--primary); color: white; }
.btn--primary:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-1px); }
.btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--secondary { background: var(--secondary); color: white; }
.btn--ghost { background: transparent; color: var(--text); border: 1px solid var(--border); }
.btn--spin { display: block; width: 100%; padding: 16px; font-size: 1.125rem; font-weight: 700; margin-top: 16px; box-shadow: 0 4px 12px rgba(255,107,53,0.3); }
.btn--vote { padding: 4px 12px; font-size: 0.75rem; border: 1px solid var(--secondary); color: var(--secondary); background: transparent; border-radius: var(--radius-sm); }
.btn--vote:hover { background: var(--secondary); color: white; }
.btn--sm { padding: 4px 10px; font-size: 0.75rem; }

/* Input */
.input { width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius-md); font-family: inherit; font-size: 0.9375rem; background: var(--surface); color: var(--text); }
.input:focus { outline: none; border-color: var(--primary); }

/* Menu Management */
.menu-mgmt { margin-top: 24px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); }
.menu-mgmt__toggle { padding: 12px 16px; font-family: inherit; font-size: 0.875rem; font-weight: 600; cursor: pointer; list-style: none; }
.menu-mgmt__toggle::-webkit-details-marker { display: none; }
.menu-mgmt__body { padding: 0 16px 16px; }
.menu-mgmt__add { display: flex; gap: 8px; margin-bottom: 8px; }
.menu-mgmt__add .input { flex: 1; }
.menu-mgmt__error { font-size: 0.75rem; color: var(--error); margin-bottom: 8px; }
.menu-mgmt__error[hidden] { display: none; }
.menu-mgmt__list { list-style: none; }
.menu-mgmt__item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 0.875rem; }
.menu-mgmt__item:last-child { border-bottom: none; }

/* Vote */
.section-title { font-size: 1.125rem; font-weight: 600; }
.section-subtitle { font-size: 0.8125rem; color: var(--muted); margin-bottom: 12px; }
.vote-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.vote-item__label { width: 80px; font-size: 0.875rem; font-weight: 500; }
.vote-item__bar { flex: 1; height: 28px; background: var(--border); border-radius: var(--radius-sm); overflow: hidden; }
.vote-item__fill { height: 100%; background: var(--primary); border-radius: var(--radius-sm); transition: width 0.3s ease; }
.vote-item__count { font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem; color: var(--muted); width: 28px; text-align: right; }

/* History */
.history-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 0.875rem; }
.history-item__date { font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem; color: var(--muted); }
.history__empty { text-align: center; padding: 48px 0; color: var(--muted); }

/* Overlay */
.overlay { position: fixed; inset: 0; background: rgba(26,26,46,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
.overlay[hidden] { display: none; }
.overlay__content { background: var(--surface); border-radius: var(--radius-lg); padding: 48px 32px; text-align: center; position: relative; overflow: hidden; box-shadow: var(--shadow-lg); max-width: 320px; width: 90%; }
.overlay__result { font-size: 2rem; font-weight: 700; color: var(--primary); margin-bottom: 24px; }
.overlay__confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }

/* Confetti */
.confetti { position: absolute; width: 8px; height: 8px; border-radius: 2px; top: -10px; animation: confettiFall 1.5s ease-out forwards; }
@keyframes confettiFall {
  0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; }
  100% { transform: translateY(400px) rotate(720deg) translateX(var(--sway, 20px)); opacity: 0; }
}
.confetti:nth-child(odd) { --sway: -30px; }
.confetti:nth-child(even) { --sway: 25px; }
.confetti:nth-child(3n) { --sway: -15px; width: 6px; height: 12px; }
```

- [ ] **Step 2: Verify complete app in browser**

Open `index.html`. All screens should render with correct styling. Add menus, vote, spin, verify overlay.

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: complete styling based on DESIGN.md - playful theme, responsive, animations"
```

---

### Task 9: Integration Testing & Polish

**Files:**
- Possibly minor fixes to any file

- [ ] **Step 1: Full manual test walkthrough**

1. Open index.html (file:// or local server)
2. Add 4-5 menus (김치찌개, 라멘, 파스타, 짜장면, 쌀국수)
3. Verify duplicate rejection
4. Switch to 투표 tab, vote for some menus
5. Click "투표 결과로 룰렛 돌리기"
6. Watch spin animation
7. Verify result overlay + confetti
8. Click 확인
9. Check 히스토리 tab shows record
10. Spin again, verify different results
11. Check mobile viewport (DevTools 375px)

- [ ] **Step 2: Fix any issues found**

Address bugs from the walkthrough.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "fix: integration fixes from manual testing"
```

---

## Self-Review Checklist

- [x] Spec coverage: All FR (01-07) and NFR (01-06) from SRS.md are covered
- [x] No placeholders: Every step has complete code
- [x] Type consistency: Storage/Menu/History/Vote/Roulette/App APIs match across tasks
- [x] DESIGN.md: Colors, fonts, spacing, motion all referenced
- [x] CEO Review decisions: duplicate rejection (Task 3), spin disabled during animation (Task 7), multiple records per day (Task 4)
- [x] Error handling: storage try/catch (Task 2), validation (Task 3), XSS prevention via textContent (Task 7)
