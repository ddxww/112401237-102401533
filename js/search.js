(function () {
  const form = document.getElementById("filter-form");
  const keyword = document.getElementById("keyword");
  const clearKeyword = document.getElementById("clear-keyword");
  const grid = document.getElementById("search-item-grid");
  const noResults = document.getElementById("no-results-state");
  const summary = document.getElementById("results-summary");
  const resultsHeading = document.getElementById("results-heading");
  const overlay = document.getElementById("filter-overlay");
  const openFilter = document.getElementById("open-filter");
  const closeFilter = document.getElementById("close-filter");
  const filterScrim = document.getElementById("filter-scrim");
  const confirmFilter = document.getElementById("confirm-filter");
  const resetFilters = document.getElementById("reset-filters");
  const params = new URLSearchParams(window.location.search);
  const filters = { sort: "default", time: "all", location: "all" };

  keyword.value = params.get("keyword") || "校园卡";

  function locationMatches(item, value) {
    if (value === "all") return true;
    const location = item.location || "";
    const map = {
      教学区: /教学楼|博学楼|教室|图书馆/,
      生活区: /宿舍|生活区|餐厅/,
      操场: /操场|田径场|体育场/,
      食堂: /食堂|餐厅/,
      学院楼: /学院|教学楼|教室/,
    };
    return map[value] ? map[value].test(location) : !Object.values(map).some(pattern => pattern.test(location));
  }

  function timeMatches(item, value) {
    if (value === "all") return true;
    const createdAt = new Date(item.createdAt).getTime();
    if (Number.isNaN(createdAt)) return true;
    const days = value === "day" ? 1 : value === "week" ? 7 : 183;
    return Date.now() - createdAt <= days * 24 * 60 * 60 * 1000;
  }

  function render() {
    const key = keyword.value.trim().toLowerCase();
    let items = CampusData.readItems().filter(item => {
      const matchesKeyword = !key || [item.name, item.category, item.location, item.description].join(" ").toLowerCase().includes(key);
      return matchesKeyword && locationMatches(item, filters.location) && timeMatches(item, filters.time);
    });

    if (filters.sort === "newest") {
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.sort === "views") {
      items.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    grid.innerHTML = items.map(CampusCard.itemCard).join("");
    summary.textContent = `找到 ${items.length} 条相关结果`;
    resultsHeading.classList.toggle("hidden", items.length === 0);
    noResults.classList.toggle("hidden", items.length > 0);
    document.getElementById("search-suggestion").classList.remove("hidden");
    clearKeyword.classList.toggle("hidden", !keyword.value);
  }

  function setOverlay(open) {
    overlay.classList.toggle("hidden", !open);
    document.body.classList.toggle("filter-open", open);
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    render();
  });
  keyword.addEventListener("input", render);
  clearKeyword.addEventListener("click", () => {
    keyword.value = "";
    render();
    keyword.focus();
  });
  openFilter.addEventListener("click", () => setOverlay(true));
  closeFilter.addEventListener("click", () => setOverlay(false));
  filterScrim.addEventListener("click", () => setOverlay(false));
  confirmFilter.addEventListener("click", () => {
    setOverlay(false);
    render();
  });
  resetFilters.addEventListener("click", () => {
    Object.assign(filters, { sort: "default", time: "all", location: "all" });
    document.querySelectorAll(".chip-group").forEach(group => {
      group.querySelectorAll(".chip").forEach((chip, index) => chip.classList.toggle("active", index === 0));
    });
    render();
  });

  document.querySelectorAll(".chip-group").forEach(group => {
    const name = group.dataset.filterGroup;
    group.querySelectorAll(".chip").forEach(chip => chip.addEventListener("click", () => {
      filters[name] = chip.dataset.value;
      group.querySelectorAll(".chip").forEach(option => option.classList.toggle("active", option === chip));
    }));
  });

  render();
})();
