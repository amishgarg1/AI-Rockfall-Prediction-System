import React, { useEffect, useState } from 'react';
import Map from './Map';
import GroundVibrationChart from './GroundVibrationChart';
import RecentAlerts from './RecentAlerts';
import QuickStatistics from './QuickStatistics';
import StatusCardsContainer from './StatusCardsContainer';
import IndiaRiskMap from './IndiaRiskMap';
import RiskDistributionChart from './RiskDistributionChart';
import GroundVibrationDetailPage from './GroundVibrationDetailPage'; // Import the new detail page
// import LoginPage from './LoginPage'; // Removed as LoginPage is now in App.jsx
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons'; // Import faTimes for close button

const Dashboard = ({ isLoggedIn, handleLoginClick, handleSignupClick, handleLogout, signupMessage, setSignupMessage }) => {
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showGroundVibrationDetail, setShowGroundVibrationDetail] = useState(false); // New state for detail page

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

  // const handleLoginClick = () => { // Removed
  //   setShowLoginPage(true);
  // };

  // const handleLoginSuccess = () => { // Removed
  //   setIsLoggedIn(true);
  //   setShowLoginPage(false);
  // };

  // const handleCloseLoginPage = () => { // Removed
  //   setShowLoginPage(false);
  // };

  return (
    <div className="dashboard"> {/* Remove conditional blur from here */}
      <header className="dashboard-header">
        <div className="dashboard-title-container">
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        <div className="auth-container">
          {isLoggedIn ? (
            <div className="user-profile-container">
              {loggedInUser && (
                <span className="user-greeting">Hi, {loggedInUser.fullName || 'User'}</span>
              )}
              <div className="user-icon" onClick={toggleNotificationsDropdown}>
                <FontAwesomeIcon icon={faUserCircle} />
              </div>
              <div className="notification-arrow" onClick={toggleNotificationsDropdown}>
                <FontAwesomeIcon icon={faCaretDown} />
              </div>
              {showNotificationsDropdown && (
                <div className={`notification-dropdown ${showNotificationsDropdown ? 'show' : ''}`}> {/* Apply 'show' class conditionally */}
                  {loggedInUser && (
                    <div className="dropdown-profile-info">
                      <div className="profile-name">{loggedInUser.fullName || 'User'}</div>
                      <div className="profile-email">{loggedInUser.email}</div>
                      <div className="profile-role">
                        Role: {loggedInUser.userRole ? loggedInUser.userRole.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'N/A'}
                      </div>
                      <div className="profile-location">Site: {loggedInUser.mineLocation || 'N/A'}</div>
                    </div>
                  )}
                  <hr className="dropdown-divider" />
                  <div className="dropdown-item">Notifications</div>
                  <div className="dropdown-item" onClick={handleLogout}>Sign-out</div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="login-button" onClick={handleLoginClick}>Log In</button>
              <button className="signup-button" onClick={handleSignupClick}>Sign Up</button>
            </div>
          )}
        </div>
      </header>

      {signupMessage && (
        <div className="signup-success-message">
          {signupMessage}
          <button className="close-message-button" onClick={() => setSignupMessage(null)}>
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
                  {/* Risk Distribution Chart Placeholder */}
                  <RiskDistributionChart />
                </div>
              </div>
            </div>
            <div className="bottom-row-sections">
              <div className="ground-vibration-chart-section" onClick={handleGroundVibrationClick}>
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
      {/* showLoginPage conditional rendering removed, LoginPage now in App.jsx */}
    </div>
  );
};

export default Dashboard;
