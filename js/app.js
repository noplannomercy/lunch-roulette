window.App = (function() {
  'use strict';

  var tabBtns, tabContents;
  var wheelContainer, spinBtn, rouletteEmpty;
  var menuInput, menuAddBtn, menuError, menuList, menuCategorySelect;
  var voteList, voteCount, voteSpinBtn;
  var historyList, historyEmpty;
  var overlay, resultText, confirmBtn, confettiContainer;
  var filterChips, filterContainer, themeToggle;
  var activeFilters = [];

  function init() {
    cacheDom();
    bindEvents();
    loadTheme();
    loadFilters();
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
    menuCategorySelect = document.getElementById('menu-category');
    voteList = document.getElementById('vote-list');
    voteCount = document.getElementById('vote-count');
    voteSpinBtn = document.getElementById('vote-spin-btn');
    historyList = document.getElementById('history-list');
    historyEmpty = document.getElementById('history-empty');
    overlay = document.getElementById('result-overlay');
    resultText = document.getElementById('result-text');
    confirmBtn = document.getElementById('result-confirm-btn');
    confettiContainer = document.getElementById('confetti-container');
    filterChips = document.querySelectorAll('.filter-chip');
    filterContainer = document.getElementById('filter-chips');
    themeToggle = document.getElementById('theme-toggle');
  }

  function bindEvents() {
    tabBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchTab(btn.dataset.tab);
      });
    });
    window.addEventListener('hashchange', function() {
      switchTab(location.hash.slice(1) || 'roulette');
    });
    menuAddBtn.addEventListener('click', addMenu);
    menuInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') addMenu();
    });
    spinBtn.addEventListener('click', handleSpin);
    voteSpinBtn.addEventListener('click', function() {
      switchTab('roulette');
      setTimeout(handleSpin, 300);
    });
    confirmBtn.addEventListener('click', handleConfirm);
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
      saveFilters();
      updateFilterChips();
      renderWheel();
      renderVoteList();
      updateSpinButton();
    });
    themeToggle.addEventListener('click', toggleTheme);
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

  // -- Filters --
  function loadFilters() {
    activeFilters = Storage.get('filters', []);
    updateFilterChips();
  }

  function saveFilters() {
    Storage.set('filters', activeFilters);
  }

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

  // -- Menu Management --
  function addMenu() {
    var category = menuCategorySelect ? menuCategorySelect.value : '기타';
    var result = Menu.add(menuInput.value, category);
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
      var tagSpan = document.createElement('span');
      tagSpan.className = 'category-tag';
      tagSpan.textContent = m.category;
      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn--ghost btn--sm';
      deleteBtn.textContent = '삭제';
      deleteBtn.addEventListener('click', function() { removeMenu(m.id); });
      li.appendChild(nameSpan);
      li.appendChild(tagSpan);
      li.appendChild(deleteBtn);
      menuList.appendChild(li);
    });
  }

  // -- Wheel --
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
    var menus = getFilteredMenus();
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
