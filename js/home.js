(function () {
  const grid = document.getElementById("home-item-grid");
  const empty = document.getElementById("home-empty");
  const count = document.getElementById("home-result-count");
  const segments = document.querySelectorAll("[data-home-filter]");
  const heroSearchInput = document.querySelector(".hero-search input");
  let currentFilter = "all";

  function render() {
    const items = CampusData.readItems().filter(item => currentFilter === "all" || item.type === currentFilter);
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

  // The home search field is an entry point to the dedicated search screen.
  heroSearchInput?.addEventListener("click", () => {
    window.location.href = "./pages/search.html";
  });

  render();
})();
