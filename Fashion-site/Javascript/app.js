// ---------- Shared Navbar + Auth Gate ----------
(function () {
  // ===== Helpers =====
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      return null;
    }
  }

  function redirectToLogin(nextPage) {
    const next = encodeURIComponent(nextPage);
    window.location.href = `login.html?next=${next}`;
  }

  function isProtectedPage(pageName) {
    // Pages that require login (creator/admin)
    const protectedPages = new Set([
      "wardrobe.html",
      "board.html",
      "profile.html",
      "creator_dashboard.html",
      "upload.html",
      "post.html",
      "create_post.html",
      "create_board.html"
    ]);
    return protectedPages.has(pageName);
  }

  // ===== Mobile menu toggle =====
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("topNav");

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
  }

  // ===== Active nav link =====
  const current = (window.location.pathname.split("/").pop() || "").toLowerCase();

  document.querySelectorAll(".nav-center a[data-page]").forEach((a) => {
    const page = (a.getAttribute("data-page") || "").toLowerCase();
    if (page === current) a.classList.add("active");
  });

  // ===== Auth gating (guests redirected away from protected pages) =====
  const user = getSession();
  if (!user && isProtectedPage(current)) {
    redirectToLogin(current);
    return; // stop running rest
  }

  // ===== Intercept clicks to protected pages if guest =====
  document.querySelectorAll('a[href$=".html"]').forEach((a) => {
    const href = (a.getAttribute("href") || "").trim();
    if (!href) return;

    const page = href.split("?")[0].split("#")[0].toLowerCase();
    if (!page.endsWith(".html")) return;

    a.addEventListener("click", (e) => {
      if (!getSession() && isProtectedPage(page)) {
        e.preventDefault();
        redirectToLogin(page);
      }
    });
  });

  // ===== Navbar UX: hide profile avatar for guests, show logout for logged in =====
  const avatarBtn = document.querySelector(".avatar-btn");
  const signInLink = document.querySelector('.signin-link[href="login.html"]');

  if (!user) {
    // Guest: no profile
    if (avatarBtn) avatarBtn.style.display = "none";
  } else {
    // Logged in: show avatar if present
    if (avatarBtn) avatarBtn.style.display = "";

    // Turn "Sign In" into "Logout" (if your HTML has that link)
    if (signInLink) {
      signInLink.textContent = "Logout";
      signInLink.href = "#";
      signInLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        window.location.href = "home.html";
      });
    }
  }
})();