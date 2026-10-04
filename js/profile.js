(function () {
  "use strict";

  var USER_ID = "current-user";

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function getItems() {
    return window.CampusData && typeof CampusData.getMyItems === "function" ? CampusData.getMyItems(USER_ID) : [];
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

  function card(item, withAction) {
    var action = withAction ? "<a class=\"post-action\" href=\"./status.html?id=" + encodeURIComponent(item.id) + "\">修改状态</a>" : "";
    return "<article class=\"post-card\"><div class=\"post-icon " + escapeHtml(item.imageClass || "icon-blue") + "\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\"><path d=\"M5 4h14v16H5zM8 8h8M8 12h6M8 16h4\"/></svg></div><div class=\"post-copy\"><div class=\"post-meta\"><span>" + typeLabel(item) + "</span><strong>" + statusLabel(item) + "</strong></div><h3>" + escapeHtml(item.name) + "</h3><p>" + escapeHtml(item.date) + " · " + escapeHtml(item.location) + "</p>" + action + "</div></article>";
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
    var counts = { posts: items.length, favorites: favorites.length, comments: comments.length, history: items.filter(function (item) { return item.status === "completed" && item.type === "found"; }).length };
    Object.keys(counts).forEach(function (key) { var element = document.querySelector('[data-count="' + key + '"]'); if (element) element.textContent = counts[key] + " 条"; });
  }

  function renderProfile() {
    var list = document.querySelector("[data-profile-list]");
    if (!list || !window.CampusData) return;
    var items = getItems();
    var favorites = typeof CampusData.getMyFavorites === "function" ? resolveItems(CampusData.getMyFavorites(USER_ID)) : [];
    var comments = typeof CampusData.getMyComments === "function" ? CampusData.getMyComments(USER_ID) : [];
    var tab = new URLSearchParams(window.location.search).get("tab") || "posts";
    var completedFound = items.filter(function (item) { return item.status === "completed" && item.type === "found"; });
    var selected = tab === "favorites" ? favorites : (tab === "history" ? completedFound : items);
    var title = tab === "favorites" ? "我的收藏" : (tab === "comments" ? "我的评论" : (tab === "history" ? "归还记录" : "我的发布"));
    var titleElement = document.querySelector("[data-list-title]");
    if (titleElement) titleElement.textContent = title;
    updateStats(items, favorites, comments);
    if (tab === "comments") list.innerHTML = comments.map(function (comment) { return commentCard(comment, items); }).join("") || "<p class=\"empty-state\">还没有评论</p>";
    else list.innerHTML = selected.map(function (item) { return card(item, tab === "posts"); }).join("") || "<p class=\"empty-state\">暂无内容</p>";
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
