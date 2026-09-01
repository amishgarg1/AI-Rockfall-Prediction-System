import React, { useState } from 'react';
import './GroundVibrationChart.css';

/* Peak Particle Velocity, hourly peaks over the last 24 hours, in mm/s.
   1.0 mm/s is the blasting tremor limit the platform alerts on — the same
   figure the sensor thresholds use. The two spikes are the scheduled blasts. */
const THRESHOLD = 1.0;

const readings = [
  0.12, 0.09, 0.11, 0.08, 0.14, 0.19, 0.31, 0.44,
  0.68, 1.24, 0.82, 0.41, 0.27, 0.22, 0.35, 0.52,
  0.71, 1.08, 0.94, 0.58, 0.33, 0.21, 0.17, 0.14,
];

const CHART_W = 300;
const CHART_H = 96;
const PEAK = 1.4; // headroom above the highest reading so bars never clip

const GroundVibrationChart = () => {
  const [hovered, setHovered] = useState(null);

  const latest = readings[readings.length - 1];
  const peak = Math.max(...readings);
  const breaches = readings.filter((v) => v > THRESHOLD).length;

  const barWidth = CHART_W / readings.length;
  const thresholdY = CHART_H - (THRESHOLD / PEAK) * CHART_H;

  const shown = hovered === null ? latest : readings[hovered];
  const shownLabel = hovered === null ? 'Latest' : `${23 - hovered}h ago`;

  return (
    <div className="ground-vibration-chart">
      <div className="gv-header">
        <div className="gv-heading">
          <h2>Ground Vibration</h2>
          <h3>Peak particle velocity · last 24h</h3>
        </div>
        <span className={`ms-chip ${breaches > 0 ? 'ms-chip--high' : 'ms-chip--low'}`}>
          {breaches > 0 ? `${breaches} over limit` : 'Within limit'}
        </span>
      </div>

      <div className="gv-readout">
        <span className="gv-value">
          {shown.toFixed(2)}
          <span className="gv-unit">mm/s</span>
        </span>
        <span className="gv-readout-label">{shownLabel} · limit {THRESHOLD.toFixed(1)} mm/s</span>
      </div>

      <div className="gv-chart">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          className="gv-svg"
          role="img"
          aria-label={`Ground vibration over 24 hours, peak ${peak.toFixed(2)} millimetres per second`}
        >
          {/* Threshold line. Anything crossing it is a reportable tremor. */}
          <line
            className="gv-threshold"
            x1="0"
            y1={thresholdY}
            x2={CHART_W}
            y2={thresholdY}
          />

          {readings.map((value, index) => {
            const height = Math.max((value / PEAK) * CHART_H, 2);
            const over = value > THRESHOLD;

            return (
              <rect
                key={index}
                className={`gv-bar ${over ? 'gv-bar--over' : ''} ${hovered === index ? 'is-hovered' : ''}`}
                x={index * barWidth + barWidth * 0.18}
                y={CHART_H - height}
                width={barWidth * 0.64}
                height={height}
                rx="1.5"
                style={{ animationDelay: `${index * 16}ms` }}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default GroundVibrationChart;
