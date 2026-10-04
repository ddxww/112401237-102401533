(function () {
  "use strict";

  var statuses = {
    pending: "寻找中",
    found: "已找到",
    returned: "已归还"
  };

  function createItem(input) {
    return {
      id: input.id || "item-" + Date.now(),
      type: input.type === "found" ? "found" : "lost",
      title: String(input.title || "").trim(),
      category: String(input.category || "").trim(),
      description: String(input.description || "").trim(),
      location: String(input.location || "").trim(),
      date: String(input.date || ""),
      contact: String(input.contact || "").trim(),
      image: input.image || "",
      status: input.status || "pending",
      publisher: input.publisher || "我",
      owner: input.owner !== false,
      createdAt: input.createdAt || new Date().toISOString()
    };
  }

  window.MemberBData = {
    statuses: statuses,
    createItem: createItem,
    seedItems: [
      createItem({ id: "member-b-seed-1", title: "校园卡", category: "证件", description: "蓝色卡套，卡面有磨损痕迹。", location: "图书馆", date: "2026-10-04", status: "pending" }),
      createItem({ id: "member-b-seed-2", title: "白色无线耳机", category: "数码", description: "白色耳机盒，正面有浅蓝色保护壳。", location: "东二", date: "2026-09-23", status: "found" })
    ]
  };
})();
