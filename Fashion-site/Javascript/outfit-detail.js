document.addEventListener("DOMContentLoaded", () => {
  const statusMsg = document.getElementById("statusMsg");
  const outfitNameInput = document.getElementById("outfitName");
  const occasionInput = document.getElementById("occasion");
  const captionInput = document.getElementById("caption");

  const topIcon = document.getElementById("topIcon");
  const bottomIcon = document.getElementById("bottomIcon");
  const shoesIcon = document.getElementById("shoesIcon");

  const saveBtn = document.getElementById("saveBtn");
  const postBtn = document.getElementById("postBtn");

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      return null;
    }
  }

  function setStatus(text, ok = false) {
    statusMsg.textContent = text;
    statusMsg.style.color = ok ? "#2a9d50" : "#555";
  }

  // Protect this page without touching other files
  const user = getSession();
  if (!user) {
    window.location.href = "login.html?next=outfit-detail.html";
    return;
  }

  // Demo outfit data
  const outfit = {
    id: `outfit_${Date.now()}`,
    top: "👕",
    bottom: "👖",
    shoes: "👟"
  };

  topIcon.textContent = outfit.top;
  bottomIcon.textContent = outfit.bottom;
  shoesIcon.textContent = outfit.shoes;
  outfitNameInput.value = "Casual Friday";

  function getSavedOutfits() {
    try {
      return JSON.parse(localStorage.getItem("savedOutfits")) || [];
    } catch {
      return [];
    }
  }

  function setSavedOutfits(outfits) {
    localStorage.setItem("savedOutfits", JSON.stringify(outfits));
  }

  saveBtn.addEventListener("click", () => {
    const name = outfitNameInput.value.trim();
    const occasion = occasionInput.value;
    const caption = captionInput.value.trim();

    if (!name) {
      setStatus("Please enter an outfit name.");
      return;
    }

    const savedOutfits = getSavedOutfits();

    const newOutfit = {
      id: outfit.id,
      name,
      occasion,
      caption,
      items: [outfit.top, outfit.bottom, outfit.shoes],
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    };

    savedOutfits.push(newOutfit);
    setSavedOutfits(savedOutfits);

    setStatus("Outfit saved successfully.", true);
  });

  postBtn.addEventListener("click", () => {
    // Save first if not already saved during this session
    const name = outfitNameInput.value.trim() || "Untitled Outfit";
    const occasion = occasionInput.value;
    const caption = captionInput.value.trim();

    const savedOutfits = getSavedOutfits();

    const exists = savedOutfits.some(o => o.id === outfit.id);
    if (!exists) {
      savedOutfits.push({
        id: outfit.id,
        name,
        occasion,
        caption,
        items: [outfit.top, outfit.bottom, outfit.shoes],
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      });
      setSavedOutfits(savedOutfits);
    }

    // Send user to board creation page for now
    setStatus("Redirecting to board creation...", true);
    setTimeout(() => {
      window.location.href = "create-board.html";
    }, 500);
  });
});