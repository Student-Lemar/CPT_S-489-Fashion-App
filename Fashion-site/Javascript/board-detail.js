
(function () {
  const App = window.FashionApp;
  const user = App?.getSession();
  const grid = document.getElementById('posts-grid');
  if (!App || !grid) return;
  const id = new URLSearchParams(window.location.search).get('id') || (user ? App.getUserBoards(user.username)[0]?.id : null) || App.getPublicBoards()[0]?.id;
  const board = App.getBoard(id);
  if (!board) { grid.innerHTML = '<p>Board not found.</p>'; return; }
  document.querySelector('.board-meta .visibility-badge').textContent = board.visibility === 'public' ? '🌍 Public Board' : '🔒 Private Board';
  document.querySelector('.board-meta .visibility-badge').className = `visibility-badge ${board.visibility}`;
  document.querySelector('.date-badge').textContent = `Created ${App.formatDate(board.createdAt)}`;
  document.querySelector('.board-header h1').textContent = board.name;
  document.querySelector('.description').textContent = board.description || 'No description yet.';
  const profile = App.getProfile(board.owner);
  const creatorNode = document.querySelector('.creator-info div:last-child strong');
  if (creatorNode) creatorNode.textContent = profile.displayName || board.owner;
  const creatorSmall = document.querySelector('.creator-info .avatar-small');
  if (creatorSmall) creatorSmall.textContent = (profile.displayName || board.owner).slice(0,1).toUpperCase();
  const posts = App.boardOutfits(board);
  grid.innerHTML = posts.length ? posts.map(post => {
    const icons = App.getOutfitIcons(post);
    const itemsHtml = icons.map((icon, index) => `<div class="preview-item ${(icons.length===2 || (icons.length===3 && index===0)) ? 'large' : ''}">${icon}</div>`).join('');
    return `<div class="post-card"><div class="card-preview">${itemsHtml}</div><div class="post-content"><div class="post-title">${post.name}</div><div class="post-caption">${post.caption || ''}</div><div class="post-footer"><span>❤️ ${post.likes || 0}</span><span>${App.formatDate(post.createdAt)}</span></div></div></div>`;
  }).join('') : '<p>No outfits on this board yet.</p>';
  document.querySelector('.header-actions .btn.secondary')?.addEventListener('click', () => window.location.href = `create-board.html?edit=${encodeURIComponent(board.id)}`);
  document.querySelector('.header-actions .btn.primary-btn')?.addEventListener('click', () => window.location.href = 'saved-outfits.html');
})();
