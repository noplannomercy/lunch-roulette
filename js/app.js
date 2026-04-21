window.App = (function() {
  'use strict';

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
