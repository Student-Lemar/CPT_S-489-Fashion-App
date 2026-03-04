const avatarInput = document.getElementById("avatarInput");
const changePhotoBtn = document.getElementById("changePhotoBtn");
const removePhotoBtn = document.getElementById("removePhotoBtn");
const profileImg = document.getElementById("profileImg");

const form = document.getElementById("profileForm");
const resetBtn = document.getElementById("resetBtn");
const statusMsg = document.getElementById("statusMsg");

const defaultAvatarSrc = "../Images/profile-placeholder.png";

const fields = {
  displayName: document.getElementById("displayName"),
  username: document.getElementById("username"),
  email: document.getElementById("email"),
  bio: document.getElementById("bio"),
};

const STORAGE_KEY = "fashion_profile_v1";

function setStatus(text) {
  statusMsg.textContent = text || "";
}

function loadProfile() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // set demo default email
    fields.email.value = "you@example.com";
    profileImg.src = defaultAvatarSrc;
    return;
  }

  try {
    const data = JSON.parse(raw);

    fields.displayName.value = data.displayName || "";
    fields.username.value = data.username || "";
    fields.email.value = data.email || "you@example.com";
    fields.bio.value = data.bio || "";

    profileImg.src = data.avatarDataUrl || defaultAvatarSrc;

    // demo stats if present
    document.getElementById("statItems").textContent = data.stats?.items ?? 0;
    document.getElementById("statOutfits").textContent = data.stats?.outfits ?? 0;
    document.getElementById("statFollowers").textContent = data.stats?.followers ?? 0;
  } catch {
    // fallback if storage is corrupted
    fields.email.value = "you@example.com";
    profileImg.src = defaultAvatarSrc;
  }
}

function saveProfile(avatarDataUrl) {
  const current = localStorage.getItem(STORAGE_KEY);
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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

changePhotoBtn.addEventListener("click", () => avatarInput.click());

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files?.[0];
  if (!file) return;

  // Basic file type guard
  if (!file.type.startsWith("image/")) {
    setStatus("Please upload an image file.");
    return;
  }

  // Optional: size limit (2MB)
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

  saveProfile(); // keep current avatar
  setStatus("Changes saved.");
});

resetBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  fields.displayName.value = "";
  fields.username.value = "";
  fields.email.value = "you@example.com";
  fields.bio.value = "";
  profileImg.src = defaultAvatarSrc;

  document.getElementById("statItems").textContent = "0";
  document.getElementById("statOutfits").textContent = "0";
  document.getElementById("statFollowers").textContent = "0";

  setStatus("Reset complete.");
});

loadProfile();