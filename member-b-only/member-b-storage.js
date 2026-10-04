(function () {
  "use strict";

  var ITEMS_KEY = "campus-lost-found-member-b-items-v1";

  function readItems() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(ITEMS_KEY) || "null");
      return Array.isArray(saved) ? saved : window.MemberBData.seedItems.slice();
    } catch (error) {
      return window.MemberBData.seedItems.slice();
    }
  }

  function saveItems(items) {
    window.localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  }

  function addItem(item) {
    var items = readItems();
    items.unshift(item);
    saveItems(items);
    return item;
  }

  function updateStatus(id, status) {
    if (["found", "returned"].indexOf(status) < 0) return null;
    var items = readItems();
    var item = items.find(function (entry) { return entry.id === id && entry.owner; });
    if (!item) return null;
    item.status = status;
    saveItems(items);
    return item;
  }

  function getMyItems() {
    return readItems().filter(function (item) { return item.owner; });
  }

  window.MemberBStorage = {
    key: ITEMS_KEY,
    readItems: readItems,
    saveItems: saveItems,
    addItem: addItem,
    updateStatus: updateStatus,
    getMyItems: getMyItems
  };
})();
