(function () {
  "use strict";

  var USER_ID = "current-user";

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  }

  function init() {
    var form = document.getElementById("status-form");
    if (!form || !window.CampusData) return;
    var id = new URLSearchParams(window.location.search).get("id");
    var item = typeof CampusData.getItemById === "function" ? CampusData.getItemById(id) : null;
    var box = document.querySelector("[data-status-item]");
    var label = document.querySelector("[data-complete-label]");
    if (!item || item.publisherId !== USER_ID) {
      box.innerHTML = "<p>找不到可修改的发布信息。</p>";
      form.hidden = true;
      return;
    }
    box.innerHTML = "<h2>" + escapeHtml(item.name) + "</h2><p>" + escapeHtml(item.location) + " · " + escapeHtml(item.date) + "</p><span>" + escapeHtml(CampusData.getStatusLabel(item)) + "</span>";
    label.textContent = item.type === "lost" ? "标记为已找到" : "标记为已归还";
    if (item.status === "completed") {
      form.hidden = true;
      document.querySelector("[data-status-message]").textContent = "这条信息已经完成，无需重复修改。";
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var updated = CampusData.updateStatus(id, "completed");
      if (!updated) {
        document.querySelector("[data-status-message]").textContent = "状态更新失败，请重试。";
        return;
      }
      window.location.href = "./my-posts.html";
    });
  }

  window.MemberBStatus = { init: init };
  init();
})();
