
(function () {
  const App = window.FashionApp;
  if (!App) return;

  const currentPage = (window.location.pathname.split('/').pop() || 'home.html').toLowerCase();
  const user = App.getSession();

  const creatorOnly = new Set(['dashboard.html','wardrobe.html','add-item.html','item-detail.html','outfit-generator.html','outfit-detail.html','saved-outfits.html','create-board.html','board.html','profile.html']);
  const adminOnly = new Set(['admin-dashboard.html','admin-users.html','admin-moderation.html']);

  function redirectToLogin() {
    window.location.href = `login.html?next=${encodeURIComponent(currentPage)}`;
  }

  if (adminOnly.has(currentPage)) {
    if (!user) { redirectToLogin(); return; }
    if (user.role !== 'admin') { window.location.href = 'dashboard.html'; return; }
  }

  if (creatorOnly.has(currentPage)) {
    if (!user) { redirectToLogin(); return; }
    if (user.role === 'admin') {
      if (currentPage !== 'profile.html') { window.location.href = 'admin-dashboard.html'; return; }
    }
  }

  const nav = document.getElementById('topNav');
  const signLinks = document.querySelectorAll('.signin-link');
  const avatarBtn = document.querySelector('.avatar-btn');
  const avatarFallback = document.querySelector('.avatar-fallback');

  function setNav(links) {
    if (!nav) return;
    nav.innerHTML = links.map(link => `<a href="${link.href}" data-page="${link.href}">${link.label}</a>`).join('');
    nav.querySelectorAll('a').forEach(a => {
      if ((a.getAttribute('data-page') || '').toLowerCase() === currentPage) a.classList.add('active');
    });
  }

  if (!user) {
    setNav([
      { href: 'home.html', label: 'Home' },
      { href: 'feed.html', label: 'Feed' }
    ]);
    signLinks.forEach((link, idx) => {
      link.style.display = 'inline-flex';
      if (idx === 0) { link.textContent = 'Sign In'; link.href = 'login.html'; }
      else { link.textContent = 'Register'; link.href = 'register.html'; }
    });
    if (avatarBtn) avatarBtn.style.display = 'none';
    return;
  }

  if (user.role === 'admin') {
    setNav([
      { href: 'home.html', label: 'Home' },
      { href: 'feed.html', label: 'Feed' },
      { href: 'admin-dashboard.html', label: 'Admin Dashboard' },
      { href: 'admin-users.html', label: 'Users' },
      { href: 'admin-moderation.html', label: 'Moderation' }
    ]);
  } else {
    setNav([
      { href: 'home.html', label: 'Home' },
      { href: 'feed.html', label: 'Feed' },
      { href: 'dashboard.html', label: 'Dashboard' },
      { href: 'wardrobe.html', label: 'Wardrobe' },
      { href: 'saved-outfits.html', label: 'Saved Outfits' },
      { href: 'board.html', label: 'Boards' }
    ]);
  }

  signLinks.forEach(link => {
    link.style.display = 'inline-flex';
    link.textContent = 'Logout';
    link.href = '#';
    link.onclick = (e) => {
      e.preventDefault();
      App.clearSession();
      window.location.href = 'home.html';
    };
  });

  if (avatarBtn) {
    avatarBtn.style.display = 'grid';
    avatarBtn.href = 'profile.html';
    avatarBtn.title = `${user.displayName || user.username}`;
  }
  if (avatarFallback) avatarFallback.textContent = (user.displayName || user.username || 'U').slice(0, 1).toUpperCase();
})();
