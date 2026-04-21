
(function () {
  const App = window.FashionApp;
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('id');
  const user = App?.getSession();
  const item = App?.getItem(itemId);
  if (!App || !user) return;
  const form = document.getElementById('itemForm');
  const deleteBtn = document.getElementById('deleteBtn');
  const statusMsg = document.getElementById('statusMsg');
  const nameInput = document.getElementById('itemName');
  const categoryInput = document.getElementById('itemCategory');
  const colorInput = document.getElementById('itemColor');
  const tagsInput = document.getElementById('itemTags');
  const notesInput = document.getElementById('itemNotes');
  const itemVisual = document.getElementById('itemVisual');
  const colorBadge = document.getElementById('colorBadge');
  const categoryBadge = document.getElementById('categoryBadge');

  if (!item || item.owner !== user.username) {
    statusMsg.textContent = 'Item not found.';
    statusMsg.className = 'status error';
    form.querySelectorAll('input,select,textarea,button').forEach(el => el.disabled = true);
    return;
  }

  function paint() {
    nameInput.value = item.name || '';
    categoryInput.value = item.category || 'tops';
    colorInput.value = item.color || 'white';
    tagsInput.value = (item.tags || []).join(', ');
    notesInput.value = item.notes || '';
    itemVisual.innerHTML = item.imageDataUrl ? `<img src="${item.imageDataUrl}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:18px;">` : (item.icon || App.getIconForCategory(item.category));
    colorBadge.textContent = item.color;
    categoryBadge.textContent = item.category;
  }
  paint();
  categoryInput.onchange = () => { itemVisual.textContent = App.getIconForCategory(categoryInput.value); categoryBadge.textContent = categoryInput.value; };
  colorInput.onchange = () => { colorBadge.textContent = colorInput.value; };
  form.onsubmit = (e) => {
    e.preventDefault();
    const updated = { ...item, name: nameInput.value.trim(), category: categoryInput.value, color: colorInput.value, tags: tagsInput.value.split(',').map(v=>v.trim()).filter(Boolean), notes: notesInput.value.trim(), icon: App.getIconForCategory(categoryInput.value) };
    if (!updated.name || !updated.category || !updated.color) { statusMsg.textContent = 'Please complete the required fields before saving.'; statusMsg.className = 'status error'; return; }
    App.upsertItem(updated);
    statusMsg.textContent = 'Item updated successfully.'; statusMsg.className = 'status success';
  };
  deleteBtn.onclick = () => {
    if (!confirm(`Delete ${item.name}?`)) return;
    App.deleteItem(item.id);
    window.location.href = 'wardrobe.html';
  };
})();
