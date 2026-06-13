import React from 'react';
import './QuickStatistics.css';

const QuickStatistics = () => {
  return (
    <div className="quick-statistics">
      <div className="statistics-header">
        <h2>Quick Stastisicc</h2>
      </div>
      <div className="statistics-content">
        <div className="stat-item">
          <span className="stat-icon danger">▲</span>
          <div className="stat-details">
            <p className="stat-title">Total Sensors: 50</p>
            <p className="stat-time">001002am</p>
          </div>
          <p className="stat-value">Micklion<br/>02%</p>
        </div>
        <div className="stat-item">
          <span className="stat-icon success">▲</span>
          <div className="stat-details">
            <p className="stat-title">Active Alerts: 1</p>
            <p className="stat-time">001007am</p>
          </div>
          <p className="stat-value">Severity<br/>21%</p>
        </div>
        <div className="stat-item">
          <span className="stat-icon warning">▲</span>
          <div className="stat-details">
            <p className="stat-title">Sensors Offline: 1</p>
            <p className="stat-time">001007am</p>
          </div>
          <p className="stat-value">Dom<br/>6%</p>
        </div>
      </div>
    </div>
  );
};

export default QuickStatistics;
