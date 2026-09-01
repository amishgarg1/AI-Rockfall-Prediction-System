import React, { useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Sensors from './components/Sensors';
import SensoringPage from './components/SensoringPage';
import AlertsPage from './components/AlertsPage';
import LoginPage from './components/LoginPage'; // Import LoginPage
import SignupPage from './components/SignupPage'; // Removed SignupPage import
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
// import { signOut } from 'firebase/auth'; // Removed
// import { auth } from './firebase'; // Removed
import './App.css';
import PredictionPage from './components/PredictionPage';
import AlertDetailsPage from './components/AlertDetailsPage'; // Import new component

/* Holds the outgoing route on screen long enough to play its exit, then swaps
   in the new one. React Router replaces the tree the instant the URL changes,
   so without this the old page vanishes mid-frame and the new one appears
   fully formed — the abrupt swap this is here to remove.

   Returns the location the router should actually render (which lags the real
   one during the exit) plus the stage driving the CSS animation. */
const PAGE_OUT_MS = 260;

const usePageTransition = () => {
  const location = useLocation();
  const [rendered, setRendered] = useState(location);
  const [stage, setStage] = useState('in');
  const timer = useRef(null);

  useEffect(() => {
    // Same page (a query or hash change): nothing to animate.
    if (location.pathname === rendered.pathname) return undefined;

    setStage('out');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setRendered(location);
      setStage('in');
    }, PAGE_OUT_MS);

    return () => clearTimeout(timer.current);
  }, [location, rendered.pathname]);

  return { rendered, stage };
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('loggedInUser')); // Initialize isLoggedIn from local storage
  const [showLoginPage, setShowLoginPage] = useState(false); // Add showLoginPage state
  const [showSignupPage, setShowSignupPage] = useState(false); // Add showSignupPage state
  const [signupMessage, setSignupMessage] = useState(null); // New state for signup success message

  const navigate = useNavigate();
  const { rendered, stage } = usePageTransition();
  const scrollerRef = useRef(null);

  /* A new route starts at the top. Without this the content column keeps the
     previous page's scroll offset, so a short page can arrive already scrolled
     past its own header. Jumps at the point the old page is fully faded, so
     the reset is never visible. */
  useEffect(() => {
    if (stage !== 'in' || !scrollerRef.current) return;
    scrollerRef.current.scrollTo({ top: 0, behavior: 'auto' });
  }, [stage, rendered.pathname]);

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
      {/* Backdrop layers: drifting glows and a faint technical grid. Purely
          decorative, so they sit outside the content wrapper and take no
          pointer events. */}
      <div className="app-ambient" aria-hidden="true" />
      <div className="app-grid" aria-hidden="true" />
      <div className={`app-content-wrapper ${(showLoginPage || showSignupPage) ? 'blurred-and-disabled' : ''}`}> {/* Apply blur to wrapper */}
        <div className={`sidebar-container ${isSidebarOpen ? 'open' : 'closed'}`}>
          <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isLoggedIn={isLoggedIn} />
        </div>
        <div className={`main-content-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} ref={scrollerRef}>
          {/* Keyed on the path so React tears down and rebuilds the subtree per
              route — that is what makes each page replay its own entrance
              animations instead of reusing the previous page's settled DOM. */}
          <div className={`page-transition page-transition--${stage}`} key={rendered.pathname}>
          <Routes location={rendered}>
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
      </div>
      {showLoginPage && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onClose={handleCloseLoginPage}
          onSwitchToSignup={handleSignupClick}
        />
      )}
      {showSignupPage && (
        <SignupPage
          onSignupSuccess={handleSignupSuccess}
          onClose={handleCloseSignupPage}
        />
      )}
      {/* Film grain over the whole frame. Breaks up the banding that large
          flat dark gradients produce on 8-bit displays. */}
      <div className="ms-grain" aria-hidden="true" />
    </div>
  );
}

export default App;
