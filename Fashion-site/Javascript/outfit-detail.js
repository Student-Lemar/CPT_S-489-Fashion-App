
(function () {
  const App = window.FashionApp;
  const user = App?.getSession();
  if (!App || !user) return;
  const statusMsg = document.getElementById('statusMsg');
  const outfitNameInput = document.getElementById('outfitName');
  const occasionInput = document.getElementById('occasion');
  const captionInput = document.getElementById('caption');
  const saveBtn = document.getElementById('saveBtn');
  const postBtn = document.getElementById('postBtn');
  const params = new URLSearchParams(window.location.search);
  const existing = App.getOutfit(params.get('id'));
  const draft = sessionStorage.getItem('fashion_generated_outfit_v1');
  let working = existing || (draft ? JSON.parse(draft) : null) || { owner: user.username, name: 'New Outfit', occasion: 'Everyday', caption: '', items: App.getUserItems(user.username).slice(0,3).map(item => item.id), createdAt: new Date().toISOString(), posted: false, boardIds: [], likes: 0 };
  if (!working.id) working.id = App.uid('outfit');

  function setStatus(text, ok) { statusMsg.textContent = text; statusMsg.style.color = ok ? '#2a9d50' : '#555'; }
  function paintIcons() {
    const icons = App.getOutfitIcons(working);
    document.getElementById('topIcon').textContent = icons[0] || '👕';
    document.getElementById('bottomIcon').textContent = icons[1] || '👖';
    document.getElementById('shoesIcon').textContent = icons[2] || '👟';
  }
  paintIcons();
  outfitNameInput.value = working.name || '';
  occasionInput.value = working.occasion || 'Everyday';
  captionInput.value = working.caption || '';

  function persist(posted) {
    working = { ...working, name: outfitNameInput.value.trim() || 'Untitled Outfit', occasion: occasionInput.value, caption: captionInput.value.trim(), posted: posted ?? working.posted, owner: user.username, createdAt: working.createdAt || new Date().toISOString() };
    App.upsertOutfit(working);
    sessionStorage.removeItem('fashion_generated_outfit_v1');
    return working;
  }

  saveBtn.onclick = () => { persist(false); setStatus('Outfit saved successfully.', true); };
  postBtn.onclick = () => {
    const saved = persist(true);
    const boards = App.getUserBoards(user.username);
    if (boards.length) {
      const board = boards[0];
      if (!(board.outfitIds || []).includes(saved.id)) { board.outfitIds = [...(board.outfitIds || []), saved.id]; App.upsertBoard(board); }
      setStatus(`Outfit posted to ${board.name}.`, true);
      setTimeout(() => { window.location.href = `board-detail.html?id=${encodeURIComponent(board.id)}`; }, 450);
    } else {
      setStatus('Outfit saved. Create a board to post it publicly or privately.', true);
      setTimeout(() => { window.location.href = `create-board.html?outfitId=${encodeURIComponent(saved.id)}`; }, 450);
    }
  };
})();
