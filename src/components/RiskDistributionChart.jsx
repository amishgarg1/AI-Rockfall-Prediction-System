import React, { useState } from 'react';
import './RiskDistributionChart.css';

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const data = [
  { key: 'high', label: 'High Risk', value: 35, color: 'var(--risk-critical-vivid)' },
  { key: 'medium', label: 'Medium Risk', value: 45, color: 'var(--risk-medium-vivid)' },
  { key: 'low', label: 'Low Risk', value: 20, color: 'var(--risk-low-vivid)' },
];

/* Each ring is one circle with a dash pattern of "segment length, rest of the
   circumference", rotated so it starts where the previous one ended.
   The old version used strokeDasharray: calc(45 * 2.5 * 3.14) — a length of
   353 on a circle only 251 around — with rotations that put two segments on
   top of each other, so the drawn wedges never matched the legend. */
const buildSegments = (items) => {
  let offset = 0;

  return items.map((item) => {
    const length = (item.value / 100) * CIRCUMFERENCE;
    // -90 starts the arc at twelve o'clock instead of three.
    const rotation = -90 + (offset / 100) * 360;
    offset += item.value;

    return { ...item, length, rotation };
  });
};

const segments = buildSegments(data);

const RiskDistributionChart = () => {
  const [active, setActive] = useState(null);

  const focused = segments.find((s) => s.key === active);

  /* With nothing hovered the centre shows the high-risk share. Reading "100%
     Monitored" — the sum of the three shares — told the operator nothing;
     the proportion of sites at high risk is the number this panel exists to
     communicate. */
  const headline = focused ?? segments.find((s) => s.key === 'high');

  return (
    <div className="risk-distribution-chart-container">
      <div className="risk-chart-header">
        <h2>Risk Distribution</h2>
        <span className="ms-eyebrow">All sites</span>
      </div>

      <div className="chart-and-legend">
        <div className="donut-chart-placeholder">
          <svg viewBox="0 0 100 100" className="donut-chart-svg" role="img" aria-label="Risk distribution across monitored sites">
            {/* Track behind the segments keeps the ring visible where a
                category is zero. */}
            <circle
              className="donut-track"
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              strokeWidth="13"
            />
            {segments.map((segment) => (
              <circle
                key={segment.key}
                className={`donut-segment donut-segment--${segment.key} ${active && active !== segment.key ? 'is-dimmed' : ''}`}
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke={segment.color}
                strokeWidth="13"
                strokeLinecap="butt"
                strokeDasharray={`${segment.length.toFixed(2)} ${(CIRCUMFERENCE - segment.length).toFixed(2)}`}
                transform={`rotate(${segment.rotation} 50 50)`}
                onMouseEnter={() => setActive(segment.key)}
                onMouseLeave={() => setActive(null)}
              />
            ))}
          </svg>

          {/* Centre readout: the hovered category, or the high-risk share. */}
          <div className={`donut-center donut-center--${headline.key}`}>
            <span className="donut-center-value">{headline.value}%</span>
            <span className="donut-center-label">{headline.label}</span>
          </div>
        </div>

        <div className="chart-legend">
          {segments.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`legend-item legend-item--${item.key} ${active === item.key ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(item.key)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(item.key)}
              onBlur={() => setActive(null)}
            >
              <span className="legend-color" style={{ '--swatch': item.color }} />
              <span className="legend-label">{item.label}</span>
              <span className="legend-value">{item.value}%</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskDistributionChart;
