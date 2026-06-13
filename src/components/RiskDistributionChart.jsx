import React from 'react';
import './RiskDistributionChart.css';

const RiskDistributionChart = () => {
  const data = [
    { label: 'High Risk', value: 35, color: '#E53935' }, /* Red */
    { label: 'Medium Risk', value: 45, color: '#FFD600' }, /* Yellow */
    { label: 'Low Risk', value: 20, color: '#4CAF50' }, /* Green */
  ];

  return (
    <div className="risk-distribution-chart-container">
      <h2>Risk Distribution</h2>
      <div className="chart-and-legend">
        <div className="donut-chart-placeholder">
          <svg viewBox="0 0 100 100" className="donut-chart-svg">
            {/* Inner circle for the donut hole */}
            <circle cx="50" cy="50" r="30" fill="transparent" />
            {/* Medium Risk segment (Yellow) */}
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FFFB00" strokeWidth="15" strokeDasharray="calc(45 * 2.5 * 3.14) calc(100 * 2.5 * 3.14)" transform="rotate(144 50 50)" />
            {/* Low Risk segment (Green) */}
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1AFF00" strokeWidth="15" strokeDasharray="calc(10 * 2.5 * 3.14) calc(100 * 2.5 * 3.14)" transform="rotate(72 50 50)" />
            {/* High Risk segment (Red) */}
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FF0000" strokeWidth="15" strokeDasharray="calc(10 * 2.5 * 3.14) calc(100 * 2.5 * 3.14)" transform="rotate(144 50 50)" />
            {/* Removed center text */}
          </svg>
        </div>
        <div className="chart-legend">
          {data.map((item, index) => (
            <div key={index} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: item.color }}></span>
              <span className="legend-label">{item.label}</span>
              <span className="legend-value">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskDistributionChart;
