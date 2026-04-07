
(function () {
  const App = window.FashionApp;
  const form = document.getElementById('loginForm');
  const message = document.getElementById('message');
  if (!form || !App) return;

  function nextTarget() {
    const next = new URLSearchParams(window.location.search).get('next');
    if (!next || next.includes('://') || next.includes('..') || next.includes('\\')) return null;
    return next;
  }

  function routeAfterLogin(user) {
    return user.role === 'admin' ? 'admin-dashboard.html' : 'dashboard.html';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const user = App.findUser(username);
    message.style.color = '#d64545';
    if (!user || user.password !== password) {
      message.textContent = 'Incorrect username or password.';
      return;
    }
    if (user.status === 'suspended') {
      message.textContent = 'Account suspended. Contact support.';
      return;
    }
    App.setSession(user);
    message.style.color = '#2a9d50';
    message.textContent = 'Login successful! Redirecting...';
    setTimeout(() => { window.location.href = nextTarget() || routeAfterLogin(user); }, 400);
  });

  const forgot = document.getElementById('forgotLink');
  if (forgot) forgot.onclick = (e) => { e.preventDefault(); message.style.color = '#555'; message.textContent = 'Use one of the demo passwords from your seeded account list, or register a new account.'; };
  const register = document.getElementById('registerLink');
  if (register) register.onclick = (e) => { e.preventDefault(); const next = nextTarget(); window.location.href = next ? `register.html?next=${encodeURIComponent(next)}` : 'register.html'; };
})();
