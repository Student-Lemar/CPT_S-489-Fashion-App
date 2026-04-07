
(function () {
  const App = window.FashionApp;
  const user = App?.getSession();
  if (!user) return;
  const heading = document.querySelector('.dashboard-welcome h1');
  if (heading) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    heading.innerHTML = `${greeting}, <span class="highlight-text">${user.displayName || user.username}</span>!`;
  }
  const cards = document.querySelectorAll('.stat-card .stat-number');
  const items = App.getUserItems(user.username).length;
  const outfits = App.getUserOutfits(user.username).length;
  if (cards[0]) cards[0].textContent = items;
  if (cards[1]) cards[1].textContent = outfits;
  if (cards[2]) cards[2].textContent = user.role === 'creator' ? 'Creator' : user.role;
  document.querySelectorAll('a[href="upload.html"]').forEach(a => a.href = 'add-item.html');
  document.querySelectorAll('a[href="settings.html"]').forEach(a => { a.href = 'profile.html'; a.textContent = 'Update Profile →'; });
})();
