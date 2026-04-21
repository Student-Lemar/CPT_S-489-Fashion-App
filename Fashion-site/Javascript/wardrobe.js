
(function () {
  const App = window.FashionApp;
  const user = App?.getSession();
  if (!user) return;
  const grid = document.getElementById('wardrobeGrid');
  const emptyState = document.getElementById('emptyState');
  const resultsText = document.getElementById('resultsText');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const colorFilter = document.getElementById('colorFilter');
  const sortFilter = document.getElementById('sortFilter');

  function render(items) {
    resultsText.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;
    if (!items.length) { grid.innerHTML = ''; emptyState.classList.remove('hidden'); return; }
    emptyState.classList.add('hidden');
    grid.innerHTML = items.map(item => `
      <article class="item-card card">
        <div class="item-thumb">${item.imageDataUrl ? `<img src="${item.imageDataUrl}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;">` : item.icon}</div>
        <div class="item-body">
          <div class="item-top"><div><h2 class="item-name">${item.name}</h2><div class="item-category">${item.category}</div></div><span class="color-badge">${item.color}</span></div>
          <div class="item-tags">${(item.tags || []).map(tag => `<span class="item-tag">${tag}</span>`).join('')}</div>
          <div class="item-actions"><a class="action-link" href="item-detail.html?id=${encodeURIComponent(item.id)}">View</a><a class="action-link" href="item-detail.html?id=${encodeURIComponent(item.id)}&mode=edit">Edit</a></div>
        </div>
      </article>`).join('');
  }

  function applyFilters() {
    let items = App.getUserItems(user.username).filter(item => {
      const q = searchInput.value.trim().toLowerCase();
      const matchSearch = !q || item.name.toLowerCase().includes(q) || (item.tags || []).some(tag => tag.toLowerCase().includes(q));
      const matchCategory = categoryFilter.value === 'all' || item.category === categoryFilter.value;
      const matchColor = colorFilter.value === 'all' || item.color === colorFilter.value;
      return matchSearch && matchCategory && matchColor;
    });
    if (sortFilter.value === 'name-asc') items.sort((a,b) => a.name.localeCompare(b.name));
    if (sortFilter.value === 'name-desc') items.sort((a,b) => b.name.localeCompare(a.name));
    if (sortFilter.value === 'recent') items.sort((a,b) => new Date(b.addedAt)-new Date(a.addedAt));
    render(items);
  }

  [searchInput, categoryFilter, colorFilter, sortFilter].forEach(el => el && el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', applyFilters));
  document.getElementById('clearFiltersBtn')?.addEventListener('click', () => { searchInput.value=''; categoryFilter.value='all'; colorFilter.value='all'; sortFilter.value='name-asc'; applyFilters(); });
  applyFilters();
})();
