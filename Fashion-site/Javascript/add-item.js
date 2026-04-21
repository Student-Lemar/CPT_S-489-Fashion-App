
(function () {
  const App = window.FashionApp;
  const form = document.getElementById('addItemForm');
  if (!form || !App) return;
  const imageInput = document.getElementById('itemImage');
  const preview = document.getElementById('uploadPreview');
  const resetBtn = document.getElementById('resetBtn');
  const statusMsg = document.getElementById('statusMsg');
  let imageDataUrl = null;
  const user = App.getSession();

  imageInput?.addEventListener('change', () => {
    const file = imageInput.files?.[0];
    if (!file) { preview.innerHTML = '👕'; imageDataUrl = null; return; }
    const reader = new FileReader();
    reader.onload = e => { imageDataUrl = e.target.result; preview.innerHTML = `<img src="${imageDataUrl}" alt="Preview of uploaded item" />`; };
    reader.readAsDataURL(file);
  });

  resetBtn?.addEventListener('click', () => { form.reset(); preview.innerHTML = '👕'; imageDataUrl = null; statusMsg.textContent = ''; statusMsg.className = 'status'; });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('itemName').value.trim();
    const category = document.getElementById('itemCategory').value;
    const color = document.getElementById('itemColor').value;
    const tags = document.getElementById('itemTags').value.split(',').map(v => v.trim()).filter(Boolean);
    const notes = document.getElementById('itemNotes').value.trim();
    if (!name || !category || !color) { statusMsg.textContent = 'Please complete the required fields: item name, category, and dominant color.'; statusMsg.className = 'status error'; return; }
    App.upsertItem({ id: App.uid('item'), owner: user.username, name, category, color, icon: App.getIconForCategory(category), tags, notes, imageDataUrl, addedAt: new Date().toISOString() });
    statusMsg.textContent = 'Item saved successfully. Redirecting to wardrobe...'; statusMsg.className = 'status success';
    setTimeout(() => window.location.href = 'wardrobe.html', 500);
  });
})();
