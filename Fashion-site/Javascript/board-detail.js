document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('posts-grid');

    const posts = [
        {
            id: 1,
            title: "Beach Vibes",
            caption: "Thinking about this for the trip to Miami.",
            items: ["👕", "🩳", "🕶️"], 
            likes: 24,
            date: "2h ago"
        },
        {
            id: 2,
            title: "Coffee Run",
            caption: "Simple and comfortable for Sunday morning.",
            items: ["🧥", "👖", "👟"],
            likes: 12,
            date: "1d ago"
        },
        {
            id: 3,
            title: "Office Casual",
            caption: "Trying to mix up the usual rotation.",
            // Only 2 items = will trigger the "Large" layout
            items: ["👔", "👖"], 
            likes: 8,
            date: "3d ago"
        }
    ];

    function renderPosts(data) {
        grid.innerHTML = '';
        
        data.forEach(post => {
            const card = document.createElement('div');
            card.classList.add('post-card');
            
            // GENERATE COLLAGE HTML
            const itemsHtml = post.items.map((icon, index) => {
                let extraClass = '';
                // Logic: If exactly 2 items, make them both tall
                if (post.items.length === 2) {
                    extraClass = 'large'; 
                } 
                // Logic: If 3 items, make the first one tall
                else if (post.items.length === 3 && index === 0) {
                    extraClass = 'large';
                }
                return `<div class="preview-item ${extraClass}">${icon}</div>`;
            }).join('');
            
            card.innerHTML = `
                <div class="card-preview">
                    ${itemsHtml}
                </div>
                <div class="post-content">
                    <div class="post-title">${post.title}</div>
                    <div class="post-caption">${post.caption}</div>
                    <div class="post-footer">
                        <span>❤️ ${post.likes}</span>
                        <span>${post.date}</span>
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
        });
    }

    renderPosts(posts);
});