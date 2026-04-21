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
