(function () {
  const defaultItems = [
    {
      id: "w1",
      name: "White Tee",
      category: "tops",
      color: "white",
      icon: "👕",
      tags: ["basic", "casual", "layering"],
      addedAt: "2026-03-01"
    },
    {
      id: "w2",
      name: "Black Jeans",
      category: "bottoms",
      color: "black",
      icon: "👖",
      tags: ["denim", "night", "streetwear"],
      addedAt: "2026-03-02"
    },
    {
      id: "w3",
      name: "Gray Hoodie",
      category: "outerwear",
      color: "gray",
      icon: "🧥",
      tags: ["cozy", "casual"],
      addedAt: "2026-03-04"
    },
    {
      id: "w4",
      name: "White Sneakers",
      category: "shoes",
      color: "white",
      icon: "👟",
      tags: ["clean", "daily"],
      addedAt: "2026-03-03"
    },
    {
      id: "w5",
      name: "Olive Cargo Pants",
      category: "bottoms",
      color: "green",
      icon: "👖",
      tags: ["utility", "streetwear"],
      addedAt: "2026-03-05"
    },
    {
      id: "w6",
      name: "Brown Tote Bag",
      category: "accessories",
      color: "brown",
      icon: "👜",
      tags: ["minimal", "campus"],
      addedAt: "2026-03-06"
    }
  ];

  function loadItems() {
    const stored = localStorage.getItem("wardrobeItems");
    if (!stored) {
      localStorage.setItem("wardrobeItems", JSON.stringify(defaultItems));
      return defaultItems;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return defaultItems;
    }
  }

  function render(items) {
    const grid = document.getElementById("wardrobeGrid");
    const emptyState = document.getElementById("emptyState");
    const resultsText = document.getElementById("resultsText");

    resultsText.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;

    if (!items.length) {
      grid.innerHTML = "";
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");

    grid.innerHTML = items.map(item => `
      <article class="item-card card">
        <div class="item-thumb">${item.icon}</div>
        <div class="item-body">
          <div class="item-top">
            <div>
              <h2 class="item-name">${item.name}</h2>
              <div class="item-category">${item.category}</div>
            </div>
            <span class="color-badge">${item.color}</span>
          </div>

          <div class="item-tags">
            ${(item.tags || []).map(tag => `<span class="item-tag">${tag}</span>`).join("")}
          </div>

          <div class="item-actions">
            <a class="action-link" href="item-detail.html?id=${encodeURIComponent(item.id)}">View</a>
            <a class="action-link" href="item-detail.html?id=${encodeURIComponent(item.id)}&mode=edit">Edit</a>
          </div>
        </div>
      </article>
    `).join("");
  }

  function applyFilters() {
    const search = document.getElementById("searchInput").value.trim().toLowerCase();
    const category = document.getElementById("categoryFilter").value;
    const color = document.getElementById("colorFilter").value;
    const sort = document.getElementById("sortFilter").value;

    let items = loadItems().filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(search) ||
        (item.tags || []).some(tag => tag.toLowerCase().includes(search));

      const matchesCategory = category === "all" || item.category === category;
      const matchesColor = color === "all" || item.color === color;

      return matchesSearch && matchesCategory && matchesColor;
    });

    if (sort === "name-asc") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "name-desc") {
      items.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === "recent") {
      items.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    }

    render(items);
  }

  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("categoryFilter").addEventListener("change", applyFilters);
  document.getElementById("colorFilter").addEventListener("change", applyFilters);
  document.getElementById("sortFilter").addEventListener("change", applyFilters);

  document.getElementById("clearFiltersBtn").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("categoryFilter").value = "all";
    document.getElementById("colorFilter").value = "all";
    document.getElementById("sortFilter").value = "name-asc";
    applyFilters();
  });

  applyFilters();
})();