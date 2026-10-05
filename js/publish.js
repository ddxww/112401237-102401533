(function () {
  "use strict";

  var USER_ID = "current-user";
  var LOCATION_GROUPS = [
    { label: "图书馆", items: [] },
    { label: "晋江楼", items: [] },
    { label: "教学区", items: ["中楼", "东一", "东二", "东三", "西一", "西二", "西三", "文一", "文二", "文三"] },
    { label: "学院楼", items: ["机械学院", "机电学院", "电气学院", "车辆工程", "化学学院", "材料学院", "生工学院", "环安学院", "土木学院", "建筑学院"] },
    { label: "餐厅", items: ["京元", "芙蓉园", "玫瑰园", "紫荆园", "牡丹园", "丁香园", "紫竹园", "茉莉园", "丹桂园", "百合园", "教工餐厅"] },
    { label: "服务与公共设施", items: ["快递中心", "校医院", "福友阁", "青春广场", "素拓中心", "学生活动中心", "山北行政楼", "山南行政楼"] },
    { label: "体育场馆", items: ["第一田径场", "第二田径场", "风雨操场"] },
    { label: "宿舍区", items: ["一区学生公寓", "二区学生公寓", "三区学生公寓", "四区学生公寓", "五区学生公寓"] }
  ];

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function today() {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    var values = {};
    parts.forEach(function (part) { values[part.type] = part.value; });
    return values.year + "-" + values.month + "-" + values.day;
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
    if (!String(data.get("locationDetail") || "").trim()) errors.locationDetail = "请填写具体位置";
    if (!String(data.get("contact") || "").trim()) errors.contact = "请填写联系方式";
    return errors;
  }

  function renderLocations() {
    var picker = document.querySelector("[data-location-picker]");
    if (!picker) return;
    var hiddenInput = document.getElementById("publish-location");
    var trigger = picker.querySelector(".location-trigger");
    var label = picker.querySelector("[data-location-label]");
    var menu = picker.querySelector("[data-location-menu]");
    var groupsContainer = picker.querySelector("[data-location-groups]");
    var customInput = picker.querySelector("#publish-custom-location");
    var customConfirm = picker.querySelector("[data-location-custom-confirm]");
    if (!hiddenInput || !trigger || !label || !menu || !groupsContainer) return;

    function closeMenu() {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }

    function chooseLocation(value) {
      var normalized = String(value || "").trim();
      if (!normalized) return;
      hiddenInput.value = normalized;
      label.textContent = normalized;
      trigger.classList.add("has-value");
      showError("location", "");
      closeMenu();
    }

    function createOption(text, className) {
      var option = document.createElement("button");
      option.type = "button";
      option.className = className || "location-option";
      option.textContent = text;
      option.addEventListener("click", function () { chooseLocation(text); });
      return option;
    }

    LOCATION_GROUPS.forEach(function (group) {
      if (!group.items.length) {
        groupsContainer.appendChild(createOption(group.label, "location-option location-level-one"));
        return;
      }
      var groupElement = document.createElement("div");
      groupElement.className = "location-group";
      var groupToggle = document.createElement("button");
      groupToggle.type = "button";
      groupToggle.className = "location-group-toggle";
      groupToggle.setAttribute("aria-expanded", "false");
      groupToggle.innerHTML = "<span>" + escapeHtml(group.label) + "</span><svg class=\"location-group-arrow\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m9 6 6 6-6 6\"/></svg>";
      var options = document.createElement("div");
      options.className = "location-group-options";
      options.hidden = true;
      group.items.forEach(function (item) { options.appendChild(createOption(item)); });
      groupToggle.addEventListener("click", function () {
        var expanded = groupToggle.getAttribute("aria-expanded") === "true";
        groupToggle.setAttribute("aria-expanded", String(!expanded));
        options.hidden = expanded;
      });
      groupElement.appendChild(groupToggle);
      groupElement.appendChild(options);
      groupsContainer.appendChild(groupElement);
    });

    var customBlock = document.createElement("button");
    customBlock.type = "button";
    customBlock.className = "location-option location-custom-entry";
    customBlock.textContent = "其他 / 自定义地点";
    customBlock.addEventListener("click", function () {
      if (customInput) {
        customInput.focus();
        customInput.scrollIntoView({ block: "nearest" });
      }
    });
    groupsContainer.appendChild(customBlock);

    trigger.addEventListener("click", function () {
      var isOpen = !menu.hidden;
      menu.hidden = isOpen;
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
    if (customConfirm && customInput) {
      customConfirm.addEventListener("click", function () {
        var value = customInput.value.trim();
        if (!value) {
          showError("location", "请输入自定义地点");
          customInput.focus();
          return;
        }
        chooseLocation(value);
      });
    }
    document.addEventListener("click", function (event) {
      if (!picker.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
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
    var item = CampusData.createItem({
      type: data.get("type"),
      name: String(data.get("title") || "").trim(),
      category: String(data.get("category") || "").trim(),
      location: String(data.get("location") || "").trim(),
      locationDetail: String(data.get("locationDetail") || "").trim(),
      dateLabel: formatDate(data.get("date")),
      description: String(data.get("description") || "").trim(),
      contact: String(data.get("contact") || "").trim(),
      publisher: "校园用户"
    });
    if (!item || !item.id) {
      document.getElementById("publish-form-message").textContent = "发布失败，请稍后重试";
      return;
    }
    window.location.href = "../index.html";
  }

  function initPublishPage() {
    var form = document.getElementById("publish-form");
    if (!form) return;
    var dateInput = document.getElementById("publish-date");
    if (dateInput) dateInput.max = today();
    var contactInput = form.querySelector('[name="contact"]');
    if (contactInput) {
      try {
        contactInput.value = window.localStorage.getItem("campus-lost-found-contact") || "";
      } catch (error) {
        contactInput.value = "";
      }
    }
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
