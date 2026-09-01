import React, { useMemo } from 'react';
import './RecentAlerts.css';
import { useNavigate } from 'react-router-dom';
import { initialAlerts } from '../data/alerts';

/* The panel used to be an empty box with a heading, where the whole tile was
   one big click target to the alerts page. It now shows the incidents it
   claims to, each row opening its own alert. */
const formatStamp = (timestamp) => {
  const date = new Date(timestamp.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return timestamp;

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const RecentAlerts = () => {
  const navigate = useNavigate();

  const recent = useMemo(
    () =>
      [...initialAlerts]
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 3),
    []
  );

  return (
    <div className="recent-alerts">
      <div className="alerts-header">
        <h2>Recent Alerts</h2>
        <button
          type="button"
          className="alerts-view-all"
          onClick={() => navigate('/alerts')}
        >
          View all
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 3.5 10.5 8 6 12.5" />
          </svg>
        </button>
      </div>

      <ul className="alerts-content">
        {recent.map((alert, index) => {
          const level = alert.severity.toLowerCase();

          return (
            <li key={alert.id}>
              <button
                type="button"
                className={`alert-row alert-row--${level} ms-enter`}
                style={{ animationDelay: `${index * 55}ms` }}
                onClick={() => navigate(`/alerts/${alert.id}`)}
              >
                <span className="alert-row-marker" aria-hidden="true" />
                <span className="alert-row-copy">
                  <span className="alert-row-top">
                    <span className="alert-row-location">{alert.location}</span>
                    <span className={`ms-chip ms-chip--${level}`}>{alert.severity}</span>
                  </span>
                  <span className="alert-row-description">{alert.description}</span>
                  <span className="alert-row-meta">
                    <span className={`alert-row-status alert-row-status--${alert.status}`}>{alert.status}</span>
                    <span className="alert-row-time">{formatStamp(alert.timestamp)}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentAlerts;
