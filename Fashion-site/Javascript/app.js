// ---------- Shared Navbar + Auth Gate (Guest / Creator / Admin) ----------
(function () {
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      return null;
    }
  }

  const user = getUser();
  const current = (window.location.pathname.split("/").pop() || "").toLowerCase();

  // Pages that require login (Creator/Admin)
  const protectedPages = new Set([
    "dashboard.html",
    "wardrobe.html",
    "board.html",
    "profile.html" // Account Settings
  ]);

  // Redirect guests off protected pages
  if (!user && protectedPages.has(current)) {
    window.location.href = `login.html?next=${encodeURIComponent(current)}`;
    return;
  }

  // Update navbar links based on role (if nav exists)
  const nav = document.getElementById("topNav");
  const signin = document.querySelector(".signin-link");
  const avatar = document.querySelector(".avatar-btn");

  function setNav(html) {
    if (!nav) return;
    nav.innerHTML = html;

    // active link highlight
    const cur = current;
    nav.querySelectorAll("a[data-page]").forEach((a) => {
      const page = (a.getAttribute("data-page") || "").toLowerCase();
      if (page === cur) a.classList.add("active");
    });
  }

  // Guest navbar
  if (!user) {
    setNav(`
      <a href="home.html" data-page="home.html">Home</a>
      <a href="feed.html" data-page="feed.html">Feed</a>
    `);

    if (signin) {
      signin.style.display = "inline-flex";
      signin.textContent = "Sign In";
      signin.href = "login.html";
    }
    if (avatar) avatar.style.display = "none";
    return;
  }

  // Creator navbar
  if (user.role === "creator") {
    setNav(`
      <a href="home.html" data-page="home.html">Home</a>
      <a href="feed.html" data-page="feed.html">Feed</a>
      <a href="dashboard.html" data-page="dashboard.html">Dashboard</a>
      <a href="wardrobe.html" data-page="wardrobe.html">Wardrobe</a>
      <a href="board.html" data-page="board.html">Boards</a>
    `);

    if (signin) signin.style.display = "none";
    if (avatar) {
      avatar.style.display = "grid";
      avatar.href = "profile.html"; // Account Settings page (your profile.html)
      avatar.title = "Account Settings";
    }
    return;
  }

  // Admin navbar
  if (user.role === "admin") {
    setNav(`
      <a href="home.html" data-page="home.html">Home</a>
      <a href="dashboard.html" data-page="dashboard.html">Dashboard</a>
      <a href="admin.html" data-page="admin.html">Admin</a>
    `);

    if (signin) signin.style.display = "none";
    if (avatar) {
      avatar.style.display = "grid";
      avatar.href = "profile.html";
      avatar.title = "Account Settings";
    }
  }
})();