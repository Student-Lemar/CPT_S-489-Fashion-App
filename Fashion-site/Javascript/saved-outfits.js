(function () {
  const App = window.FashionApp;
  const user = App?.getSession();
  if (!App || !user) return;
  const grid = document.getElementById('outfits-grid');
  const searchInput = document.querySelector('.search-input');
  const sortSelect = document.querySelector('.sort-select');
  function outfits() { return App.getUserOutfits(user.username); }
  function icons(outfit) { return App.getOutfitIcons(outfit); }
  function render() {
    if (!grid) return;
    const q = (searchInput?.value || '').trim().toLowerCase();
    let data = outfits().filter(o => !q || o.name.toLowerCase().includes(q) || (o.caption || '').toLowerCase().includes(q));
    const sort = sortSelect?.value || 'Newest First';
    if (sort.includes('Newest')) data.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    if (sort.includes('Oldest')) data.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
    if (sort.includes('A-Z')) data.sort((a,b)=>a.name.localeCompare(b.name));
    grid.innerHTML = data.length ? data.map(outfit => {
      const itemIcons = icons(outfit);
      const itemsHtml = itemIcons.map((icon, index) => `<div class="preview-item ${(itemIcons.length===2 || (itemIcons.length===3 && index===0)) ? 'large' : ''}">${icon}</div>`).join('');
      return `<div class="outfit-card" data-id="${outfit.id}"><div class="card-preview">${itemsHtml}</div><div class="card-details"><div class="outfit-name">${outfit.name}</div><div class="outfit-meta"><span>${itemIcons.length} items</span><span>${App.formatDate(outfit.createdAt)}</span></div></div></div>`;
    }).join('') : '<p>No outfits saved yet. Generate one first.</p>';
    grid.querySelectorAll('.outfit-card').forEach(card => card.onclick = () => window.location.href = `outfit-detail.html?id=${encodeURIComponent(card.dataset.id)}`);
  }
  searchInput?.addEventListener('input', render);
  sortSelect?.addEventListener('change', render);
  render();
})();
