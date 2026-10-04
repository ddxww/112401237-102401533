(function () {
  "use strict";

  var USER_ID = "current-user";

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function showError(name, message) {
    var target = document.querySelector('[data-error="' + name + '"]');
    if (target) target.textContent = message || "";
  }

  function clearErrors() {
    document.querySelectorAll("[data-error]").forEach(function (target) { target.textContent = ""; });
    var message = document.getElementById("publish-form-message");
    if (message) message.textContent = "";
  }

  function validate(data) {
    var errors = {};
    if (!String(data.get("title") || "").trim()) errors.title = "请输入物品名称";
    if (!String(data.get("category") || "").trim()) errors.category = "请选择分类";
    if (!String(data.get("description") || "").trim()) errors.description = "请填写特征描述";
    if (!String(data.get("date") || "")) errors.date = "请选择时间";
    else if (String(data.get("date")) > today()) errors.date = "日期不能晚于今天";
    if (!String(data.get("location") || "").trim()) errors.location = "请选择校内地点";
    if (!String(data.get("contact") || "").trim()) errors.contact = "请填写联系方式";
    return errors;
  }

  function renderLocations() {
    var select = document.getElementById("publish-location");
    if (!select || !window.CampusData) return;
    var getLocations = typeof CampusData.getCampusLocations === "function"
      ? CampusData.getCampusLocations
      : CampusData.getLocations;
    if (typeof getLocations !== "function") return;
    var locations = getLocations() || [];
    if (!locations.some(function (location) {
      return (typeof location === "string" ? location : location.value) === "其他";
    })) locations.push("其他");
    locations.forEach(function (location) {
      var value = typeof location === "string" ? location : location.value;
      var label = typeof location === "string" ? location : location.label;
      if (!value) return;
      var option = document.createElement("option");
      option.value = value;
      option.textContent = label || value;
      select.appendChild(option);
    });
  }

  function formatDate(dateValue) {
    var date = new Date(dateValue + "T00:00:00");
    if (Number.isNaN(date.getTime())) return dateValue;
    var now = new Date();
    if (dateValue === today()) return "今天 " + String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    return (date.getMonth() + 1) + "月" + date.getDate() + "日";
  }

  function submitPublish(event) {
    event.preventDefault();
    clearErrors();
    var form = event.currentTarget;
    var data = new FormData(form);
    var errors = validate(data);
    Object.keys(errors).forEach(function (name) { showError(name, errors[name]); });
    if (Object.keys(errors).length) {
      var message = document.getElementById("publish-form-message");
      if (message) message.textContent = "请先补充标有 * 的信息";
      return;
    }
    if (!window.CampusData || typeof CampusData.createItem !== "function") {
      document.getElementById("publish-form-message").textContent = "共享数据模块尚未加载";
      return;
    }
    data.set("publisherId", USER_ID);
    data.set("publisher", "林同学");
    data.set("dateValue", data.get("date"));
    data.set("date", formatDate(data.get("date")));
    data.delete("image");
    var item = CampusData.createItem(data);
    if (!item || !item.id) {
      document.getElementById("publish-form-message").textContent = "发布失败，请稍后重试";
      return;
    }
    window.location.href = "./publish-success.html?id=" + encodeURIComponent(item.id);
  }

  function initPublishPage() {
    var form = document.getElementById("publish-form");
    if (!form) return;
    var dateInput = document.getElementById("publish-date");
    if (dateInput) dateInput.max = today();
    renderLocations();
    form.addEventListener("submit", submitPublish);
  }

  function initSuccessPage() {
    var field = document.querySelector("[data-success-field]");
    if (!field) return;
    var id = new URLSearchParams(window.location.search).get("id");
    var item = window.CampusData && typeof CampusData.getItemById === "function" ? CampusData.getItemById(id) : null;
    if (!item) {
      document.querySelector(".success-content").innerHTML = "<h1>信息不存在</h1><p>这条发布信息可能已被删除。</p>";
      return;
    }
    var type = CampusData.getTypeLabel(item.type);
    var status = CampusData.getStatusLabel(item);
    document.querySelector('[data-success-field="type"]').textContent = type;
    document.querySelector('[data-success-field="name"]').textContent = item.name;
    document.querySelector('[data-success-field="status"]').textContent = status;
    var detailLink = document.querySelector('[data-success-action="detail"]');
    if (detailLink) detailLink.href = "./detail.html?id=" + encodeURIComponent(item.id);
  }

  window.MemberBPublish = { today: today, validate: validate, initPublishPage: initPublishPage, initSuccessPage: initSuccessPage };
  initPublishPage();
  initSuccessPage();
})();
