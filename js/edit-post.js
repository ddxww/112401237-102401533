(function () {
  "use strict";
  var form = document.getElementById("edit-form");
  if (!form || !window.CampusData) return;
  var id = new URLSearchParams(window.location.search).get("id");
  var item = typeof CampusData.getItemById === "function" ? CampusData.getItemById(id) : null;
  var message = document.getElementById("edit-form-message");
  var allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!item || item.publisherId !== "current-user") { message.textContent = "无法编辑这条发布信息。"; return; }
  function field(name) { return form.elements[name]; }
  function setField(name, value) { if (field(name)) field(name).value = value || ""; }
  setField("title", item.name); setField("category", item.category); setField("description", item.description); setField("location", item.location); setField("locationDetail", item.locationDetail); setField("contact", item.contact);
  var type = form.querySelector('[name="type"][value="' + item.type + '"]'); if (type) type.checked = true;
  setField("date", String(item.createdAt || "").slice(0, 10));
  function readDataUrl(file) { return new Promise(function (resolve, reject) { var reader = new FileReader(); reader.onload = function () { resolve(reader.result); }; reader.onerror = reject; reader.readAsDataURL(file); }); }
  function showSlot(slot, data) { var image = document.createElement("img"); image.src = data; image.alt = "已选择的物品图片"; slot.classList.add("has-image"); slot.appendChild(image); }
  function bindSlot(input) { var slot = input.closest(".image-upload-slot"); input.addEventListener("change", function () { var file = input.files && input.files[0]; if (!file) return; if (!allowed.includes(file.type)) { input.value = ""; message.textContent = "只能选择图片文件"; return; } var old = slot.querySelector("img"); if (old) old.remove(); showSlot(slot, URL.createObjectURL(file)); }); }
  var inputs = Array.prototype.slice.call(form.querySelectorAll("[data-image-slot]"));
  inputs.forEach(function (input, index) { bindSlot(input); if (item.images && item.images[index]) showSlot(input.closest(".image-upload-slot"), item.images[index]); });
  form.addEventListener("submit", async function (event) { event.preventDefault(); if (typeof CampusData.updateItem !== "function") { message.textContent = "公共数据模块尚未提供编辑接口，请先同步队友代码。"; return; } var images = []; for (var i = 0; i < inputs.length; i += 1) { var file = inputs[i].files && inputs[i].files[0]; var existing = inputs[i].closest(".image-upload-slot").querySelector("img"); if (file) images.push(await readDataUrl(file)); else if (existing && item.images && item.images[i]) images.push(item.images[i]); } var updated = CampusData.updateItem(id, { type: field("type").value, name: field("title").value, category: field("category").value, description: field("description").value, location: field("location").value, locationDetail: field("locationDetail").value, date: field("date").value, contact: field("contact").value, images: images }, "current-user"); if (!updated) { message.textContent = "保存失败，请稍后重试。"; return; } window.location.href = "./profile.html"; });
})();
