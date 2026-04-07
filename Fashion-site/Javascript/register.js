
(function () {
  const App = window.FashionApp;
  const form = document.getElementById('registerForm');
  const message = document.getElementById('message');
  if (!form || !App) return;

  function nextTarget() {
    const next = new URLSearchParams(window.location.search).get('next');
    if (!next || next.includes('://') || next.includes('..') || next.includes('\\')) return null;
    return next;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const displayName = document.getElementById('displayName').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    message.style.color = '#d64545';
    if (!displayName || !username || !password || !confirmPassword) return message.textContent = 'Please fill out all fields.';
    if (username.length < 3) return message.textContent = 'Username must be at least 3 characters.';
    if (password.length < 6) return message.textContent = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return message.textContent = 'Passwords do not match.';
    if (['admin','administrator','root'].includes(username.toLowerCase())) return message.textContent = 'That username is reserved.';
    if (App.findUser(username)) return message.textContent = 'That username is already taken.';
    App.registerUser({ username, password, role: 'creator', displayName });
    message.style.color = '#2a9d50';
    message.textContent = 'Account created successfully! Please sign in.';
    const next = nextTarget();
    setTimeout(() => { window.location.href = next ? `login.html?next=${encodeURIComponent(next)}` : 'login.html'; }, 600);
  });
})();
