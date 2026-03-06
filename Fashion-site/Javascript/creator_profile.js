function getUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser"));
  } catch {
    return null;
  }
}

function getQueryUser() {
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
document.getElementById("avatar").textContent = profile.name.slice(0, 1).toUpperCase();

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
const key = "follows_v1";

function getFollows() {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function setFollows(follows) {
  localStorage.setItem(key, JSON.stringify(follows));
}

function updateFollowUI() {
  const user = getUser();
  const follows = getFollows();
  const already = follows.includes(handle);

  if (already) {
    followBtn.textContent = "Following";
  } else {
    followBtn.textContent = "Follow";
  }

  // Cannot follow yourself
  if (user && user.username && user.username.toLowerCase() === handle) {
    followBtn.textContent = "Your Profile";
    followBtn.disabled = true;
    hint.textContent = "You cannot follow yourself.";
  }
}

updateFollowUI();

followBtn.addEventListener("click", () => {
  const user = getUser();

  // Guests must login to follow
  if (!user) {
    window.location.href = `login.html?next=${encodeURIComponent(`creator_profile.html?u=${handle}`)}`;
    return;
  }

  // Prevent following self
  if (user.username && user.username.toLowerCase() === handle) {
    hint.textContent = "You cannot follow yourself.";
    return;
  }

  const follows = getFollows();
  const already = follows.includes(handle);

  if (already) {
    setFollows(follows.filter(x => x !== handle));
    hint.textContent = "Unfollowed.";
  } else {
    setFollows([...follows, handle]);
    hint.textContent = "Followed.";
  }

  updateFollowUI();
});