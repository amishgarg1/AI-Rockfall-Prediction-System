import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './AlertDetailsPage.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Temporarily import initialAlerts from AlertsPage.jsx for mock data
import { initialAlerts } from '../data/alerts';

const AlertDetailsPage = () => {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // In a real app, you would fetch alert details from a backend API
    const foundAlert = initialAlerts.find(a => a.id === id);
    setAlert(foundAlert);
  }, [id]);

  if (!alert) {
    return <div className="alert-details-page"><h1>Alert Not Found</h1><p>The requested alert could not be found.</p><Link to="/alerts" className="back-button">Back to Alerts</Link></div>;
  }

  const { details } = alert;

  return (
    <div className="alert-details-page">
      <header className="alert-details-header">
        <Link to="/alerts" className="back-button">←</Link>
        <h1 className="alert-details-title">{alert.location}</h1>
      </header>

      <div className="details-grid">
        {/* 1. Immediate Context & Cause */}
        <div className="detail-card context-card">
          <h3><span className="card-icon">&#x23F1;</span> Immediate Context & Cause</h3>
          <div className="card-content">
            <p><strong>Current Reading:</strong> <span className="highlight-value">{details.currentReading}</span></p>
            <p><strong>Threshold Value:</strong> <span className="threshold-value">{details.thresholdValue}</span></p>
            <p><strong>Time of Exceedance:</strong> <span className="text-muted">{details.timeOfExceedance}</span></p>
            <p><strong>Duration of Alert:</strong> <span className="text-muted">{details.durationOfAlert}</span></p>
          </div>
        </div>

        {/* 2. Location & Affected Assets */}
        <div className="detail-card location-card-details">
          <h3><span className="card-icon">&#x1F4CD;</span> Location & Affected Assets</h3>
          <div className="card-content">
            <p><strong>Precise Coordinates:</strong> <span className="highlight-value">Lat {details.preciseCoordinates.lat}, Lon {details.preciseCoordinates.lon}</span></p>
            <p><strong>Assets at Risk:</strong></p>
            <ul className="assets-list">
              {details.assetsAtRisk.map((asset, index) => (
                <li key={index}><span className="asset-icon">&#x26A0;</span> {asset}</li>
              ))}
            </ul>
            <p><strong>Sensor Health:</strong> <span className="highlight-value">Battery Level: {details.sensorHealth.batteryLevel}</span>, <span className="text-muted">Last Calibration: {details.sensorHealth.lastCalibration}</span></p>
          </div>
        </div>

        {/* 3. Historical Data & Trend */}
        <div className="detail-card large-card">
          <h3>Historical Data & Trend</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={details.historicalData.timeSeriesGraph}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p><strong>Historical Peak:</strong> {details.historicalData.historicalPeak.value} on {details.historicalData.historicalPeak.date}</p>
        </div>

        {/* 4. Actionable Recommendations */}
        <div className="detail-card large-card recommendations-card">
          <h3><span className="card-icon">&#x1F6A7;</span> Actionable Recommendations</h3>
          <div className="card-content">
            <p><strong>SOP Link:</strong> <a href="#" className="sop-link highlight-value">{details.actionableRecommendations.sopLink}</a></p>
            <p><strong>Required Action Checklist:</strong></p>
            <ul className="checklist">
              {details.actionableRecommendations.requiredActionChecklist.map((action, index) => (
                <li key={index}><span className="checklist-icon">&#x2713;</span> {action}</li>
              ))}
            </ul>
            <p><strong>Escalation Contact:</strong> <span className="highlight-value">{details.actionableRecommendations.escalationContact.name}</span> (<span className="text-muted">{details.actionableRecommendations.escalationContact.phone}</span>)</p>
          </div>
        </div>

        {/* 5. Audit Trail */}
        <div className="detail-card large-card audit-trail-card">
          <h3><span className="card-icon">&#x1F4DD;</span> Audit Trail</h3>
          <div className="card-content">
            <ul className="audit-list">
              {details.auditTrail.map((entry, index) => (
                <li key={index}><span className="audit-icon">&#x2022;</span> {entry}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailsPage;
