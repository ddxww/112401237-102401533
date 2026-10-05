(function () {
  "use strict";

  var profileKey = "campus-lost-found-profile";
  var contactKey = "campus-lost-found-contact";
  var itemsKey = "campus-lost-found-items";
  var defaults = { name: "林同学", university: "福州大学", college: "信息学院", grade: "2024级", contact: "" };
  var form = document.getElementById("contact-form");
  if (!form) return;
  var fields = {
    name: document.getElementById("profile-name"),
    university: document.getElementById("profile-university"),
    college: document.getElementById("profile-college"),
    grade: document.getElementById("profile-grade"),
    contact: document.getElementById("profile-contact")
  };
  var message = document.querySelector("[data-contact-message]");

  function readProfile() {
    var profile = {};
    try {
      profile = JSON.parse(window.localStorage.getItem(profileKey) || "{}");
    } catch (error) {
      profile = {};
    }
    if (!profile.contact) {
      try { profile.contact = window.localStorage.getItem(contactKey) || ""; } catch (error) { profile.contact = ""; }
    }
    return Object.assign({}, defaults, profile);
  }

  function fillForm(profile) {
    Object.keys(fields).forEach(function (key) {
      if (fields[key]) fields[key].value = profile[key] || "";
    });
  }

  function syncOwnItems(profile) {
    var updated = false;
    try {
      var savedItems = window.localStorage.getItem(itemsKey);
      var items = savedItems ? JSON.parse(savedItems) : [];
      var nextItems = items.map(function (item) {
        var isMine = item && (item.publisherId === "current-user" || item.publisher === "校园用户" || item.publisher === "林同学");
        if (!isMine) return item;
        updated = true;
        return Object.assign({}, item, { publisher: profile.name, contact: profile.contact });
      });
      if (updated) window.localStorage.setItem(itemsKey, JSON.stringify(nextItems));
    } catch (error) {
      updated = false;
    }
    return updated;
  }

  fillForm(readProfile());

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var profile = {};
    Object.keys(fields).forEach(function (key) { profile[key] = fields[key] ? fields[key].value.trim() : ""; });
    if (!profile.name || !profile.university || !profile.college || !profile.grade || !profile.contact) {
      message.textContent = "请完整填写个人信息。";
      return;
    }
    try {
      window.localStorage.setItem(profileKey, JSON.stringify(profile));
      window.localStorage.setItem(contactKey, profile.contact);
      var updated = false;
      if (window.CampusData && typeof CampusData.updateMyContact === "function") {
        updated = CampusData.updateMyContact(profile.contact, "current-user") !== false;
      }
      updated = syncOwnItems(profile) || updated;
      message.textContent = updated ? "个人信息已保存，并已同步到我的发布。" : "个人信息已保存。";
    } catch (error) {
      message.textContent = "当前浏览器无法保存，请重试。";
    }
  });
})();