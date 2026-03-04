// ---------- Shared Navbar Script ----------
(function () {
  // Mobile menu toggle
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("topNav");

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
  }

  // Set active nav link based on current filename
  const current = (window.location.pathname.split("/").pop() || "").toLowerCase();

  document.querySelectorAll(".nav a[data-page]").forEach((a) => {
    const page = (a.getAttribute("data-page") || "").toLowerCase();
    if (page === current) a.classList.add("active");
  });
})();