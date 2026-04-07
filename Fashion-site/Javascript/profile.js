
(function () {
  const App = window.FashionApp;
  const user = App?.getSession();
  if (!App || !user) return;
  const avatarInput = document.getElementById('avatarInput');
  const changePhotoBtn = document.getElementById('changePhotoBtn');
  const removePhotoBtn = document.getElementById('removePhotoBtn');
  const profileImg = document.getElementById('profileImg');
  const form = document.getElementById('profileForm');
  const resetBtn = document.getElementById('resetBtn');
  const statusMsg = document.getElementById('statusMsg');
  const fields = { displayName: document.getElementById('displayName'), username: document.getElementById('username'), email: document.getElementById('email'), bio: document.getElementById('bio') };
  const defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="%23333740"/><text x="50%" y="54%" font-size="72" text-anchor="middle" fill="%23ffffff" dominant-baseline="middle">👤</text></svg>';
  function setStatus(text) { statusMsg.textContent = text; }
  function refresh() {
    const profile = App.getProfile(user.username);
    fields.displayName.value = profile.displayName || user.displayName;
    fields.username.value = profile.username || user.username;
    fields.email.value = profile.email || `${user.username}@example.com`;
    fields.bio.value = profile.bio || '';
    profileImg.src = profile.avatarDataUrl || defaultAvatar;
    document.getElementById('statItems').textContent = App.getUserItems(user.username).length;
    document.getElementById('statOutfits').textContent = App.getUserOutfits(user.username).length;
    document.getElementById('statFollowers').textContent = App.getFollowerCount(user.username);
  }
  function persist(avatarDataUrl) {
    const oldUsername = user.username;
    const newUsername = fields.username.value.trim();
    if (!newUsername) return setStatus('Username is required.');
    const existing = App.findUser(newUsername);
    if (newUsername !== oldUsername && existing) return setStatus('That username is already taken.');
    App.updateProfile(oldUsername, { displayName: fields.displayName.value.trim(), username: newUsername, email: fields.email.value.trim(), bio: fields.bio.value.trim(), ...(avatarDataUrl !== undefined ? { avatarDataUrl } : {}) });
    if (newUsername !== oldUsername) {
      const users = App.getUsers().map(u => u.username === oldUsername ? { ...u, username: newUsername, displayName: fields.displayName.value.trim() } : u);
      App.saveUsers(users);
      App.saveItems(App.getItems().map(item => item.owner === oldUsername ? { ...item, owner: newUsername } : item));
      App.saveOutfits(App.getOutfits().map(outfit => outfit.owner === oldUsername ? { ...outfit, owner: newUsername } : outfit));
      App.saveBoards(App.getBoards().map(board => board.owner === oldUsername ? { ...board, owner: newUsername } : board));
      const follows = App.getFollows();
      if (follows[oldUsername]) { follows[newUsername] = follows[oldUsername]; delete follows[oldUsername]; }
      Object.keys(follows).forEach(key => { follows[key] = (follows[key] || []).map(name => name === oldUsername ? newUsername : name); });
      localStorage.setItem(App.KEYS.follows, JSON.stringify(follows));
    }
    const fresh = App.findUser(newUsername) || { ...user, username: newUsername, displayName: fields.displayName.value.trim() };
    App.setSession(fresh);
    setStatus('Changes saved.');
    refresh();
  }
  changePhotoBtn.onclick = () => avatarInput.click();
  avatarInput.onchange = () => { const file = avatarInput.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => { persist(r.result); refresh(); }; r.readAsDataURL(file); };
  removePhotoBtn.onclick = () => { persist(null); refresh(); };
  form.onsubmit = (e) => { e.preventDefault(); persist(); };
  resetBtn.onclick = () => { App.updateProfile(user.username, { displayName: user.displayName, username: user.username, email: `${user.username}@example.com`, bio: '', avatarDataUrl: null }); refresh(); setStatus('Reset complete.'); };
  refresh();
})();
