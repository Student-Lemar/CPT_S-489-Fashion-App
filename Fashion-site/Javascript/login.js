// ===== Simple localStorage auth (demo) =====
// Stores:
// - users: array of { username, password, role, displayName }
// - currentUser: { username, role, displayName }

const form = document.getElementById("loginForm");
const message = document.getElementById("message");

const forgotLink = document.getElementById("forgotLink");
const registerLink = document.getElementById("registerLink");

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("users")) || [];
  } catch {
    return [];
  }
}

function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function seedUsersIfEmpty() {
  const users = getUsers();
  if (users.length > 0) return;

  // Guest is NOT an account. Only Creator/Admin are real logins.
  const seeded = [
    { username: "creator", password: "pass123", role: "creator", displayName: "Creator User" },
    { username: "admin",   password: "admin123", role: "admin",   displayName: "Admin" }
  ];

  setUsers(seeded);
}

function setSession(user) {
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      username: user.username,
      role: user.role,
      displayName: user.displayName || user.username
    })
  );
}

// ✅ Everyone goes to dashboard after login (for now)
function routeAfterLogin() {
  return "dashboard.html";
}

function getNextParam() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");

  // basic safety: block weird full URLs, only allow simple page names
  if (!next) return null;
  if (next.includes("://") || next.includes("\\") || next.includes("..")) return null;

  return next;
}

seedUsersIfEmpty();

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  message.textContent = "";
  message.style.color = "#d64545";

  if (!username || !password) {
    message.textContent = "Please enter your username and password.";
    return;
  }

  const users = getUsers();
  const match = users.find((u) => u.username.toLowerCase() === username.toLowerCase());

  if (!match) {
    message.textContent = "Account not found. Please register.";
    return;
  }

  if (match.password !== password) {
    message.textContent = "Incorrect password. Please try again.";
    return;
  }

  setSession(match);

  message.style.color = "#2a9d50";
  message.textContent = "Login successful! Redirecting...";

  // If user was forced here from a protected page, return them there
  const next = getNextParam();
  const target = next || routeAfterLogin();

  setTimeout(() => {
    window.location.href = target;
  }, 500);
});

forgotLink.addEventListener("click", function (e) {
  e.preventDefault();
  message.style.color = "#555";
  message.textContent = "Forgot password page coming soon.";
});

registerLink.addEventListener("click", function (e) {
  e.preventDefault();
  // Pass "next" through so register returns user to the intended page too
  const next = getNextParam();
  window.location.href = next ? `register.html?next=${encodeURIComponent(next)}` : "register.html";
});