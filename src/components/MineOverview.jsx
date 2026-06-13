import React from 'react';
import './MineOverview.css';

const MineOverview = ({ mineData, sensorData }) => {
  console.log("Sensor Data in MineOverview:", sensorData);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <span className="status-icon success">&#x2714;</span>; // Checkmark
      case 'warning':
        return <span className="status-icon warning">&#x26A0;</span>; // Warning sign
      case 'error':
        return <span className="status-icon error">&#x2716;</span>; // X mark
      default:
        return null;
    }
  };

  return (
    <div className="mine-overview-container">
      <div className="mine-header">
        <div className="mine-info">
          <h2>{mineData.name}</h2>
          <p>{mineData.location}</p>
          <p>{mineData.coordinates}</p>
        </div>
        <div className="mine-status">
          <span className="status-badge">{mineData.status}</span>
          <span className="last-inspection">Last inspection: {mineData.lastInspection}</span>
        </div>
      </div>
      <div className="sensor-cards-grid">
        {sensorData.map((sensor) => (
          <div key={sensor.id} className={`sensor-card ${sensor.status}`}>
            <div className="sensor-header">
              <span className="sensor-icon" dangerouslySetInnerHTML={{ __html: sensor.icon }}></span>
              <h3 className="sensor-name">{sensor.name}</h3>
              {getStatusIcon(sensor.status)}
            </div>
            <div className="sensor-details">
              <p className="sensor-value">{sensor.value}</p>
              <p className="sensor-threshold">Threshold: {sensor.threshold}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MineOverview;
