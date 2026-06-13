import React from 'react';
import './MiningAlertReport.css';

const MiningAlertReport = () => {
  // Placeholder Data
  const executiveSummary = {
    totalAlerts: 150,
    acknowledgedAlerts: 120,
    downtimeHours: 25,
    topAlertTypes: [
      { type: 'Ground Movement', count: 50 },
      { type: 'Temperature Anomaly', count: 40 },
      { type: 'Gas Levels', count: 30 },
    ],
  };

  const alertLog = [
    {
      timestamp: '2025-09-01 10:30:00',
      alertId: 'ALRT001',
      status: 'Acknowledged',
      severity: 'Critical',
      location: 'Jharia Coalfield - Section A',
      description: 'Sudden ground movement detected, potential landslide risk',
      timeToAcknowledgment: '10 min',
    },
    {
      timestamp: '2025-09-01 11:00:00',
      alertId: 'ALRT002',
      status: 'Unacknowledged',
      severity: 'Medium',
      location: 'Raniganj Mine - Tunnel 3',
      description: 'Temperature exceeding safe limits in equipment room',
      timeToAcknowledgment: 'N/A',
    },
    {
      timestamp: '2025-09-01 11:00:00',
      alertId: 'ALRT002',
      status: 'Acknowledged',
      severity: 'Medium',
      location: 'Raniganj Mine - Tunnel 3',
      description: 'Temperature exceeding safe limits in equipment room',
      timeToAcknowledgment: 'N/A',
    },
    {
      timestamp: '2025-09-01 11:30:00',
      alertId: 'ALRT003',
      status: 'Acknowledged',
      severity: 'Low',
      location: 'Bokaro Mines - Shaft 2',
      description: 'Minor gas leak detected, contained quickly',
      timeToAcknowledgment: '5 min',
    },
  ];


  const correctiveActions = [
    {
      rootCause: 'Inadequate ground stability monitoring in Section B',
      recommendation: 'Increase sensor density in Section B to improve ground movement monitoring.',
    },
    {
      rootCause: 'Outdated equipment in Tunnel 3 causing temperature spikes',
      recommendation: 'Schedule equipment maintenance for Tunnel 3 to address temperature anomalies.',
    },
    {
      rootCause: 'Minor leaks in gas pipelines due to wear and tear',
      recommendation: 'Implement a routine inspection and maintenance schedule for gas pipelines.',
    },
  ];

  return (
    <div className="mining-alert-report">
      <h1>Mining Alert Report</h1>

      <section className="section executive-summary">
        <h2>1. Executive Summary</h2>
        <h3>Overview</h3>
        <p>This report provides a comprehensive overview of mining alerts over the specified period, offering key insights into incident trends and their impact on operations.</p>

        <h3>Key Metrics</h3>
        <div className="key-metrics">
          <p><strong>Total Number of Alerts:</strong> {executiveSummary.totalAlerts}</p>
          <p><strong>Number of Acknowledged Alerts:</strong> {executiveSummary.acknowledgedAlerts}</p>
          <p><strong>Total Hours of Downtime Due to Alerts:</strong> {executiveSummary.downtimeHours}</p>
        </div>

        <h3>Top 3 Alert Types</h3>
        <div className="top-alert-types">
          {executiveSummary.topAlertTypes.map((alert, index) => (
            <p key={index}>{alert.type}: {alert.count} alerts</p>
          ))}
        </div>
      </section>

      <section className="section alert-log">
        <h2>2. Alert Log</h2>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Alert ID</th>
              <th>Status</th>
              <th>Severity</th>
              <th>Location</th>
              <th>Description</th>
              <th>Time to Acknowledgment</th>
            </tr>
          </thead>
          <tbody>
            {alertLog.map((alert, index) => (
              <tr key={index}>
                <td>{alert.timestamp}</td>
                <td>{alert.alertId}</td>
                <td>{alert.status}</td>
                <td>{alert.severity}</td>
                <td>{alert.location}</td>
                <td>{alert.description}</td>
                <td>{alert.timeToAcknowledgment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section alert-analytics">
        <h2>3. Alert Analytics</h2>
        <div className="alert-analytics-charts">
          <div className="chart-container">
            <h3>Alerts by Type</h3>
            {/* Placeholder for pie/bar chart */}
            <p>Chart: Distribution of alerts across different types.</p>
          </div>
          <div className="chart-container">
            <h3>Alerts by Severity</h3>
            {/* Placeholder for bar chart */}
            <p>Chart: Number of critical, medium, and low-severity alerts.</p>
          </div>
          <div className="chart-container">
            <h3>Alerts by Location</h3>
            {/* Placeholder for map/bar chart */}
            <p>Chart: Mine sections experiencing the most alerts.</p>
          </div>
          <div className="chart-container">
            <h3>Alerts Over Time</h3>
            {/* Placeholder for line graph */}
            <p>Chart: Frequency of alerts over the reporting period.</p>
          </div>
        </div>
      </section>

      <section className="section corrective-actions">
        <h2>4. Corrective Actions and Recommendations</h2>
        <h3>Most Common Root Causes</h3>
        <ul>
          {correctiveActions.map((action, index) => (
            <li key={index}>
              <strong>Root Cause:</strong> {action.rootCause}
              <br />
              <strong>Recommendation:</strong> {action.recommendation}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default MiningAlertReport;
