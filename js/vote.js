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
