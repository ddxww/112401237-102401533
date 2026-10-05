(function () {
  "use strict";

  var contactKey = "campus-lost-found-contact";
  var form = document.getElementById("contact-form");
  var input = document.getElementById("contact-value");
  var message = document.querySelector("[data-contact-message]");

  try {
    input.value = window.localStorage.getItem(contactKey) || "";
  } catch (error) {
    input.value = "";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var value = input.value.trim();
    if (!value) {
      message.textContent = "请填写联系方式。";
      return;
    }
    try {
      window.localStorage.setItem(contactKey, value);
      message.textContent = "联系方式已保存。";
    } catch (error) {
      message.textContent = "当前浏览器无法保存，请重试。";
    }
  });
})();
