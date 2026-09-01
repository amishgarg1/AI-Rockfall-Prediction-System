import React from 'react';
import StatusCard from './StatusCard';
import './StatusCardsContainer.css';

/* Inline SVG icons. The emoji they replace picked up the host OS emoji font,
   so the row rendered in four different styles depending on the machine. */
const icons = {
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
  incidents: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v16.5A1.5 1.5 0 0 0 4.5 21H21" />
      <path d="M7 15.5l3.8-4.6 3 2.6L19 7" />
    </svg>
  ),
  injuries: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7.5" r="3.2" />
      <path d="M2.8 20.2a6.4 6.4 0 0 1 12.4 0" />
      <path d="M17 11.5h4.4M19.2 9.3v4.4" />
    </svg>
  ),
  mines: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4.5 13h6l-1.5 9L19.5 11h-6L13 2Z" />
    </svg>
  ),
};

/* The four headline figures. Values are unchanged; the trend series and week
   deltas belong to the same demo dataset the rest of the dashboard runs on. */
const cards = [
  {
    type: 'high-risk',
    icon: icons.warning,
    title: 'High Risk Mines',
    value: '24',
    delta: 3,
    deltaLabel: 'vs. last week',
    trend: [17, 19, 18, 21, 20, 22, 24],
  },
  {
    type: 'total-incidents',
    icon: icons.incidents,
    title: 'Total Incidents',
    value: '139',
    delta: 12,
    deltaLabel: 'rolling 12 months',
    trend: [96, 104, 110, 118, 121, 130, 139],
  },
  {
    type: 'injuries',
    icon: icons.injuries,
    title: 'Injuries (6M)',
    value: '28',
    delta: -4,
    deltaLabel: 'vs. previous 6M',
    trend: [38, 36, 34, 33, 31, 30, 28],
  },
  {
    type: 'active-mines',
    icon: icons.mines,
    title: 'Active Mines',
    value: '167',
    delta: 5,
    deltaLabel: 'sites reporting',
    trend: [151, 154, 156, 159, 162, 164, 167],
  },
];

const StatusCardsContainer = () => (
  <div className="status-cards-container">
    {cards.map((card, index) => (
      <StatusCard key={card.type} index={index} {...card} />
    ))}
  </div>
);

export default StatusCardsContainer;
