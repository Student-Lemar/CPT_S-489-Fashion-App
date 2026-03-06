const avatarInput = document.getElementById("avatarInput");
const changePhotoBtn = document.getElementById("changePhotoBtn");
const removePhotoBtn = document.getElementById("removePhotoBtn");
const profileImg = document.getElementById("profileImg");

const form = document.getElementById("profileForm");
const resetBtn = document.getElementById("resetBtn");
const statusMsg = document.getElementById("statusMsg");

const defaultAvatarSrc =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="%23333740"/><text x="50%" y="54%" font-size="72" text-anchor="middle" fill="%23ffffff" dominant-baseline="middle">👤</text></svg>';

const fields = {
  displayName: document.getElementById("displayName"),
  username: document.getElementById("username"),
  email: document.getElementById("email"),
  bio: document.getElementById("bio"),
};

function getSession() {
  try {
    return JSON.parse(localStorage.getItem("currentUser"));
  } catch {
    return null;
  }
}

function getStorageKey() {
  const user = getSession();
  return user ? `fashion_profile_v1_${user.username}` : "fashion_profile_v1_guest";
}

function setStatus(text) {
  statusMsg.textContent = text || "";
}

function loadProfile() {
  const user = getSession();
  const raw = localStorage.getItem(getStorageKey());

  if (!raw) {
    fields.displayName.value = user?.displayName || "";
    fields.username.value = user?.username || "";
    fields.email.value = "you@example.com";
    fields.bio.value = "";
    profileImg.src = defaultAvatarSrc;
    return;
  }

  try {
    const data = JSON.parse(raw);

    fields.displayName.value = data.displayName || user?.displayName || "";
    fields.username.value = data.username || user?.username || "";
    fields.email.value = data.email || "you@example.com";
    fields.bio.value = data.bio || "";

    profileImg.src = data.avatarDataUrl || defaultAvatarSrc;

    document.getElementById("statItems").textContent = data.stats?.items ?? 0;
    document.getElementById("statOutfits").textContent = data.stats?.outfits ?? 0;
    document.getElementById("statFollowers").textContent = data.stats?.followers ?? 0;
  } catch {
    fields.displayName.value = user?.displayName || "";
    fields.username.value = user?.username || "";
    fields.email.value = "you@example.com";
    fields.bio.value = "";
    profileImg.src = defaultAvatarSrc;
  }
}

function saveProfile(avatarDataUrl) {
  const current = localStorage.getItem(getStorageKey());
  const prev = current ? JSON.parse(current) : {};

  const data = {
    ...prev,
    displayName: fields.displayName.value.trim(),
    username: fields.username.value.trim(),
    email: fields.email.value || "you@example.com",
    bio: fields.bio.value.trim(),
    avatarDataUrl: avatarDataUrl ?? prev.avatarDataUrl ?? null,
    stats: prev.stats || { items: 0, outfits: 0, followers: 0 },
  };

  localStorage.setItem(getStorageKey(), JSON.stringify(data));

  // keep currentUser display name updated too
  const user = getSession();
  if (user) {
    user.displayName = data.displayName || user.displayName;
    user.username = data.username || user.username;
    localStorage.setItem("currentUser", JSON.stringify(user));
  }
}

changePhotoBtn.addEventListener("click", () => avatarInput.click());

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setStatus("Please upload an image file.");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    setStatus("Image too large. Please upload a file under 2MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    profileImg.src = dataUrl;
    saveProfile(dataUrl);
    setStatus("Profile photo updated.");
  };
  reader.readAsDataURL(file);
});

removePhotoBtn.addEventListener("click", () => {
  profileImg.src = defaultAvatarSrc;
  saveProfile(null);
  setStatus("Profile photo removed.");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!fields.username.value.trim()) {
    setStatus("Username is required.");
    return;
  }

  saveProfile();
  setStatus("Changes saved.");
});

resetBtn.addEventListener("click", () => {
  localStorage.removeItem(getStorageKey());

  const user = getSession();
  fields.displayName.value = user?.displayName || "";
  fields.username.value = user?.username || "";
  fields.email.value = "you@example.com";
  fields.bio.value = "";
  profileImg.src = defaultAvatarSrc;

  document.getElementById("statItems").textContent = "0";
  document.getElementById("statOutfits").textContent = "0";
  document.getElementById("statFollowers").textContent = "0";

  setStatus("Reset complete.");
});

loadProfile();