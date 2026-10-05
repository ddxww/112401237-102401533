(function () {
  const grid = document.getElementById("home-item-grid");
  const empty = document.getElementById("home-empty");
  const count = document.getElementById("home-result-count");
  const segments = document.querySelectorAll("[data-home-filter]");
  const categoryFilters = document.querySelectorAll("[data-home-category]");
  const categoryToolbar = document.querySelector(".category-toolbar");
  const categoryScroll = document.querySelector(".category-scroll");
  const categoryScrollBack = document.querySelector(".category-scroll-back");
  const categoryScrollCue = document.querySelector(".category-scroll-cue");
  const heroSearch = document.querySelector(".hero-search");
  const heroSearchInput = heroSearch?.querySelector("input");
  let currentFilter = "all";
  let currentCategory = "all";

  function updateCategoryScrollCue() {
    if (!categoryToolbar || !categoryScroll) return;
    const maxScroll = categoryScroll.scrollWidth - categoryScroll.clientWidth;
    const hasMore = maxScroll > 2 && categoryScroll.scrollLeft < maxScroll - 2;
    const hasPrevious = categoryScroll.scrollLeft > 2;
    categoryToolbar.classList.toggle("has-more", hasMore);
    categoryToolbar.classList.toggle("is-scrolled", hasPrevious);
    if (categoryScrollBack) categoryScrollBack.hidden = !hasPrevious;
    if (categoryScrollCue) categoryScrollCue.hidden = !hasMore;
  }

  function render() {
    const items = CampusData.readItems().filter(item => {
      const matchesType = currentFilter === "all" || item.type === currentFilter;
      const matchesCategory = currentCategory === "all" || item.category === currentCategory;
      return matchesType && matchesCategory;
    });
    grid.innerHTML = items.map(CampusCard.itemCard).join("");
    empty.classList.toggle("hidden", items.length > 0);
    count.textContent = `${items.length} 条信息`;
  }

  segments.forEach(button => button.addEventListener("click", () => {
    currentFilter = button.dataset.homeFilter;
    segments.forEach(segment => {
      const active = segment === button;
      segment.classList.toggle("active", active);
      segment.setAttribute("aria-selected", String(active));
    });
    render();
  }));

  categoryFilters.forEach(button => button.addEventListener("click", () => {
    currentCategory = button.dataset.homeCategory || "all";
    categoryFilters.forEach(categoryButton => {
      const active = categoryButton === button;
      categoryButton.classList.toggle("active", active);
      categoryButton.setAttribute("aria-selected", String(active));
    });
    render();
  }));

  categoryScroll?.addEventListener("scroll", updateCategoryScrollCue, { passive: true });
  categoryScrollCue?.addEventListener("click", () => {
    categoryScroll?.scrollTo({
      left: categoryScroll.scrollWidth,
      behavior: "smooth"
    });
  });
  categoryScrollBack?.addEventListener("click", () => {
    categoryScroll?.scrollTo({ left: 0, behavior: "smooth" });
  });
  window.addEventListener("resize", updateCategoryScrollCue);
  requestAnimationFrame(updateCategoryScrollCue);

  // The home page is only the search entry point. Search is submitted on the
  // dedicated search page so the user can review recent and popular searches.
  heroSearchInput?.addEventListener("click", () => {
    window.location.href = "./pages/search.html";
  });
  heroSearch?.addEventListener("submit", event => {
    event.preventDefault();
    window.location.href = "./pages/search.html";
  });

  render();
})();
