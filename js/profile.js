(function () {
  "use strict";

  var USER_ID = "current-user";

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function getItems() {
    if (!window.CampusData) return [];
    if (typeof CampusData.getMyItems === "function") return CampusData.getMyItems(USER_ID) || [];
    if (typeof CampusData.readItems !== "function") return [];
    return CampusData.readItems().filter(function (item) {
      return item && item.publisher === "校园用户";
    });
  }

  function resolveItems(values) {
    return (values || []).map(function (value) {
      return typeof value === "string" && typeof CampusData.getItemById === "function" ? CampusData.getItemById(value) : value;
    }).filter(Boolean);
  }

  function typeLabel(item) {
    return CampusData.getTypeLabel(item.type);
  }

  function statusLabel(item) {
    return CampusData.getStatusLabel(item);
  }

  function viewedCount() {
    try {
      var saved = window.localStorage.getItem("campus-lost-found-viewed-items");
      var ids = saved ? JSON.parse(saved) : [];
      return Array.isArray(ids) ? ids.length : 0;
    } catch (error) {
      return 0;
    }
  }

  function card(item, withAction) {
    var detailHref = "./detail.html?id=" + encodeURIComponent(item.id);
    var action = withAction ? "<a class=\"post-action\" href=\"./status.html?id=" + encodeURIComponent(item.id) + "\">修改状态</a>" : "";
    var statusClass = item.status === "completed" ? "completed" : "active";
    return "<article class=\"post-card\"><a class=\"post-detail-link\" href=\"" + detailHref + "\"><div class=\"post-icon " + escapeHtml(item.imageClass || "icon-blue") + "\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\"><path d=\"M5 4h14v16H5zM8 8h8M8 12h6M8 16h4\"/></svg></div><div class=\"post-copy\"><div class=\"post-meta\"><span>" + typeLabel(item) + "</span><strong class=\"" + statusClass + "\">" + statusLabel(item) + "</strong></div><h3>" + escapeHtml(item.name) + "</h3><p>" + escapeHtml(item.date) + " · " + escapeHtml(item.location) + "</p></div></a>" + action + "</article>";
  }

  function commentCard(comment, items) {
    var item = items.find(function (entry) { return entry.id === comment.itemId; });
    return "<article class=\"comment-card\"><strong>" + escapeHtml(item ? item.name : "失物信息") + "</strong><p>" + escapeHtml(comment.text) + "</p></article>";
  }

  function updateStats(items, favorites, comments) {
    var completed = items.filter(function (item) { return item.status === "completed"; }).length;
    var active = items.length - completed;
    var stats = { all: items.length, active: active, completed: completed };
    Object.keys(stats).forEach(function (key) { var element = document.querySelector('[data-stat="' + key + '"]'); if (element) element.textContent = stats[key]; });
    var counts = { posts: items.length, favorites: favorites.length, comments: comments.length, history: items.filter(function (item) { return item.status === "completed" && item.type === "found"; }).length, viewed: viewedCount() };
    Object.keys(counts).forEach(function (key) { var element = document.querySelector('[data-count="' + key + '"]'); if (element) element.textContent = counts[key] + " 条"; });
  }

  function renderProfile() {
    var list = document.querySelector("[data-profile-list]");
    if (!list || !window.CampusData) return;
    var items = getItems();
    var favorites = typeof CampusData.getMyFavorites === "function" ? resolveItems(CampusData.getMyFavorites(USER_ID)) : [];
    var comments = typeof CampusData.getMyComments === "function" ? CampusData.getMyComments(USER_ID) : [];
    var tab = document.body.getAttribute("data-profile-view") || "posts";
    var completedFound = items.filter(function (item) { return item.status === "completed" && item.type === "found"; });
    var selected = tab === "favorites" ? favorites : (tab === "history" ? completedFound : items);
    var titleElement = document.querySelector("[data-list-title]");
    if (titleElement) titleElement.textContent = "我的发布";
    var countElement = document.querySelector("[data-filter-count]");
    if (countElement) countElement.textContent = selected.length + " 条";
    updateStats(items, favorites, comments);
    list.innerHTML = selected.map(function (item) { return card(item, tab === "posts"); }).join("") || "<p class=\"empty-state\">暂无内容</p>";
  }

  function renderMyPosts() {
    var list = document.querySelector("[data-my-posts-list]");
    if (!list || !window.CampusData) return;
    var items = getItems();
    var count = document.querySelector("[data-post-count]");
    if (count) count.textContent = items.length + " 条";
    list.innerHTML = items.map(function (item) { return card(item, true); }).join("") || "<p class=\"empty-state\">还没有发布信息</p>";
  }

  window.MemberBProfile = { renderProfile: renderProfile, renderMyPosts: renderMyPosts };
  renderProfile();
  renderMyPosts();
})();
