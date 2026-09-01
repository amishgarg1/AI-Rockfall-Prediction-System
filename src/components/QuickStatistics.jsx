import React, { useMemo } from 'react';
import './QuickStatistics.css';
import { initialAlerts } from '../data/alerts';

const icons = {
  open: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4M12 17h.01" />
    </svg>
  ),
  sites: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  ),
  cleared: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 6.5 9.5 17.5 4 12" />
    </svg>
  ),
};

/* Every figure here is counted off the same alert dataset the alerts page and
   the risk map read from. The panel previously showed placeholder strings
   ("Micklion", "Dom", timestamps like 001002am) that meant nothing. */
const QuickStatistics = () => {
  const stats = useMemo(() => {
    const total = initialAlerts.length;
    const open = initialAlerts.filter((a) => a.status === 'active');
    const cleared = initialAlerts.filter((a) => a.status === 'resolved');
    const sites = new Set(initialAlerts.map((a) => a.location.split(' - ')[0]));
    const critical = open.filter((a) => a.severity === 'High').length;

    return [
      {
        key: 'open',
        tone: 'danger',
        icon: icons.open,
        title: 'Open incidents',
        value: open.length,
        detail: `${critical} at high severity`,
        share: total ? (open.length / total) * 100 : 0,
      },
      {
        key: 'sites',
        tone: 'warning',
        icon: icons.sites,
        title: 'Sites affected',
        value: sites.size,
        detail: `across ${total} logged alerts`,
        share: total ? (sites.size / total) * 100 : 0,
      },
      {
        key: 'cleared',
        tone: 'success',
        icon: icons.cleared,
        title: 'Cleared',
        value: cleared.length,
        detail: `${Math.round(total ? (cleared.length / total) * 100 : 0)}% of all alerts`,
        share: total ? (cleared.length / total) * 100 : 0,
      },
    ];
  }, []);

  return (
    <div className="quick-statistics">
      <div className="statistics-header">
        <h2>Quick Statistics</h2>
        <span className="ms-eyebrow">Incident ledger</span>
      </div>

      <div className="statistics-content">
        {stats.map((stat, index) => (
          <div
            key={stat.key}
            className={`stat-item stat-item--${stat.tone} ms-enter`}
            style={{ animationDelay: `${index * 55}ms` }}
          >
            <span className={`stat-icon ${stat.tone}`} aria-hidden="true">{stat.icon}</span>

            <div className="stat-details">
              <p className="stat-title">{stat.title}</p>
              <p className="stat-time">{stat.detail}</p>
              <div className="ms-meter stat-meter">
                <div
                  className="ms-meter-fill stat-meter-fill"
                  style={{ width: `${Math.min(stat.share, 100)}%` }}
                />
              </div>
            </div>

            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickStatistics;
