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
