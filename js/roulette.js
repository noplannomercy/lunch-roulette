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
        currentRotation = (currentRotation + finalAngle) % 360;
        wheelEl.style.transition = 'none';
        wheelEl.style.transform = 'rotate(' + currentRotation + 'deg)';
        spinning = false;
        resolve({ menu: target.menu, degrees: finalAngle });
      }

      wheelEl.addEventListener('transitionend', onComplete);
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
