import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './AlertDetailsPage.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Temporarily import initialAlerts from AlertsPage.jsx for mock data
import { initialAlerts } from '../data/alerts';

const icons = {
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  ),
  trend: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 16.5l5-5.5 3.6 3.4L21 5" />
      <path d="M15.5 5H21v5.5" />
    </svg>
  ),
  playbook: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h4.5A1.5 1.5 0 0 1 20 5.5v12a1.5 1.5 0 0 1-1.5 1.5H14a2.5 2.5 0 0 0-2 1 2.5 2.5 0 0 0-2-1H5.5A1.5 1.5 0 0 1 4 17.5Z" />
      <path d="M12 5v14" />
    </svg>
  ),
  audit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3.5h8.5L19 8v12.5H6Z" />
      <path d="M14 3.5V8h5" />
      <path d="M9 12.5h6M9 16h4" />
    </svg>
  ),
};

/* Readings arrive as display strings ("7.5% LEL"), so the numbers have to be
   pulled back out to work out how far past the threshold the site actually
   went. Anything unparseable simply skips the exceedance bar. */
const toNumber = (raw) => {
  const match = String(raw ?? '').match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const AlertDetailsPage = () => {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    // In a real app, you would fetch alert details from a backend API
    const foundAlert = initialAlerts.find(a => a.id === id);
    setAlert(foundAlert);
    setAcknowledged(foundAlert?.status === 'acknowledged' || foundAlert?.status === 'resolved');
    setChecked({});
  }, [id]);

  if (!alert) {
    return (
      <div className="alert-details-page">
        <div className="alert-not-found">
          <h1>Alert Not Found</h1>
          <p>The requested alert could not be found.</p>
          <Link to="/alerts" className="ms-btn">Back to Alerts</Link>
        </div>
      </div>
    );
  }

  const { details } = alert;
  const level = alert.severity.toLowerCase();

  const reading = toNumber(details.currentReading);
  const limit = toNumber(details.thresholdValue);
  const ratio = reading !== null && limit ? reading / limit : null;
  const overBy = ratio !== null ? Math.round((ratio - 1) * 100) : null;

  const toggleCheck = (index) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const checklist = details.actionableRecommendations.requiredActionChecklist;
  const completed = checklist.filter((_, i) => checked[i]).length;

  return (
    <div className="alert-details-page">
      <header className="alert-details-header">
        <Link to="/alerts" className="back-button" aria-label="Back to alerts">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3.5 5.5 8l4.5 4.5" />
          </svg>
        </Link>

        <div className="alert-details-heading">
          <div className="alert-details-tags">
            <span className={`ms-chip ms-chip--${level}`}>{alert.severity} severity</span>
            <span className={`status-badge status-${acknowledged && alert.status === 'active' ? 'acknowledged' : alert.status}`}>
              {acknowledged && alert.status === 'active' ? 'Acknowledged' : alert.status}
            </span>
            <span className="alert-details-id">{alert.id}</span>
          </div>
          <h1 className="alert-details-title">{alert.location}</h1>
        </div>

        {/* Mitigation controls. Acknowledge is local state, the escalation
            button is a real tel: link, and export uses the browser's own
            print pipeline — none of them pretend to reach a backend. */}
        <div className="alert-details-actions">
          <button
            type="button"
            className={`ms-btn ${acknowledged ? '' : 'ms-btn--primary'}`}
            onClick={() => setAcknowledged((prev) => !prev)}
            disabled={alert.status === 'resolved'}
          >
            {acknowledged ? 'Acknowledged' : 'Acknowledge'}
          </button>
          <a className="ms-btn ms-btn--danger" href={`tel:${details.actionableRecommendations.escalationContact.phone.replace(/[^+\d]/g, '')}`}>
            Escalate
          </a>
          <button type="button" className="ms-btn ms-btn--ghost" onClick={() => window.print()}>
            Export
          </button>
        </div>
      </header>

      {/* Trigger audit: what crossed, by how much. The headline fact of any
          incident, previously buried as one line inside a card. */}
      {ratio !== null && (
        <section className={`trigger-audit trigger-audit--${level}`}>
          <div className="trigger-audit-figures">
            <div className="trigger-figure">
              <span className="trigger-figure-label">Reading at trigger</span>
              <span className="trigger-figure-value">{details.currentReading}</span>
            </div>
            <div className="trigger-figure">
              <span className="trigger-figure-label">Threshold</span>
              <span className="trigger-figure-value trigger-figure-value--muted">{details.thresholdValue}</span>
            </div>
            <div className="trigger-figure">
              <span className="trigger-figure-label">Exceeded by</span>
              <span className="trigger-figure-value trigger-figure-value--alarm">
                {overBy > 0 ? `+${overBy}%` : `${overBy}%`}
              </span>
            </div>
          </div>

          <div className="trigger-scale">
            <div className="trigger-scale-track">
              <div
                className="trigger-scale-fill"
                style={{ width: `${Math.min((ratio / 1.6) * 100, 100)}%` }}
              />
              {/* The threshold sits proportionally along the track, so the
                  overshoot past it is measurable by eye. */}
              <span className="trigger-scale-limit" style={{ left: `${(1 / 1.6) * 100}%` }}>
                <span className="trigger-scale-limit-label">limit</span>
              </span>
            </div>
          </div>

          <p className="trigger-audit-meta">
            Crossed at {details.timeOfExceedance} · sustained {details.durationOfAlert}
          </p>
        </section>
      )}

      <div className="details-grid">
        {/* 1. Immediate Context & Cause */}
        <div className="detail-card context-card">
          <h3><span className="card-icon">{icons.clock}</span> Immediate Context &amp; Cause</h3>
          <div className="card-content">
            <dl className="detail-list">
              <div className="detail-row">
                <dt>Current reading</dt>
                <dd className="highlight-value">{details.currentReading}</dd>
              </div>
              <div className="detail-row">
                <dt>Threshold value</dt>
                <dd className="threshold-value">{details.thresholdValue}</dd>
              </div>
              <div className="detail-row">
                <dt>Time of exceedance</dt>
                <dd className="text-muted">{details.timeOfExceedance}</dd>
              </div>
              <div className="detail-row">
                <dt>Duration of alert</dt>
                <dd className="text-muted">{details.durationOfAlert}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 2. Location & Affected Assets */}
        <div className="detail-card location-card-details">
          <h3><span className="card-icon">{icons.pin}</span> Location &amp; Affected Assets</h3>
          <div className="card-content">
            <dl className="detail-list">
              <div className="detail-row">
                <dt>Coordinates</dt>
                <dd className="mono-value">{details.preciseCoordinates.lat}, {details.preciseCoordinates.lon}</dd>
              </div>
              <div className="detail-row">
                <dt>Sensor battery</dt>
                <dd className="highlight-value">{details.sensorHealth.batteryLevel}</dd>
              </div>
              <div className="detail-row">
                <dt>Last calibration</dt>
                <dd className="text-muted">{details.sensorHealth.lastCalibration}</dd>
              </div>
            </dl>

            <p className="detail-subhead">Assets at risk</p>
            <ul className="assets-list">
              {details.assetsAtRisk.map((asset, index) => (
                <li key={index}>
                  <span className="asset-icon" aria-hidden="true">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 2.6 1.8 11.5A1.4 1.4 0 0 0 3 13.6h10a1.4 1.4 0 0 0 1.2-2.1L9 2.6a1.4 1.4 0 0 0-2 0Z" />
                      <path d="M8 6.4v3M8 11.4h.01" />
                    </svg>
                  </span>
                  {asset}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. Historical Data & Trend */}
        <div className="detail-card large-card">
          <h3><span className="card-icon">{icons.trend}</span> Historical Data &amp; Trend</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={details.historicalData.timeSeriesGraph}
                margin={{
                  top: 10,
                  right: 12,
                  left: -12,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffb43d" stopOpacity={0.5}/>
                    <stop offset="100%" stopColor="#ffb43d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.28)" tickLine={false} axisLine={false} tick={{ fill: '#8d94a1', fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.28)" tickLine={false} axisLine={false} tick={{ fill: '#8d94a1', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10,10,12,0.94)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    color: '#f3f5f8',
                    fontSize: 13,
                    boxShadow: '0 18px 48px -12px rgba(0,0,0,0.6)',
                  }}
                  labelStyle={{ color: '#8d94a1', fontSize: 11, marginBottom: 4 }}
                />
                <Area type="monotone" dataKey="value" stroke="#ffb43d" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="historical-peak">
            <span className="ms-eyebrow">Historical peak</span>
            <strong>{details.historicalData.historicalPeak.value}</strong>
            <span className="text-muted">on {details.historicalData.historicalPeak.date}</span>
          </p>
        </div>

        {/* 4. Actionable Recommendations */}
        <div className="detail-card large-card recommendations-card">
          <h3><span className="card-icon">{icons.playbook}</span> Actionable Recommendations</h3>
          <div className="card-content">
            <p className="sop-row">
              <span className="ms-eyebrow">Standard procedure</span>
              <span className="sop-link highlight-value">{details.actionableRecommendations.sopLink}</span>
            </p>

            <div className="checklist-head">
              <p className="detail-subhead">Required actions</p>
              <span className="checklist-progress">{completed} of {checklist.length} done</span>
            </div>

            {/* Real checkboxes: an operator can tick off what they have
                actually carried out during the incident. */}
            <ul className="checklist">
              {checklist.map((action, index) => (
                <li key={index} className={checked[index] ? 'is-done' : ''}>
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(checked[index])}
                      onChange={() => toggleCheck(index)}
                    />
                    <span className="checklist-box" aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.5 8.5 6.5 11.5 12.5 5" />
                      </svg>
                    </span>
                    <span className="checklist-text">{action}</span>
                  </label>
                </li>
              ))}
            </ul>

            <div className="escalation-contact">
              <span className="ms-eyebrow">Escalation contact</span>
              <span className="escalation-name">{details.actionableRecommendations.escalationContact.name}</span>
              <a
                className="escalation-phone"
                href={`tel:${details.actionableRecommendations.escalationContact.phone.replace(/[^+\d]/g, '')}`}
              >
                {details.actionableRecommendations.escalationContact.phone}
              </a>
            </div>
          </div>
        </div>

        {/* 5. Audit Trail */}
        <div className="detail-card large-card audit-trail-card">
          <h3><span className="card-icon">{icons.audit}</span> Audit Trail</h3>
          <div className="card-content">
            {/* Rendered as a timeline: entries are sequential events, and a
                connected spine shows that ordering far better than bullets. */}
            <ul className="audit-list">
              {details.auditTrail.map((entry, index) => {
                const split = entry.indexOf(': ');
                const stamp = split > -1 ? entry.slice(0, split) : null;
                const text = split > -1 ? entry.slice(split + 2) : entry;

                return (
                  <li key={index}>
                    <span className="audit-icon" aria-hidden="true" />
                    <span className="audit-entry">
                      {stamp && <span className="audit-stamp">{stamp}</span>}
                      <span className="audit-text">{text}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailsPage;
