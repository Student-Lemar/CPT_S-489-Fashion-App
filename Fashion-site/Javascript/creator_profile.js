function getUser(){
  try { return JSON.parse(localStorage.getItem("currentUser")); }
  catch { return null; }
}

function getQueryUser(){
  const params = new URLSearchParams(window.location.search);
  return params.get("u") || "creator";
}

const profiles = {
  aden:   { name: "Aden", bio: "Color theory outfits daily." },
  jaeger: { name: "Jaeger", bio: "Minimal fits + streetwear." },
  abdur:  { name: "Abdur", bio: "Capsule wardrobe builder." },
  lein:   { name: "Lein", bio: "Seasonal mood boards." },
  creator:{ name: "Creator", bio: "Public creator profile." }
};

const demoPosts = {
  aden:   [{ title: "Spring Neutrals", caption: "Cream + olive + denim." }],
  jaeger: [{ title: "Monochrome Night", caption: "Black layers + boots." }],
  abdur:  [{ title: "Campus Casual", caption: "Hoodie + cargos + sneakers." }],
  lein:   [{ title: "Soft Pastels", caption: "Lavender + white + gray." }],
  creator:[{ title: "Outfit Post", caption: "A sample creator post." }]
};

const handle = getQueryUser().toLowerCase();
const profile = profiles[handle] || profiles.creator;

document.getElementById("name").textContent = profile.name;
document.getElementById("handle").textContent = `@${handle}`;
document.getElementById("bio").textContent = profile.bio;
document.getElementById("avatar").textContent = profile.name.slice(0,1).toUpperCase();

const postsEl = document.getElementById("posts");
const list = demoPosts[handle] || demoPosts.creator;

postsEl.innerHTML = list.map(p => `
  <div class="post">
    <div class="thumb"></div>
    <div class="pbody">
      <div class="ptitle">${p.title}</div>
      <div class="pcap">${p.caption}</div>
    </div>
  </div>
`).join("");

const followBtn = document.getElementById("followBtn");
const hint = document.getElementById("hint");

followBtn.addEventListener("click", () => {
  const user = getUser();

  // Guests must login to follow
  if (!user) {
    window.location.href = `login.html?next=${encodeURIComponent(`creator_profile.html?u=${handle}`)}`;
    return;
  }

  // Basic demo follow toggle
  const key = "follows_v1";
  const follows = JSON.parse(localStorage.getItem(key) || "[]");
  const already = follows.includes(handle);

  if (already) {
    localStorage.setItem(key, JSON.stringify(follows.filter(x => x !== handle)));
    followBtn.textContent = "Follow";
    hint.textContent = "Unfollowed (demo).";
  } else {
    localStorage.setItem(key, JSON.stringify([...follows, handle]));
    followBtn.textContent = "Following";
    hint.textContent = "Followed (demo).";
  }
});