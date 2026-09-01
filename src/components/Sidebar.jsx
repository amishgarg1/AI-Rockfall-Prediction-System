import React from 'react';
import './Sidebar.css';
import { Link, useLocation } from 'react-router-dom';
import { initialAlerts } from '../data/alerts';

/* Icons are inline SVG rather than glyphs. The previous emoji icons rendered
   in whatever the OS emoji font decided — different colour, weight and
   baseline on every machine — which is exactly what a control-room UI cannot
   afford. These inherit currentColor and sit on the text baseline. */
const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7.5" height="8" rx="1.6" />
      <rect x="13.5" y="3" width="7.5" height="5" rx="1.6" />
      <rect x="3" y="14" width="7.5" height="7" rx="1.6" />
      <rect x="13.5" y="11" width="7.5" height="10" rx="1.6" />
    </svg>
  ),
  sensors: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2.2" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 16.2a6 6 0 0 0 0-8.4" />
      <path d="M4.9 4.9a10 10 0 0 0 0 14.2M19.1 19.1a10 10 0 0 0 0-14.2" />
    </svg>
  ),
  alerts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.2 7.5-2.2 7.5h16.4S18 14.5 18 8.5Z" />
      <path d="M13.7 20a2 2 0 0 1-3.4 0" />
    </svg>
  ),
  prediction: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 16.5l5-5.5 3.6 3.4L21 5" />
      <path d="M15.5 5H21v5.5" />
      <path d="M3 21h18" strokeOpacity="0.45" />
    </svg>
  ),
};

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', hint: 'Telemetry overview' },
  { to: '/sensoring', label: 'Sensors', icon: 'sensors', hint: 'Live sensor array' },
  { to: '/alerts', label: 'Alerts', icon: 'alerts', hint: 'Incident control' },
  { to: '/prediction', label: 'Prediction', icon: 'prediction', hint: 'Inference & simulation', authOnly: true },
];

const Sidebar = ({ isSidebarOpen, toggleSidebar, isLoggedIn }) => {
  const { pathname } = useLocation();

  /* Count the alerts still open. Real number off the same dataset the alerts
     page renders, so the badge cannot drift from the list. */
  const activeAlertCount = initialAlerts.filter((alert) => alert.status === 'active').length;

  /* "/" has to match exactly or it would light up on every route. */
  const isActive = (to) =>
    to === '/' ? pathname === '/' : pathname.toLowerCase().startsWith(to.toLowerCase());

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <Link to="/" className="logo-container" aria-label="MineSafe home">
          <span className="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 44 44" fill="none">
              {/* The slope profile — the thing actually being monitored. */}
              <path
                className="logo-slope"
                d="M4 33.5 L17 14 L24.5 24 L30 17 L40 33.5 Z"
                fill="url(#msSlope)"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              {/* Sensor node on the crest, with its transmission arcs. */}
              <circle className="logo-node" cx="17" cy="12.5" r="2.6" fill="var(--accent-vivid)" />
              <path className="logo-wave logo-wave-1" d="M12.6 9.4a6.2 6.2 0 0 1 8.8 0" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
              <path className="logo-wave logo-wave-2" d="M9.9 6.2a10 10 0 0 1 14.2 0" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
              <defs>
                <linearGradient id="msSlope" x1="22" y1="14" x2="22" y2="33.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0.06" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="logo-text-group">
            <span className="logo-text">MineSafe</span>
            <span className="logo-subtitle">AI &amp; Geo-Data Platform</span>
          </span>
        </Link>
      </div>

      <button
        type="button"
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-expanded={isSidebarOpen}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 6.5 9 12l5.5 5.5" />
        </svg>
      </button>

      <nav className="navigation" aria-label="Main">
        <p className="nav-section-label">Monitoring</p>
        <ul>
          {navItems.map((item) => {
            if (item.authOnly && !isLoggedIn) return null;
            const active = isActive(item.to);
            const showBadge = item.to === '/alerts' && activeAlertCount > 0;

            return (
              <li key={item.to} className={`nav-item ${active ? 'active' : ''}`}>
                <Link
                  to={item.to}
                  className="nav-link"
                  aria-current={active ? 'page' : undefined}
                  data-tooltip={item.label}
                >
                  <span className="nav-rail" aria-hidden="true" />
                  <span className="icon">{icons[item.icon]}</span>
                  <span className="nav-copy">
                    <span className="text">{item.label}</span>
                    <span className="nav-hint">{item.hint}</span>
                  </span>
                  {showBadge && (
                    <span className="nav-badge" title={`${activeAlertCount} active alerts`}>
                      {activeAlertCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="ms-dot" aria-hidden="true" />
          <span className="sidebar-status-copy">
            <span className="sidebar-status-title">Telemetry live</span>
            <span className="sidebar-status-sub">{activeAlertCount} open incidents</span>
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
