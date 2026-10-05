(function () {
  "use strict";

  var viewedKey = "campus-lost-found-viewed-items";

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function readViewedIds() {
    try {
      var value = window.localStorage.getItem(viewedKey);
      var ids = value ? JSON.parse(value) : [];
      return Array.isArray(ids) ? ids.map(String).reverse() : [];
    } catch (error) {
      return [];
    }
  }

  function render() {
    var list = document.querySelector("[data-viewed-list]");
    var count = document.querySelector("[data-viewed-count]");
    if (!list || !window.CampusData) return;

    var items = readViewedIds().map(function (id) {
      return CampusData.getItemById(id);
    }).filter(Boolean);

    if (count) count.textContent = items.length + " 条";
    list.innerHTML = items.map(function (item) {
      return "<a class=\"history-item\" href=\"./detail.html?id=" + encodeURIComponent(item.id) + "\"><strong>" + escapeHtml(item.name) + "</strong><span>" + escapeHtml(CampusData.getTypeLabel(item.type)) + " · " + escapeHtml(item.location) + "</span><small>" + escapeHtml(CampusData.getStatusLabel(item)) + "</small></a>";
    }).join("") || "<p class=\"empty-state\">还没有浏览记录</p>";
  }

  render();
})();
