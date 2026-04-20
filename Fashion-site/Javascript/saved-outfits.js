<<<<<<< HEAD

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
=======
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('outfits-grid');

    // Fake Data: Outfits are collections of items
    const savedOutfits = [
        { 
            id: 1, 
            name: "Casual Friday", 
            date: "Mar 2, 2026", 
            items: ["👕", "👖", "👟"] // Emojis representing Top, Bottom, Shoes
        },
        { 
            id: 2, 
            name: "Date Night", 
            date: "Feb 28, 2026", 
            items: ["🧥", "👖", "👞"] 
        },
        { 
            id: 3, 
            name: "Gym Fit", 
            date: "Feb 25, 2026", 
            items: ["🎽", "🩳", "👟"] 
        },
        { 
            id: 4, 
            name: "Office Wear", 
            date: "Feb 20, 2026", 
            items: ["👔", "👖"] // Only 2 items
        },
    ];

    function renderOutfits(outfits) {
        grid.innerHTML = '';

        outfits.forEach(outfit => {
            const card = document.createElement('div');
            card.classList.add('outfit-card');

            const itemsHtml = outfit.items.map((icon, index) => {
                let extraClass = '';
                
                // Logic: If there are exactly 2 items, make BOTH of them tall (large)
                // This creates a nice 50/50 split instead of one big, one small, one empty.
                if (outfit.items.length === 2) {
                    extraClass = 'large'; 
                } 
                // Logic: If there are 3 items, keep the first one large (current behavior)
                else if (outfit.items.length === 3 && index === 0) {
                    extraClass = 'large';
                }

                return `<div class="preview-item ${extraClass}">${icon}</div>`;
            }).join('');

            card.innerHTML = `
                <div class="card-preview">
                    ${itemsHtml}
                </div>
                <div class="card-details">
                    <div class="outfit-name">${outfit.name}</div>
                    <div class="outfit-meta">
                        <span>${outfit.items.length} items</span>
                        <span>${outfit.date}</span>
                    </div>
                </div>
            `;

            // Click event (Future: Go to S-09 Outfit Detail)
            card.addEventListener('click', () => {
                console.log(`Opening outfit: ${outfit.name}`);
            });

            grid.appendChild(card);
        });
    }

    renderOutfits(savedOutfits);
});
>>>>>>> origin/main
