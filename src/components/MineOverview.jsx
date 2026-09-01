import React from 'react';
import './MineOverview.css';

/* One icon per instrument, keyed by sensor id. The dataset ships an `icon`
   field holding HTML entities (an hourglass for strain, an alarm clock for
   vibration) that were injected with dangerouslySetInnerHTML — both a poor
   match for what they labelled and an unnecessary injection point. */
const sensorIcons = {
  strain: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h3.5l2.5-6 3 12 2.5-6H21" />
    </svg>
  ),
  temperature: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 13.6V5a1.9 1.9 0 1 0-3.8 0v8.6a4 4 0 1 0 3.8 0Z" />
    </svg>
  ),
  rainfall: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 12.5a4 4 0 0 0-.8-7.9 5.6 5.6 0 0 0-10.6 1.8A3.7 3.7 0 0 0 6.5 13" />
      <path d="M8 16.5 7 19M12 16.5 11 19M16 16.5 15 19" />
    </svg>
  ),
  pore_pressure: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5s5.5 5.6 5.5 9.4a5.5 5.5 0 1 1-11 0C6.5 9.1 12 3.5 12 3.5Z" />
      <path d="M9.6 13.4a2.6 2.6 0 0 0 2.6 2.6" />
    </svg>
  ),
  slope_angle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 19.5h17L3.5 5.5v14Z" />
      <path d="M8.5 19.5a5 5 0 0 0-1.6-3.7" />
    </svg>
  ),
  vibration: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h2.2l2-5 3 10 2.4-7.5L15 14l1.6-2H21" />
    </svg>
  ),
};

const statusIcons = {
  success: <path d="M5 12.5 9.5 17 19 7.5" />,
  warning: <><path d="M12 6.5v6" /><path d="M12 16.5h.01" /></>,
  error: <><path d="M6.5 6.5 17.5 17.5" /><path d="M17.5 6.5 6.5 17.5" /></>,
};

/* Reading and limit both arrive as display strings ("78µε", "75µε"), so the
   numeric part has to come back out to show how close the sensor is to its
   threshold. Non-numeric readings simply get no meter. */
const toNumber = (raw) => {
  const match = String(raw ?? '').match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const MineOverview = ({ mineData, sensorData }) => {
  const getStatusIcon = (status) => {
    if (!statusIcons[status]) return null;

    return (
      <span className={`status-icon ${status}`} aria-label={status}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {statusIcons[status]}
        </svg>
      </span>
    );
  };

  const breaching = sensorData.filter((s) => s.status === 'error').length;

  return (
    <div className="mine-overview-container">
      <div className="mine-header">
        <div className="mine-info">
          <h2>{mineData.name}</h2>
          <p className="mine-location">{mineData.location}</p>
          <p className="mine-coordinates">{mineData.coordinates}</p>
        </div>
        <div className="mine-status">
          <span className={`status-badge ${breaching > 0 ? 'status-badge--alert' : ''}`}>
            <span className={`ms-dot ${breaching > 0 ? 'ms-dot--critical' : 'ms-dot--low'}`} aria-hidden="true" />
            {mineData.status}
          </span>
          <span className="last-inspection">Last inspection: {mineData.lastInspection}</span>
          <span className="breach-summary">
            {breaching > 0
              ? `${breaching} of ${sensorData.length} channels over limit`
              : `All ${sensorData.length} channels nominal`}
          </span>
        </div>
      </div>

      <div className="sensor-cards-grid">
        {sensorData.map((sensor, index) => {
          const value = toNumber(sensor.value);
          const limit = toNumber(sensor.threshold);
          const ratio = value !== null && limit ? value / limit : null;
          const meterWidth = ratio === null ? 0 : Math.min(ratio * 100, 100);

          return (
            <div
              key={sensor.id}
              className={`sensor-card ${sensor.status} ms-enter-card`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="sensor-header">
                <span className="sensor-icon" aria-hidden="true">
                  {sensorIcons[sensor.id] ?? sensorIcons.strain}
                </span>
                <h3 className="sensor-name">{sensor.name}</h3>
                {getStatusIcon(sensor.status)}
              </div>

              <div className="sensor-details">
                <p className="sensor-value">{sensor.value}</p>
                <p className="sensor-threshold">Threshold: {sensor.threshold}</p>
              </div>

              {ratio !== null && (
                <div className="sensor-meter-block">
                  <div className="ms-meter sensor-meter">
                    <div className="ms-meter-fill sensor-meter-fill" style={{ width: `${meterWidth}%` }} />
                    {/* Marks the limit itself, so a bar that stops short of the
                        tick is visibly inside tolerance. */}
                    <span className="sensor-meter-limit" aria-hidden="true" />
                  </div>
                  <p className="sensor-meter-label">
                    {Math.round(ratio * 100)}% of limit
                    {ratio > 1 && <span className="sensor-over"> · exceeded</span>}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MineOverview;
