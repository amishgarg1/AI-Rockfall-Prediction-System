import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';

const Sidebar = ({ isSidebarOpen, toggleSidebar, isLoggedIn }) => {
  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-graphic">
            <div className="mountain"></div>
            <div className="letter-r">M</div> {/* Re-added the letter-r div */}
            <div className="signal"></div>
            <div className="hexagons">
              <div className="hexagon"></div>
              <div className="hexagon small"></div>
              <div className="hexagon"></div>
              <div className="hexagon small"></div>
            </div>
          </div>
          <div className="logo-text-group">
            <span className="logo-text">MineSafe</span>
            <span className="logo-subtitle">AI & Geo-Data Platform</span>
          </div>
        </div>
        <div className="sidebar-slider-container" onClick={toggleSidebar}>
          <div className="sidebar-slider-thumb">
            {isSidebarOpen ? '' : ''}
          </div>
        </div>
      </div>
      <nav className="navigation">
        <ul>
          <li className="nav-item ">
          <Link to="/" className="nav-link">
            <span className="icon">&#x25A3;</span> {/* Dashboard icon */}
            <span className="text">Dashboard</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/sensoring" className="nav-link">
              <span className="icon">&#x1F50A;</span> {/* Sensors icon */}
              <span className="text">Sensors</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/alerts" className="nav-link">
              <span className="icon">&#x1F514;</span> {/* Alerts icon */}
              <span className="text">Alerts</span>
            </Link>
          </li>
          {isLoggedIn && (
            <li className="nav-item">
              <Link to="/prediction" className="nav-link">
                <span className="icon">&#x1F52E;</span> {/* Prediction icon */}
                <span className="text">Prediction</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>
      {/* Removed satellite image container */}
    </div>
  );
};

export default Sidebar;
