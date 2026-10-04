(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  }

  function statusLabel(item) {
    return window.MemberBData.statuses[item.status] || "寻找中";
  }

  function renderPost(item) {
    return "<article class=\"member-b-post\"><h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.date) + " · " + escapeHtml(item.location) + "</p><span>" + statusLabel(item) + "</span><button type=\"button\" data-member-b-action=\"set-status\" data-id=\"" + escapeHtml(item.id) + "\" data-status=\"found\">标记已找到</button><button type=\"button\" data-member-b-action=\"set-status\" data-id=\"" + escapeHtml(item.id) + "\" data-status=\"returned\">标记已归还</button></article>";
  }

  function renderMinePage(items) {
    var posts = (items || []).filter(function (item) { return item.owner; });
    return "<section class=\"member-b-mine\"><h2>我的发布</h2><div class=\"member-b-post-list\">" + (posts.map(renderPost).join("") || "<p>还没有发布信息</p>") + "</div></section>";
  }

  function setStatus(id, status) {
    return window.MemberBStorage.updateStatus(id, status);
  }

  window.MemberBMine = {
    statusLabel: statusLabel,
    renderPost: renderPost,
    renderMinePage: renderMinePage,
    setStatus: setStatus
  };
})();
