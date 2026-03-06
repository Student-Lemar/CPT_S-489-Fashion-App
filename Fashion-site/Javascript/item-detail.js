(function () {
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get("id");

  const form = document.getElementById("itemForm");
  const deleteBtn = document.getElementById("deleteBtn");
  const statusMsg = document.getElementById("statusMsg");

  const nameInput = document.getElementById("itemName");
  const categoryInput = document.getElementById("itemCategory");
  const colorInput = document.getElementById("itemColor");
  const tagsInput = document.getElementById("itemTags");
  const notesInput = document.getElementById("itemNotes");

  const itemVisual = document.getElementById("itemVisual");
  const colorBadge = document.getElementById("colorBadge");
  const categoryBadge = document.getElementById("categoryBadge");

  function getItems() {
    return JSON.parse(localStorage.getItem("wardrobeItems") || "[]");
  }

  function saveItems(items) {
    localStorage.setItem("wardrobeItems", JSON.stringify(items));
  }

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

  const items = getItems();
  const item = items.find(entry => entry.id === itemId);

  if (!item) {
    statusMsg.textContent = "Item not found.";
    statusMsg.className = "status error";
    form.querySelectorAll("input, select, textarea, button").forEach(el => el.disabled = true);
  } else {
    nameInput.value = item.name || "";
    categoryInput.value = item.category || "tops";
    colorInput.value = item.color || "white";
    tagsInput.value = (item.tags || []).join(", ");
    notesInput.value = item.notes || "";
    itemVisual.textContent = item.icon || getIconForCategory(item.category);
    colorBadge.textContent = item.color || "color";
    categoryBadge.textContent = item.category || "category";
  }

  categoryInput.addEventListener("change", () => {
    itemVisual.textContent = getIconForCategory(categoryInput.value);
    categoryBadge.textContent = categoryInput.value;
  });

  colorInput.addEventListener("change", () => {
    colorBadge.textContent = colorInput.value;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!item) return;

    const updatedName = nameInput.value.trim();
    const updatedCategory = categoryInput.value;
    const updatedColor = colorInput.value;

    if (!updatedName || !updatedCategory || !updatedColor) {
      statusMsg.textContent = "Please complete the required fields before saving.";
      statusMsg.className = "status error";
      return;
    }

    item.name = updatedName;
    item.category = updatedCategory;
    item.color = updatedColor;
    item.icon = getIconForCategory(updatedCategory);
    item.tags = tagsInput.value.trim()
      ? tagsInput.value.split(",").map(tag => tag.trim()).filter(Boolean)
      : [];
    item.notes = notesInput.value.trim();

    saveItems(items);

    statusMsg.textContent = "Item updated successfully.";
    statusMsg.className = "status success";
  });

  deleteBtn.addEventListener("click", () => {
    if (!item) return;

    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    const filtered = items.filter(entry => entry.id !== item.id);
    saveItems(filtered);
    window.location.href = "wardrobe.html";
  });
})();