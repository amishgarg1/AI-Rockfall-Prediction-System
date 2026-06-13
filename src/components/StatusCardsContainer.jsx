import React from 'react';
import StatusCard from './StatusCard';
import './StatusCardsContainer.css';

const StatusCardsContainer = () => {
  return (
    <div className="status-cards-container">
      <StatusCard icon="⚠️" title="High Risk Mines" value="24" type="high-risk" />
      <StatusCard icon="📈" title="Total Incidents" value="139" type="total-incidents" />
      <StatusCard icon="🧑‍🤝‍🧑" title="Injuries (6M)" value="28" type="injuries" />
      <StatusCard icon="⚡" title="Active Mines" value="167" type="active-mines" />
    </div>
  );
};

export default StatusCardsContainer;
