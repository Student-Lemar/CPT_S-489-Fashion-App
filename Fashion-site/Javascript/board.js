
(function () {
  const App = window.FashionApp; const user = App?.getSession(); if (!App || !user) return;
  const grid = document.getElementById('boardsGrid'); const search = document.getElementById('boardSearch');
  function render() {
    const q = search.value.trim().toLowerCase();
    const boards = App.getUserBoards(user.username).filter(board => !q || board.name.toLowerCase().includes(q) || (board.description || '').toLowerCase().includes(q));
    grid.innerHTML = boards.length ? boards.map(board => { const outfits = App.boardOutfits(board); const icons = outfits.flatMap(o => App.getOutfitIcons(o)).slice(0,3); return `<article class="board-card" data-id="${board.id}"><div class="board-top"><h2>${board.name}</h2><span class="badge ${board.visibility}">${board.visibility}</span></div><div class="meta">${board.description || 'No description yet.'}</div><div class="thumbs">${icons.map(icon=>`<span>${icon}</span>`).join('') || '<span>🧥</span><span>👖</span><span>👟</span>'}</div><div class="meta">${(board.outfitIds || []).length} outfit${(board.outfitIds || []).length === 1 ? '' : 's'} • ${App.formatDate(board.createdAt)}</div></article>`; }).join('') : '<div class="empty">No boards yet. Create your first one.</div>';
    grid.querySelectorAll('.board-card').forEach(card => card.onclick = () => window.location.href = `board-detail.html?id=${encodeURIComponent(card.dataset.id)}`);
  }
  search.addEventListener('input', render); render();
})();
