import React from 'react';
import './RecentAlerts.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const RecentAlerts = () => {
  const navigate = useNavigate();

  // The onClick handler for the button
  const handleViewAllClick = () => {
      // Navigate to the '/alerts' route
      navigate('/alerts');
  };
  return (
    <div className="recent-alerts" onClick={handleViewAllClick}  > 
      <div className="alerts-header">
        <h2>Recent Alerts</h2>
      </div>
      <div className="alerts-content">
      </div>
    </div>
  );
};

export default RecentAlerts;
