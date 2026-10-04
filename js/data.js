/* A 模块先使用本地示例数据；B 同学接入 localStorage 时保持同样的字段结构。 */
(function () {
  const ITEMS_STORAGE_KEY = "campus-lost-found-items";
  const VIEWED_ITEMS_STORAGE_KEY = "campus-lost-found-viewed-items";
  const CURRENT_USER_ID = "current-user";
  const campusLocations = [
    "图书馆", "图书馆二楼", "中楼", "中楼 301", "东一", "东二", "东三",
    "西一", "西二", "西三", "文科楼", "理科楼", "京元餐厅", "丁香园",
    "一区学生街", "第一田径场", "第二田径场", "游泳场", "风雨操场",
    "素拓中心", "行政楼", "校医院", "玫瑰园", "紫荆园", "福友阁",
    "北门", "东门", "南门", "快递中心", "宿舍区"
  ];
  const seedItems = [
    { id: "lost-card-001", type: "lost", name: "校园卡", category: "证件", location: "图书馆二楼", date: "今天 10:24", description: "蓝色卡套，卡套背面有一枚小树贴纸。最后一次使用是在图书馆二楼自习区。", contact: "QQ：24681357", imageClass: "icon-blue", icon: "card", status: "active", publisher: "林同学", views: 128, createdAt: "2026-10-04T10:24:00" },
    { id: "found-card-002", type: "found", name: "校园卡（蓝色卡套）", category: "证件", location: "快递中心", date: "昨天 20:12", description: "蓝色透明卡套，在快递中心取件台旁发现。", contact: "手机：138****2716", imageClass: "icon-blue", icon: "card", status: "active", publisher: "周同学", views: 96, createdAt: "2026-10-03T20:12:00" },
    { id: "found-card-003", type: "found", name: "校园卡", category: "证件", location: "中楼 301", date: "9月25日", description: "在中楼 301 教室后排发现，已交至学院值班室。", contact: "手机：138****5620", imageClass: "icon-blue", icon: "card", status: "completed", publisher: "校园志愿者", views: 174, createdAt: "2026-09-25T16:30:00" },
    { id: "lost-umbrella-001", type: "found", name: "黑色折叠伞", category: "日用品", location: "京元餐厅", date: "今天 09:15", description: "黑色长柄折叠伞，伞柄上贴着白色姓名贴。可能遗落在京元餐厅。", contact: "电话：13800001234", imageClass: "icon-gray", icon: "umbrella", status: "active", publisher: "周同学", views: 86, createdAt: "2026-10-04T09:15:00" },
    { id: "found-earphone-001", type: "lost", name: "白色无线耳机", category: "电子产品", location: "东二教学楼", date: "昨天 18:40", description: "在东二教学楼发现，白色充电盒，盒盖有轻微划痕。", contact: "微信：拾光-421", imageClass: "icon-purple", icon: "headphones", status: "completed", publisher: "陈同学", views: 215, createdAt: "2026-10-03T18:40:00" },
    { id: "found-cup-001", type: "found", name: "蓝色保温杯", category: "日用品", location: "第一田径场", date: "昨天 16:08", description: "蓝色保温杯，在第一田径场看台附近发现。", contact: "QQ：13579246", imageClass: "icon-cyan", icon: "cup", status: "active", publisher: "拾光志愿者", views: 64, createdAt: "2026-10-03T16:08:00" }
  ];

  // The project has no account system yet, so localStorage represents one browser user.
  let memoryItems = null;
  const memoryViewedItems = new Set();

  function readViewedItemIds() {
    try {
      const saved = window.localStorage.getItem(VIEWED_ITEMS_STORAGE_KEY);
      const ids = saved ? JSON.parse(saved) : [];
      return new Set(Array.isArray(ids) ? ids.map(String) : []);
    } catch (error) {
      return new Set(memoryViewedItems);
    }
  }

  function writeViewedItemIds(ids) {
    memoryViewedItems.clear();
    ids.forEach(id => memoryViewedItems.add(String(id)));
    try {
      window.localStorage.setItem(VIEWED_ITEMS_STORAGE_KEY, JSON.stringify([...ids]));
    } catch (error) {
      // Keep the in-memory fallback when localStorage is unavailable.
    }
  }

  function writeItems(items) {
    memoryItems = items;
    try {
      window.localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // Keep the in-memory fallback when localStorage is unavailable.
    }
  }

  function normalizeItem(item) {
    if (item.location !== "京灵餐厅") return item;
    return {
      ...item,
      location: "京元餐厅",
      description: (item.description || "").replaceAll("京灵餐厅", "京元餐厅")
    };
  }

  function readItems() {
    if (memoryItems) return memoryItems.map(normalizeItem);
    try {
      const saved = window.localStorage.getItem(ITEMS_STORAGE_KEY);
      if (saved) {
        const storedItems = JSON.parse(saved).map(normalizeItem);
        const missingSeeds = seedItems.filter(seed => !storedItems.some(item => item.id === seed.id));
        return storedItems.concat(missingSeeds);
      }
    } catch (error) {
      console.warn("无法读取本地数据，将使用示例数据。", error);
    }
    return (memoryItems || seedItems).map(normalizeItem);
  }

  function getItemById(id) {
    return readItems().find(item => item.id === id) || null;
  }

  function getTypeLabel(type) { return type === "lost" ? "寻物" : "招领"; }
  function getStatusLabel(item) {
    if (item.status === "completed") return item.type === "lost" ? "已找到" : "已归还";
    return item.type === "lost" ? "寻找中" : "待认领";
  }

  function getCampusLocations() { return campusLocations.slice(); }

  function formValue(formData, name) {
    if (!formData) return "";
    if (typeof formData.get === "function") return String(formData.get(name) || "").trim();
    return String(formData[name] || "").trim();
  }

  function createItem(formData) {
    const type = formValue(formData, "type") === "found" ? "found" : "lost";
    const createdAt = new Date().toISOString();
    const item = {
      id: type + "-" + Date.now(),
      type,
      name: formValue(formData, "title") || formValue(formData, "name"),
      category: formValue(formData, "category"),
      location: formValue(formData, "location"),
      date: formValue(formData, "date"),
      description: formValue(formData, "description"),
      contact: formValue(formData, "contact"),
      imageClass: type === "found" ? "icon-green" : "icon-blue",
      icon: "card",
      status: "active",
      publisher: formValue(formData, "publisher") || "林同学",
      publisherId: formValue(formData, "publisherId") || CURRENT_USER_ID,
      views: 0,
      createdAt
    };
    const items = readItems();
    writeItems(items.concat(item));
    return item;
  }

  function getMyItems(userId) {
    const ownerId = String(userId || CURRENT_USER_ID);
    return readItems().filter(item => String(item.publisherId || "") === ownerId);
  }

  function updateStatus(id, nextStatus) {
    const itemId = String(id || "");
    if (!itemId || !["active", "completed"].includes(nextStatus)) return null;
    const items = readItems();
    const item = items.find(entry => entry.id === itemId);
    if (!item || item.publisherId !== CURRENT_USER_ID) return null;
    const updated = items.map(entry => entry.id === itemId ? { ...entry, status: nextStatus } : entry);
    writeItems(updated);
    return updated.find(entry => entry.id === itemId) || null;
  }

  function recordView(id) {
    const itemId = String(id || "");
    if (!itemId) return null;

    const items = readItems();
    const item = items.find(entry => entry.id === itemId);
    if (!item) return null;

    const viewedIds = readViewedItemIds();
    if (viewedIds.has(itemId)) return { ...item, added: false };

    const updatedItems = items.map(entry => entry.id === itemId
      ? { ...entry, views: (Number(entry.views) || 0) + 1 }
      : entry
    );
    writeItems(updatedItems);
    viewedIds.add(itemId);
    writeViewedItemIds(viewedIds);

    return { ...updatedItems.find(entry => entry.id === itemId), added: true };
  }

  window.CampusData = {
    readItems,
    getItemById,
    createItem,
    updateStatus,
    getMyItems,
    getTypeLabel,
    getStatusLabel,
    getCampusLocations,
    recordView
  };
})();
