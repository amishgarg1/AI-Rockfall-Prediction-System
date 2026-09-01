import React, { useEffect, useRef, useState } from 'react';
import './StatusCard.css';

/* Counts from zero to the target on mount. A KPI that lands on its number
   instead of appearing at it is what makes the row feel instrumented rather
   than printed. Cubic ease-out so it decelerates into place.
   Anyone who has asked for reduced motion gets the final value immediately. */
const useCountUp = (target, duration = 1100) => {
  const [value, setValue] = useState(() => {
    const reduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return reduced ? target : 0;
  });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return undefined;
    }

    let frame;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
};

/* Turns a series into a normalised polyline plus a closed area path.
   Flat series would divide by zero, so the range floors at 1. */
const buildSpark = (series, width = 108, height = 30) => {
  if (!series || series.length < 2) return null;

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = Math.max(max - min, 1);
  const step = width / (series.length - 1);

  const points = series.map((n, i) => {
    const x = i * step;
    const y = height - ((n - min) / range) * (height - 4) - 2;
    return [x, y];
  });

  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;

  return { line, area, last: points[points.length - 1] };
};

const StatusCard = ({ icon, title, value, type, delta, deltaLabel, trend, index = 0 }) => {
  const numeric = Number(String(value).replace(/[^0-9.-]/g, ''));
  const isNumeric = Number.isFinite(numeric);
  const displayValue = useCountUp(isNumeric ? numeric : 0);

  const spark = buildSpark(trend);
  const sparkRef = useRef(null);

  /* Unique gradient id per card — several sparklines share the page and
     duplicate ids would make them all paint with the first card's colours. */
  const gradientId = `spark-${type}`;

  const deltaDirection = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';

  return (
    <article
      className={`status-card ${type} ms-enter-card`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Colour wash bound to the card's risk hue, brightened on hover. */}
      <span className="status-card-wash" aria-hidden="true" />

      <header className="status-card-head">
        <span className="card-icon" aria-hidden="true">{icon}</span>
        {typeof delta === 'number' && (
          <span className={`card-delta card-delta--${deltaDirection}`}>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {deltaDirection === 'down'
                ? <path d="M6 2v8M2.5 6.5 6 10l3.5-3.5" />
                : <path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" />}
            </svg>
            {delta > 0 ? '+' : ''}{delta}
          </span>
        )}
      </header>

      <div className="status-card-body">
        <p className="card-value">{isNumeric ? displayValue.toLocaleString('en-IN') : value}</p>
        <p className="card-title">{title}</p>
      </div>

      {spark && (
        <svg
          className="card-spark"
          ref={sparkRef}
          viewBox="0 0 108 30"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.32" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="card-spark-area" d={spark.area} fill={`url(#${gradientId})`} />
          <path className="card-spark-line" d={spark.line} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle className="card-spark-head" cx={spark.last[0]} cy={spark.last[1]} r="2.2" fill="currentColor" />
        </svg>
      )}

      {deltaLabel && <p className="card-footnote">{deltaLabel}</p>}
    </article>
  );
};

export default StatusCard;
