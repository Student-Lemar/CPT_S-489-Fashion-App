(function () {
  const generateBtn = document.getElementById("generateBtn");
  const surpriseBtn = document.getElementById("surpriseBtn");
  const statusMsg = document.getElementById("statusMsg");

  const topSlot = document.getElementById("topSlot");
  const bottomSlot = document.getElementById("bottomSlot");
  const shoesSlot = document.getElementById("shoesSlot");

  const topLabel = document.getElementById("topLabel");
  const bottomLabel = document.getElementById("bottomLabel");
  const shoesLabel = document.getElementById("shoesLabel");

  const outfitTitle = document.getElementById("outfitTitle");
  const outfitReason = document.getElementById("outfitReason");

  function getItems() {
    return JSON.parse(localStorage.getItem("wardrobeItems") || "[]");
  }

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function generate(randomMode = false) {
    const items = getItems();
    const colorPreference = document.getElementById("colorPreference").value;
    const occasion = document.getElementById("occasionFilter").value;
    const stylePreference = document.getElementById("stylePreference").value;

    let tops = items.filter(item => item.category === "tops");
    let bottoms = items.filter(item => item.category === "bottoms");
    let shoes = items.filter(item => item.category === "shoes");

    if (colorPreference !== "any" && !randomMode) {
      const filterByColor = list => {
        const matches = list.filter(item => item.color === colorPreference);
        return matches.length ? matches : list;
      };

      tops = filterByColor(tops);
      bottoms = filterByColor(bottoms);
      shoes = filterByColor(shoes);
    }

    if (!tops.length || !bottoms.length || !shoes.length) {
      statusMsg.textContent = "Not enough wardrobe items to generate a complete outfit. Add at least a top, bottom, and shoes.";
      return;
    }

    const top = pickRandom(tops);
    const bottom = pickRandom(bottoms);
    const shoe = pickRandom(shoes);

    topSlot.textContent = top.icon || "👕";
    bottomSlot.textContent = bottom.icon || "👖";
    shoesSlot.textContent = shoe.icon || "👟";

    topLabel.textContent = top.name;
    bottomLabel.textContent = bottom.name;
    shoesLabel.textContent = shoe.name;

    outfitTitle.textContent = `${occasion.replace("-", " ")} outfit suggestion`;
    outfitReason.textContent = `This ${stylePreference} look combines ${top.name}, ${bottom.name}, and ${shoe.name}. It was selected from your wardrobe based on your current preferences.`;

    statusMsg.textContent = "Outfit generated successfully.";
  }

  generateBtn.addEventListener("click", () => generate(false));
  surpriseBtn.addEventListener("click", () => generate(true));
})();