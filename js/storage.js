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
