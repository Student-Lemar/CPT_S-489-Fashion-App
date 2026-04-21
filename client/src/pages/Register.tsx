import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  function validate(): string | null {
    if (!displayName || !username || !password || !confirm)
      return "Please fill out all fields.";
    if (username.length < 3) return "Username must be at least 3 characters.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    if (["admin", "administrator", "root"].includes(username.toLowerCase()))
      return "That username is reserved.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setIsError(true);
      setMessage(err);
      return;
    }

    setSubmitting(true);
    try {
      await register(username.trim(), password, displayName.trim());
      setIsError(false);
      setMessage("Account created! Redirecting to login…");
      const dest = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
      setTimeout(() => navigate(dest, { replace: true }), 600);
    } catch (apiErr) {
      setIsError(true);
      if (apiErr instanceof ApiError) {
        setMessage(apiErr.message);
      } else {
        setMessage("Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="login-brand">
          <span className="brand-mark">489</span> Fashion
        </div>
        <p className="login-tagline">Join thousands of style creators.</p>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h1>Create account</h1>
          <p className="login-sub">Start building your smart wardrobe today.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="displayName">Display name</label>
              <input
                id="displayName"
                type="text"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {message && (
              <p
                className="status"
                style={{ color: isError ? "#d64545" : "#2a9d50" }}
                aria-live="polite"
              >
                {message}
              </p>
            )}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting}
              style={{ width: "100%", marginTop: "8px" }}
            >
              {submitting ? "Creating…" : "Create Account"}
            </button>
          </form>

          <div className="login-links">
            <Link
              to={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
