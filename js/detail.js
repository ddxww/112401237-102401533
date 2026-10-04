(function () {
  const container = document.getElementById("detail-content");
  const id = new URLSearchParams(window.location.search).get("id") || "lost-card-001";
  const item = CampusData.getItemById(id);
  const toast = document.getElementById("copy-toast");

  function notify(message) {
    toast.textContent = message;
    toast.classList.remove("hidden");
    window.setTimeout(() => toast.classList.add("hidden"), 1800);
  }

  if (!item) {
    container.innerHTML = '<div class="not-found"><h2>找不到这条信息</h2><p>它可能已经被移除，或链接已经失效。</p></div>';
    return;
  }

  document.title = `${item.name} | 拾光`;
  const statusClass = item.status === "completed" ? "completed" : "active";
  const categoryLabel = item.category === "证件" ? "证件卡类 · 校园一卡通" : `${item.category} · 校园物品`;
  container.innerHTML = `
    <div class="detail-visual ${item.imageClass}">
      <span class="item-emoji" aria-hidden="true">${CampusCard.iconSvg(item.icon)}</span>
    </div>
    <article class="detail-content">
      <div class="detail-kicker">
        <span class="item-type-inline ${item.type}">${CampusData.getTypeLabel(item.type)}</span>
        <span class="status-pill ${statusClass}">${CampusData.getStatusLabel(item)}</span>
      </div>
      <div class="detail-title-line">
        <h1>${item.name}</h1>
        <span class="detail-views">${item.views || 0} 次浏览</span>
      </div>
      <p class="detail-subtitle">${categoryLabel}</p>
      <section class="detail-description">
        <strong>特征描述</strong>
        <span>${item.description}</span>
      </section>
      <section class="detail-info">
        <div class="info-item time"><div><small>丢失时间</small><strong>${item.date}</strong></div></div>
        <div class="info-item place"><div><small>可能地点</small><strong>${item.location}</strong></div></div>
      </section>
      <section class="publisher-card">
        <span class="publisher-avatar">${item.publisher.slice(0, 1)}</span>
        <div><strong>${item.publisher}</strong><p>手机 ${item.contact.replace(/^[^：:]+[：:]/, "")}</p></div>
        <time>12分钟前</time>
      </section>
    </article>`;

  document.getElementById("save-detail").addEventListener("click", event => {
    event.currentTarget.classList.toggle("saved");
    notify(event.currentTarget.classList.contains("saved") ? "已加入收藏" : "已取消收藏");
  });
  document.getElementById("share-detail").addEventListener("click", () => notify("分享卡片已生成"));
  document.getElementById("contact-publisher").addEventListener("click", () => notify("联系请求已发送"));
})();
