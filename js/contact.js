(function () {
  "use strict";

  var contactKey = "campus-lost-found-contact";
  var itemsKey = "campus-lost-found-items";
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
      var updated = false;
      if (window.CampusData && typeof CampusData.updateMyContact === "function") {
        updated = CampusData.updateMyContact(value, "current-user") !== false;
      } else {
        var savedItems = window.localStorage.getItem(itemsKey);
        var items = savedItems ? JSON.parse(savedItems) : [];
        var nextItems = items.map(function (item) {
          var isMine = item && (item.publisherId === "current-user" || item.publisher === "校园用户");
          if (!isMine) return item;
          updated = true;
          return Object.assign({}, item, { contact: value });
        });
        if (updated) window.localStorage.setItem(itemsKey, JSON.stringify(nextItems));
      }
      message.textContent = updated ? "联系方式已保存，已同步到我的发布。" : "联系方式已保存，将用于之后发布的信息。";
    } catch (error) {
      message.textContent = "当前浏览器无法保存，请重试。";
    }
  });
})();
