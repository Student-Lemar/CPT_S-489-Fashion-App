(function () {
  const form = document.getElementById("addItemForm");
  const imageInput = document.getElementById("itemImage");
  const preview = document.getElementById("uploadPreview");
  const resetBtn = document.getElementById("resetBtn");
  const statusMsg = document.getElementById("statusMsg");

  function getIconForCategory(category) {
    const icons = {
      tops: "👕",
      bottoms: "👖",
      shoes: "👟",
      outerwear: "🧥",
      accessories: "👜"
    };
    return icons[category] || "👕";
  }

  imageInput.addEventListener("change", () => {
    const file = imageInput.files && imageInput.files[0];
    if (!file) {
      preview.innerHTML = "👕";
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview of uploaded item" />`;
    };
    reader.readAsDataURL(file);
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    preview.innerHTML = "👕";
    statusMsg.textContent = "";
    statusMsg.className = "status";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("itemName").value.trim();
    const category = document.getElementById("itemCategory").value;
    const color = document.getElementById("itemColor").value;
    const tagsRaw = document.getElementById("itemTags").value.trim();
    const notes = document.getElementById("itemNotes").value.trim();

    if (!name || !category || !color) {
      statusMsg.textContent = "Please complete the required fields: item name, category, and dominant color.";
      statusMsg.className = "status error";
      return;
    }

    const items = JSON.parse(localStorage.getItem("wardrobeItems") || "[]");
    const newItem = {
      id: `w${Date.now()}`,
      name,
      category,
      color,
      icon: getIconForCategory(category),
      tags: tagsRaw ? tagsRaw.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      notes,
      addedAt: new Date().toISOString()
    };

    items.push(newItem);
    localStorage.setItem("wardrobeItems", JSON.stringify(items));

    statusMsg.textContent = "Item saved successfully. Redirecting to wardrobe...";
    statusMsg.className = "status success";

    setTimeout(() => {
      window.location.href = "wardrobe.html";
    }, 900);
  });
})();