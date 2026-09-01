import React, { useEffect, useRef, useState } from 'react';
import GroundVibrationChart from './GroundVibrationChart';
import RecentAlerts from './RecentAlerts';
import QuickStatistics from './QuickStatistics';
import StatusCardsContainer from './StatusCardsContainer';
import IndiaRiskMap from './IndiaRiskMap';
import RiskDistributionChart from './RiskDistributionChart';
import GroundVibrationDetailPage from './GroundVibrationDetailPage'; // Import the new detail page
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons'; // Import faTimes for close button

/* A control room shows the time. Ticks once a second off the client clock —
   no data source involved, so it cannot go stale. */
const useClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
};

const Dashboard = ({ isLoggedIn, handleLoginClick, handleSignupClick, handleLogout, signupMessage, setSignupMessage }) => {
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showGroundVibrationDetail, setShowGroundVibrationDetail] = useState(false); // New state for detail page
  const profileRef = useRef(null);
  const now = useClock();

  const loggedInUser = (() => {
    try {
      return isLoggedIn ? JSON.parse(localStorage.getItem('loggedInUser')) : null;
    } catch (e) {
      console.error("Error parsing loggedInUser from localStorage", e);
      return null;
    }
  })();

  useEffect(() => {
    const closeDropdown = () => setShowNotificationsDropdown(false);
    window.addEventListener('closeDashboardDropdown', closeDropdown);
    return () => window.removeEventListener('closeDashboardDropdown', closeDropdown);
  }, []);

  /* Dismiss the profile menu on an outside click or on Escape. Without this
     the only way to close it was to hit the same toggle again, which is not
     what anyone expects from a dropdown. */
  useEffect(() => {
    if (!showNotificationsDropdown) return undefined;

    const onPointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowNotificationsDropdown(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowNotificationsDropdown(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showNotificationsDropdown]);

  // Clear signup message after a few seconds or on component unmount
  useEffect(() => {
    if (signupMessage) {
      const timer = setTimeout(() => {
        setSignupMessage(null);
      }, 8000); // Clear message after 8 seconds
      return () => clearTimeout(timer);
    }
  }, [signupMessage, setSignupMessage]);

  const toggleNotificationsDropdown = () => {
    setShowNotificationsDropdown(prevState => !prevState);
  };

  const handleGroundVibrationClick = () => {
    setShowGroundVibrationDetail(true);
  };

  const handleBackToDashboard = () => {
    setShowGroundVibrationDetail(false);
  };

  const timeLabel = now.toLocaleTimeString('en-IN', { hour12: false });
  const dateLabel = now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-title-container">
          <h1 className="dashboard-title">Dashboard</h1>
        </div>

        <div className="dashboard-header-right">
          <div className="header-clock" title={dateLabel}>
            <span className="ms-dot" aria-hidden="true" />
            <span className="header-clock-copy">
              <span className="header-clock-time">{timeLabel}</span>
              <span className="header-clock-date">{dateLabel}</span>
            </span>
          </div>

          <div className="auth-container">
            {isLoggedIn ? (
              <div className="user-profile-container" ref={profileRef}>
                {loggedInUser && (
                  <span className="user-greeting">Hi, {loggedInUser.fullName || 'User'}</span>
                )}
                <button
                  type="button"
                  className="user-trigger"
                  onClick={toggleNotificationsDropdown}
                  aria-expanded={showNotificationsDropdown}
                  aria-haspopup="menu"
                  aria-label="Account menu"
                >
                  <span className="user-icon">
                    <FontAwesomeIcon icon={faUserCircle} />
                  </span>
                  <span className={`notification-arrow ${showNotificationsDropdown ? 'open' : ''}`}>
                    <FontAwesomeIcon icon={faCaretDown} />
                  </span>
                </button>
                {showNotificationsDropdown && (
                  <div className="notification-dropdown show" role="menu">
                    {loggedInUser && (
                      <div className="dropdown-profile-info">
                        <div className="profile-avatar" aria-hidden="true">
                          {(loggedInUser.fullName || 'U').trim().charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-identity">
                          <div className="profile-name">{loggedInUser.fullName || 'User'}</div>
                          <div className="profile-email">{loggedInUser.email}</div>
                        </div>
                      </div>
                    )}
                    {loggedInUser && (
                      <dl className="profile-meta">
                        <div className="profile-meta-row">
                          <dt>Role</dt>
                          <dd>{loggedInUser.userRole ? loggedInUser.userRole.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'N/A'}</dd>
                        </div>
                        <div className="profile-meta-row">
                          <dt>Site</dt>
                          <dd>{loggedInUser.mineLocation || 'N/A'}</dd>
                        </div>
                      </dl>
                    )}
                    <hr className="dropdown-divider" />
                    <button type="button" className="dropdown-item" role="menuitem">Notifications</button>
                    <button type="button" className="dropdown-item dropdown-item--danger" role="menuitem" onClick={handleLogout}>Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="ms-btn ms-btn--ghost login-button" onClick={handleLoginClick}>Log In</button>
                <button className="ms-btn ms-btn--primary signup-button" onClick={handleSignupClick}>Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {signupMessage && (
        <div className="signup-success-message" role="status">
          <span className="signup-success-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </span>
          <span className="signup-success-text">{signupMessage}</span>
          <button className="close-message-button" onClick={() => setSignupMessage(null)} aria-label="Dismiss message">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      {showGroundVibrationDetail ? (
        <GroundVibrationDetailPage onBackToDashboard={handleBackToDashboard} />
      ) : (
        <div className={`dashboard-content-wrapper ${showNotificationsDropdown ? 'blurred-background' : ''}`}> {/* New wrapper for content to apply blur */}
          <div className="dashboard-content">
            <StatusCardsContainer />
            <div className="main-dashboard-grid">
              <div className="map-and-legend">
                <IndiaRiskMap />
              </div>
              <div className="right-panel">
                <div className="risk-distribution-section">
                  <RiskDistributionChart />
                </div>
              </div>
            </div>
            <div className="bottom-row-sections">
              <div
                className="ground-vibration-chart-section"
                onClick={handleGroundVibrationClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGroundVibrationClick(); } }}
              >
                <GroundVibrationChart />
              </div>
              <div className="recent-alerts-section">
                <RecentAlerts />
              </div>
              <div className="quick-statistics-section">
                <QuickStatistics />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
