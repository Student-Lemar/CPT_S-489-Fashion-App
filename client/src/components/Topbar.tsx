import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const initials = session
    ? (session.displayName || session.username).slice(0, 1).toUpperCase()
    : "";

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" to="/">
          <span className="brand-mark">489</span>
          <span>Fashion</span>
        </Link>

        <nav className="nav-center">
          {!session && (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/feed">Feed</NavLink>
            </>
          )}
          {session?.role === "admin" && (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/feed">Feed</NavLink>
              <NavLink to="/admin">Admin Dashboard</NavLink>
              <NavLink to="/admin/users">Users</NavLink>
              <NavLink to="/admin/moderation">Moderation</NavLink>
            </>
          )}
          {session?.role === "creator" && (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/feed">Feed</NavLink>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/wardrobe">Wardrobe</NavLink>
              <NavLink to="/saved-outfits">Saved Outfits</NavLink>
              <NavLink to="/boards">Boards</NavLink>
            </>
          )}
        </nav>

        <div className="nav-right">
          {session ? (
            <>
              <button
                className="signin-link"
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
              <Link
                className="avatar-btn"
                to="/profile"
                title={session.displayName}
              >
                <span className="avatar-fallback">{initials}</span>
              </Link>
            </>
          ) : (
            <>
              <Link className="signin-link" to="/login">
                Sign In
              </Link>
              <Link className="signin-link" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
