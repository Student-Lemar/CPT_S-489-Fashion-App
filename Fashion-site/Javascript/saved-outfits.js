document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('outfits-grid');

    // Fake Data: Outfits are collections of items
    const savedOutfits = [
        { 
            id: 1, 
            name: "Casual Friday", 
            date: "Mar 2, 2026", 
            items: ["👕", "👖", "👟"] // Emojis representing Top, Bottom, Shoes
        },
        { 
            id: 2, 
            name: "Date Night", 
            date: "Feb 28, 2026", 
            items: ["🧥", "👖", "👞"] 
        },
        { 
            id: 3, 
            name: "Gym Fit", 
            date: "Feb 25, 2026", 
            items: ["🎽", "🩳", "👟"] 
        },
        { 
            id: 4, 
            name: "Office Wear", 
            date: "Feb 20, 2026", 
            items: ["👔", "👖"] // Only 2 items
        },
    ];

    function renderOutfits(outfits) {
        grid.innerHTML = '';

        outfits.forEach(outfit => {
            const card = document.createElement('div');
            card.classList.add('outfit-card');

            const itemsHtml = outfit.items.map((icon, index) => {
                let extraClass = '';
                
                // Logic: If there are exactly 2 items, make BOTH of them tall (large)
                // This creates a nice 50/50 split instead of one big, one small, one empty.
                if (outfit.items.length === 2) {
                    extraClass = 'large'; 
                } 
                // Logic: If there are 3 items, keep the first one large (current behavior)
                else if (outfit.items.length === 3 && index === 0) {
                    extraClass = 'large';
                }

                return `<div class="preview-item ${extraClass}">${icon}</div>`;
            }).join('');

            card.innerHTML = `
                <div class="card-preview">
                    ${itemsHtml}
                </div>
                <div class="card-details">
                    <div class="outfit-name">${outfit.name}</div>
                    <div class="outfit-meta">
                        <span>${outfit.items.length} items</span>
                        <span>${outfit.date}</span>
                    </div>
                </div>
            `;

            // Click event (Future: Go to S-09 Outfit Detail)
            card.addEventListener('click', () => {
                console.log(`Opening outfit: ${outfit.name}`);
            });

            grid.appendChild(card);
        });
    }

    renderOutfits(savedOutfits);
});