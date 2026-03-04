export function getSession() {
  try {
    return JSON.parse(localStorage.getItem("currentUser"));
  } catch {
    return null;
  }
}

// If not logged in, send to login with a "next" param so we can return after login.
export function requireAuth() {
  const user = getSession();
  if (!user) {
    const next = encodeURIComponent(window.location.pathname.split("/").pop());
    window.location.href = `login.html?next=${next}`;
    return null;
  }
  return user;
}

export function isAdmin(user) {
  return user && user.role === "admin";
}

export function isCreator(user) {
  return user && user.role === "creator";
}