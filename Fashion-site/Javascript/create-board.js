
(function () {
  const App = window.FashionApp;
  const user = App?.getSession();
  if (!App || !user) return;
  const form = document.getElementById('create-board-form');
  const radioCards = document.querySelectorAll('.radio-card');
  const outfitId = new URLSearchParams(window.location.search).get('outfitId');
  radioCards.forEach(card => {
    const input = card.querySelector('input[type="radio"]');
    if (!input || input.disabled) return;
    card.onclick = () => { radioCards.forEach(c => c.classList.remove('selected')); card.classList.add('selected'); input.checked = true; };
  });
  form.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('board-name').value.trim();
    const description = document.getElementById('board-desc').value.trim();
    const visibility = document.querySelector('input[name="visibility"]:checked').value;
    if (!name) return;
    const board = { id: App.uid('board'), owner: user.username, name, description, visibility, outfitIds: outfitId ? [outfitId] : [], createdAt: new Date().toISOString() };
    App.upsertBoard(board);
    if (outfitId) {
      const outfit = App.getOutfit(outfitId); if (outfit) { outfit.boardIds = [...new Set([...(outfit.boardIds||[]), board.id])]; if (visibility === 'public') outfit.posted = true; App.upsertOutfit(outfit); }
    }
    window.location.href = `board-detail.html?id=${encodeURIComponent(board.id)}`;
  };
})();
