import React, { useEffect, useState } from 'react';
import './LoginPage.css';
import { apiUrl } from '../config';

/* The same mark the sidebar carries. The auth screens used to rebuild the
   logo out of five positioned divs whose styles lived in Sidebar.css, so the
   modal's branding depended on another component's stylesheet. */
export const BrandMark = () => (
  <span className="brand-mark" aria-hidden="true">
    <svg viewBox="0 0 44 44" fill="none">
      <path
        d="M4 33.5 L17 14 L24.5 24 L30 17 L40 33.5 Z"
        fill="url(#authSlope)"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle className="brand-node" cx="17" cy="12.5" r="2.6" fill="var(--accent-vivid)" />
      <path className="brand-wave" d="M12.6 9.4a6.2 6.2 0 0 1 8.8 0" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      <path className="brand-wave brand-wave-2" d="M9.9 6.2a10 10 0 0 1 14.2 0" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      <defs>
        <linearGradient id="authSlope" x1="22" y1="14" x2="22" y2="33.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.06" />
        </linearGradient>
      </defs>
    </svg>
  </span>
);

const LoginPage = ({ onLoginSuccess, onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /* Escape closes the modal — expected of any overlay, and the only way to
     dismiss it without hunting for the × button. */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let success = false;
    let userProfile = null;
    let apiError = '';

    try {
      const response = await fetch(apiUrl('/api/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        success = true;
        userProfile = data.user;
      } else {
        apiError = data.error || 'Invalid email or password.';
      }
    } catch (err) {
      console.error('Error during login:', err);
      apiError = 'Cannot connect to authentication service. Please make sure the server is running.';
    } finally {
      setIsLoading(false);
    }

    if (success && userProfile) {
      localStorage.setItem('loggedInUser', JSON.stringify(userProfile));
      onLoginSuccess();
    } else if (apiError) {
      setError(apiError);
    }
  };

  return (
    <div
      className="login-page-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="login-page-container" role="dialog" aria-modal="true" aria-labelledby="login-heading">
        <button className="close-button" onClick={onClose} aria-label="Close">&times;</button>

        <div className="header">
          <BrandMark />
          <div className="app-brand">
            <h1 id="login-heading">MineSafe</h1>
            <p>AI &amp; Geo-Data Platform</p>
          </div>
        </div>

        <p className="auth-intro">Sign in to reach live telemetry and the prediction console.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <span className="field-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <path d="m3.5 7 8.5 6 8.5-6" />
                </svg>
              </span>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <span className="field-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
                  <path d="M8 10.5V7.8a4 4 0 1 1 8 0v2.7" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="reveal-button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.7a2 2 0 0 0 2.8 2.8" />
                    <path d="M7.2 7.4A10.5 10.5 0 0 0 2.5 12s3.5 6 9.5 6a9.9 9.9 0 0 0 4.5-1.1" />
                    <path d="M19.4 15.2A11.6 11.6 0 0 0 21.5 12S18 6 12 6a9 9 0 0 0-1.7.2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                    <circle cx="12" cy="12" r="2.6" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="options-row">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <button type="button" className="forgot-password">Forgot Password?</button>
          </div>

          {error && (
            <p className="error-message" role="alert">
              <span className="error-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7.5v5.5M12 16.5h.01" />
                </svg>
              </span>
              {error}
            </p>
          )}

          <button type="submit" className="login-submit-button" disabled={isLoading}>
            {isLoading && <span className="button-spinner" aria-hidden="true" />}
            {isLoading ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <p className="signup-text">
          Don&apos;t have an account?{' '}
          <button type="button" className="signup-link" onClick={onSwitchToSignup ?? onClose}>Sign up</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
