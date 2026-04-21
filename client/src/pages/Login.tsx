import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function safeNext(role: string) {
    if (next && !next.includes('://') && !next.includes('..') && !next.includes('\\')) return next;
    return role === 'admin' ? '/admin' : '/dashboard';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const session = await login(username.trim(), password);
      setIsError(false);
      setMessage('Login successful! Redirecting…');
      setTimeout(() => navigate(safeNext(session.role), { replace: true }), 400);
    } catch (err) {
      setIsError(true);
      if (err instanceof ApiError) {
        setMessage(err.message);
      } else {
        setMessage('Incorrect username or password.');
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
        <p className="login-tagline">Your smart wardrobe, styled by AI.</p>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h1>Sign in</h1>
          <p className="login-sub">Welcome back — pick up where you left off.</p>

          <form id="loginForm" onSubmit={handleSubmit} noValidate>
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
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {message && (
              <p
                className="status"
                style={{ color: isError ? '#d64545' : '#2a9d50' }}
                aria-live="polite"
              >
                {message}
              </p>
            )}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="login-links">
            <button
              className="text-btn"
              type="button"
              onClick={() =>
                setMessage('Use one of the demo passwords from your seeded account list, or register a new account.')
              }
            >
              Forgot password?
            </button>
            <Link to={next ? `/register?next=${encodeURIComponent(next)}` : '/register'}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
