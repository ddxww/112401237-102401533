(function () {
  "use strict";

  const form = document.getElementById("publish-form");
  const locationSelect = document.getElementById("publish-location");
  const dateInput = document.getElementById("publish-date");
  const message = document.getElementById("publish-form-message");

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatDate(value) {
    const date = new Date(`${value}T00:00:00`);
    const current = new Date();
    if (value === today()) return `今天 ${String(current.getHours()).padStart(2, "0")}:${String(current.getMinutes()).padStart(2, "0")}`;
    if (date.getFullYear() === current.getFullYear()) return `${date.getMonth() + 1}月${date.getDate()}日`;
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function setError(name, text) {
    const target = document.querySelector(`[data-error="${name}"]`);
    if (target) target.textContent = text || "";
  }

  function validate(data) {
    const errors = {};
    ["name", "category", "date", "location", "description", "contact"].forEach(name => {
      if (!String(data.get(name) || "").trim()) errors[name] = "请填写此项";
    });
    if (data.get("date") && data.get("date") > today()) errors.date = "日期不能晚于今天";
    return errors;
  }

  function fillLocations() {
    CampusData.getCampusLocations().forEach(location => {
      const option = document.createElement("option");
      option.value = location;
      option.textContent = location;
      locationSelect.appendChild(option);
    });
  }

  function submit(event) {
    event.preventDefault();
    message.textContent = "";
    const data = new FormData(form);
    const errors = validate(data);
    document.querySelectorAll("[data-error]").forEach(target => { target.textContent = ""; });
    Object.entries(errors).forEach(([name, text]) => setError(name, text));
    if (Object.keys(errors).length) {
      message.textContent = "请先补充带 * 的信息";
      return;
    }

    const item = CampusData.createItem({
      type: data.get("type"),
      name: data.get("name"),
      category: data.get("category"),
      location: data.get("location"),
      locationDetail: data.get("locationDetail"),
      dateLabel: formatDate(data.get("date")),
      description: data.get("description"),
      contact: data.get("contact"),
      publisher: "校园用户"
    });

    if (!item) {
      message.textContent = "发布失败，请稍后重试";
      return;
    }
    window.location.href = "../index.html";
  }

  dateInput.max = today();
  fillLocations();
  form.addEventListener("submit", submit);
  window.MemberBPublish = { validate, formatDate };
})();
