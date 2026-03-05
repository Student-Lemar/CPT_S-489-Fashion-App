function getUser(){
  try { return JSON.parse(localStorage.getItem("currentUser")); }
  catch { return null; }
}

const demoPosts = [
  { id: 1, title: "Spring Neutrals", creator: "aden", caption: "Cream + olive + denim.", tags: ["spring","neutral"] },
  { id: 2, title: "Monochrome Night", creator: "jaeger", caption: "Black layers + boots.", tags: ["night","mono"] },
  { id: 3, title: "Campus Casual", creator: "abdur", caption: "Hoodie + cargos + sneakers.", tags: ["casual","campus"] },
  { id: 4, title: "Soft Pastels", creator: "lein", caption: "Lavender + white + gray.", tags: ["pastel","soft"] }
];

const grid = document.getElementById("feedGrid");
const search = document.getElementById("search");

function render(list){
  grid.innerHTML = list.map(p => `
    <a class="card" href="creator_profile.html?u=${encodeURIComponent(p.creator)}">
      <div class="thumb"></div>
      <div class="body">
        <div class="title">${p.title}</div>
        <div class="meta">by @${p.creator} • #${p.tags.join(" #")}</div>
        <div class="caption">${p.caption}</div>
      </div>
    </a>
  `).join("");
}

render(demoPosts);

search.addEventListener("input", () => {
  const q = search.value.trim().toLowerCase();
  if (!q) return render(demoPosts);
  const filtered = demoPosts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.creator.toLowerCase().includes(q) ||
    p.caption.toLowerCase().includes(q) ||
    p.tags.join(" ").toLowerCase().includes(q)
  );
  render(filtered);
});