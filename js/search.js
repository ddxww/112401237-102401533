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
  const searchHomeState = document.getElementById("search-home-state");
  const searchHistoryList = document.getElementById("search-history-list");
  const clearSearchHistory = document.getElementById("clear-search-history");
  const searchScreen = document.querySelector(".search-screen");
  const params = new URLSearchParams(window.location.search);
  const filters = { sort: "default", time: "all", location: "all" };
  const SEARCH_HISTORY_KEY = "campus-lost-found-search-history";

  keyword.value = params.get("keyword") || "";

  function readSearchHistory() {
    try {
      const saved = window.localStorage.getItem(SEARCH_HISTORY_KEY);
      const history = saved ? JSON.parse(saved) : [];
      return Array.isArray(history) ? history.filter(Boolean).map(String) : [];
    } catch (error) {
      return [];
    }
  }

  function saveSearchTerm(value) {
    const term = value.trim();
    if (!term) return;
    const history = readSearchHistory().filter(item => item !== term);
    history.unshift(term);
    try {
      window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
    } catch (error) {
      // Search still works when localStorage is unavailable.
    }
  }

  function renderSearchHistory() {
    const history = readSearchHistory();
    searchHistoryList.innerHTML = history.length
      ? history.map(term => `<button type="button" data-search-term="${escapeHtml(term)}">${escapeHtml(term)}</button>`).join("")
      : '<p class="empty-search-history">暂无搜索记录</p>';
    searchHistoryList.querySelectorAll("[data-search-term]").forEach(button => {
      button.addEventListener("click", () => openSearchTerm(button.dataset.searchTerm));
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function openSearchTerm(term) {
    keyword.value = term;
    saveSearchTerm(term);
    params.set("keyword", term);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    render();
  }

  if (keyword.value.trim()) saveSearchTerm(keyword.value);

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
    const hasKeyword = Boolean(key);
    searchHomeState.classList.toggle("hidden", hasKeyword);
    searchScreen.classList.toggle("is-search-home", !hasKeyword);

    if (!hasKeyword) {
      grid.innerHTML = "";
      resultsHeading.classList.add("hidden");
      noResults.classList.add("hidden");
      document.getElementById("search-suggestion").classList.add("hidden");
      clearKeyword.classList.add("hidden");
      renderSearchHistory();
      return;
    }

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
    saveSearchTerm(keyword.value);
    params.set("keyword", keyword.value.trim());
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    render();
  });
  keyword.addEventListener("input", render);
  clearKeyword.addEventListener("click", () => {
    keyword.value = "";
    render();
    keyword.focus();
  });
  clearSearchHistory.addEventListener("click", () => {
    window.localStorage.removeItem(SEARCH_HISTORY_KEY);
    renderSearchHistory();
  });
  document.querySelectorAll("#popular-search-list [data-search-term]").forEach(button => {
    button.addEventListener("click", () => openSearchTerm(button.dataset.searchTerm));
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
