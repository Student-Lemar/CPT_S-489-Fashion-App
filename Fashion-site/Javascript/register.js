const form = document.getElementById("registerForm");
const message = document.getElementById("message");

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

function getNextParam() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  // basic safety: only allow simple local page names
  if (!next) return null;
  if (next.includes("://") || next.includes("\\") || next.includes("..")) return null;
  return next;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const displayName = document.getElementById("displayName").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Role is fixed: guest is not an account
  const role = "creator";

  message.textContent = "";
  message.style.color = "#d64545";

  if (!displayName || !username || !password || !confirmPassword) {
    message.textContent = "Please fill out all fields.";
    return;
  }

  if (username.length < 3) {
    message.textContent = "Username must be at least 3 characters.";
    return;
  }

  // Reserve certain usernames
  const reserved = ["admin", "administrator", "root"];
  if (reserved.includes(username.toLowerCase())) {
    message.textContent = "That username is reserved. Please choose another.";
    return;
  }

  if (password.length < 6) {
    message.textContent = "Password must be at least 6 characters.";
    return;
  }

  if (password !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    return;
  }

  const users = getUsers();
  const exists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    message.textContent = "That username is already taken.";
    return;
  }

  const newUser = { username, password, role, displayName };
  users.push(newUser);
  setUsers(users);

  message.style.color = "#2a9d50";
  message.textContent = "Account created successfully! Please sign in.";

  // After register, always send to login
  const next = getNextParam();
  const loginTarget = next ? `login.html?next=${encodeURIComponent(next)}` : "login.html";

  setTimeout(() => {
    window.location.href = loginTarget;
  }, 900);
});