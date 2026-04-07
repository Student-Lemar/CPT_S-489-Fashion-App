
(function () {
  const App = window.FashionApp;
  const grid = document.getElementById('feedGrid');
  const search = document.getElementById('search');
  if (!grid || !App) return;
  function render(posts) {
    grid.innerHTML = posts.map(p => `<a class="card" href="creator_profile.html?u=${encodeURIComponent(p.creator)}"><div class="thumb">${p.items?.map(icon=>`<span style="font-size:28px">${icon}</span>`).join(' ') || ''}</div><div class="body"><div class="title">${p.title}</div><div class="meta">by @${p.creator} • #${p.tags.join(' #')}</div><div class="caption">${p.caption}</div></div></a>`).join('') || '<p>No public posts yet.</p>';
  }
  function apply() {
    const q = search.value.trim().toLowerCase();
    const posts = App.getFeedPosts().filter(p => !q || p.title.toLowerCase().includes(q) || p.creator.toLowerCase().includes(q) || p.caption.toLowerCase().includes(q) || p.tags.join(' ').toLowerCase().includes(q));
    render(posts);
  }
  search?.addEventListener('input', apply); apply();
})();
