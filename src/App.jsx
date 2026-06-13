import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Sensors from './components/Sensors';
import SensoringPage from './components/SensoringPage';
import AlertsPage from './components/AlertsPage';
import LoginPage from './components/LoginPage'; // Import LoginPage
import SignupPage from './components/SignupPage'; // Removed SignupPage import
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// import { signOut } from 'firebase/auth'; // Removed
// import { auth } from './firebase'; // Removed
import './App.css';
import PredictionPage from './components/PredictionPage';
import AlertDetailsPage from './components/AlertDetailsPage'; // Import new component

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('loggedInUser')); // Initialize isLoggedIn from local storage
  const [showLoginPage, setShowLoginPage] = useState(false); // Add showLoginPage state
  const [showSignupPage, setShowSignupPage] = useState(false); // Add showSignupPage state
  const [signupMessage, setSignupMessage] = useState(null); // New state for signup success message

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLoginClick = () => {
    setShowLoginPage(true);
    setShowSignupPage(false); // Close signup page if open
    setSignupMessage(null); // Clear any signup message when opening login
  };

  const handleSignupClick = () => {
    setShowSignupPage(true);
    setShowLoginPage(false); // Close login page if open
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginPage(false);
    setSignupMessage(null); // Clear any signup message on successful login
    // navigate('/prediction'); // Removed automatic navigation to prediction
  };

  const handleSignupSuccess = () => {
    setShowSignupPage(false); // Close signup page after successful signup
    setSignupMessage('You have successfully signed up! Please log in.'); // Set success message
    setShowLoginPage(true); // Automatically open login page
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser'); // Clear logged-in user from local storage
    setIsLoggedIn(false);
    setShowLoginPage(false);
    setShowSignupPage(false);
    setSignupMessage(null); // Clear any signup message on logout
    // Hide dropdown and remove blur
    // Option 1: Use a callback or state lift, but for now, trigger a custom event
    const event = new CustomEvent('closeDashboardDropdown');
    window.dispatchEvent(event);
    console.log("User logged out successfully.");
    navigate('/');
  };

  const handleCloseLoginPage = () => {
    setShowLoginPage(false);
    setSignupMessage(null); // Clear message if login page is closed without login
  };

  const handleCloseSignupPage = () => {
    setShowSignupPage(false);
  };

  return (
    <div className="app-container">
      <div className={`app-content-wrapper ${(showLoginPage || showSignupPage) ? 'blurred-and-disabled' : ''}`}> {/* Apply blur to wrapper */}
        <div className={`sidebar-container ${isSidebarOpen ? 'open' : 'closed'}`}>
          <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isLoggedIn={isLoggedIn} />
        </div>
        <div className={`main-content-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <Routes>
            <Route path="/" element={<Dashboard
              isLoggedIn={isLoggedIn}
              handleLoginClick={handleLoginClick}
              handleSignupClick={handleSignupClick}
              handleLogout={handleLogout}
              signupMessage={signupMessage} // Pass signup message to Dashboard
              setSignupMessage={setSignupMessage} // Pass setter to Dashboard
            />} />
            <Route path="/sensors" element={<Sensors />} />
            <Route path="/sensors/:id" element={<Sensors />} />
            <Route path="/Sensoring" element={<SensoringPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/alerts/:id" element={<AlertDetailsPage />} /> {/* New route for alert details */}
            <Route path="/prediction" element={<PredictionPage />} />
          </Routes>
        </div>
      </div>
      {showLoginPage && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onClose={handleCloseLoginPage}
        />
      )}
      {showSignupPage && (
        <SignupPage
          onSignupSuccess={handleSignupSuccess}
          onClose={handleCloseSignupPage}
        />
      )}
    </div>
  );
}

export default App;
