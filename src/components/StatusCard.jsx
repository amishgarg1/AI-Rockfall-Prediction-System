import React from 'react';
import './StatusCard.css';

const StatusCard = ({ icon, title, value, type }) => {
  return (
    <div className={`status-card ${type}`}>
      <div className="card-icon">
        {icon}
      </div>
      <div className="card-info">
        <p className="card-title">{title}</p>
        <p className="card-value">{value}</p>
      </div>
    </div>
  );
};

export default StatusCard;
