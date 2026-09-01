import React, { useMemo, useState } from 'react';
import './IndiaRiskMap.css';
import { useNavigate } from 'react-router-dom';
import { initialAlerts } from '../data/alerts';

/* The map is drawn in a 380 x 420 viewBox. Everything — coastline and markers
   alike — goes through this one projection, so a site plotted from its real
   latitude and longitude lands where it actually is relative to the coast.
   Equirectangular, with longitude squeezed by cos(23°) to stop the country
   coming out too wide at Indian latitudes. */
const LON_MIN = 67.5;
const LON_MAX = 97.5;
const LAT_MIN = 7.8;
const LAT_MAX = 37.2;

const project = (lon, lat) => [
  20 + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 340,
  18 + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 384,
];

/* Traced clockwise from Kashmir. Roughly 110 vertices where the previous
   version had 47, which is the difference between a shape that reads as
   "some country" and one that reads as India: the Kutch and Saurashtra
   peninsulas, the Konkan coast's slow taper, the Kanyakumari point, the
   Coromandel bulge at Chennai, the Sundarbans delta, the notch India makes
   around Bangladesh, and the north-eastern states.

   Still a generalised coastline, not survey data — enough detail to be
   recognisable at 400px, few enough points to stay one readable path. */
const OUTLINE = [
  // Kashmir and the northern salient
  [73.9, 34.6], [74.6, 34.8], [76.0, 34.7], [76.9, 35.6], [77.8, 35.5],
  [78.9, 34.3], [79.5, 33.2], [79.2, 32.5], [78.7, 31.9], [79.1, 31.0],
  // Himalayan front, west to east
  [80.1, 30.6], [81.0, 30.2], [82.0, 29.3], [82.8, 28.3], [84.2, 27.4],
  [85.8, 26.6], [87.0, 26.4], [88.1, 26.5],
  // Sikkim
  [88.2, 27.9], [88.9, 27.3], [89.4, 26.8],
  // Along Bhutan into Assam
  [91.5, 26.8], [92.1, 26.9],
  // Arunachal Pradesh
  [92.4, 27.9], [94.0, 27.6], [95.3, 28.3], [96.4, 29.4], [97.4, 28.3],
  [97.1, 27.1], [96.2, 25.4],
  // Nagaland, Manipur, Mizoram
  [95.1, 24.0], [94.6, 23.5], [93.4, 23.9], [93.2, 22.2], [92.6, 22.0],
  // Tripura, then north up the Bangladesh border
  [91.6, 22.9], [91.4, 23.7], [92.1, 24.9], [91.0, 25.2], [89.8, 25.9],
  // Down the western side of Bangladesh to the delta
  [88.6, 24.5], [88.7, 23.5], [88.9, 22.6], [88.2, 21.7],
  // Odisha coast
  [87.2, 21.6], [86.5, 20.8], [85.1, 19.6], [84.5, 19.0], [83.5, 18.3],
  // Andhra coast and the Godavari–Krishna bulge
  [82.3, 17.0], [81.2, 16.3], [80.9, 15.9], [80.2, 15.5], [80.1, 14.5],
  // Coromandel
  [80.2, 13.5], [80.3, 13.1], [79.9, 12.0], [79.8, 11.4], [79.4, 10.7],
  [79.2, 10.3], [78.2, 9.3], [78.1, 8.9],
  // Kanyakumari
  [77.5, 8.1],
  // Kerala and the Konkan coast, south to north
  [77.1, 8.3], [76.5, 8.9], [76.2, 9.6], [75.9, 10.3], [75.6, 11.2],
  [75.2, 12.0], [74.7, 12.8], [74.3, 13.8], [74.0, 14.5], [73.7, 15.4],
  [73.4, 16.2], [73.1, 17.0], [72.9, 17.9], [72.8, 18.9], [72.7, 19.8],
  [72.6, 20.7], [72.9, 21.4], [72.6, 21.7],
  // Saurashtra
  [72.2, 21.1], [71.5, 20.8], [70.6, 20.8], [70.0, 21.0], [69.2, 21.7],
  [69.0, 22.3], [69.8, 22.5], [70.5, 22.8],
  // Kutch
  [69.8, 23.0], [68.8, 23.5], [68.2, 23.8], [68.4, 24.3], [69.5, 24.3],
  // Thar and the western border
  [70.6, 25.7], [70.1, 26.5], [69.9, 27.2], [70.6, 28.0], [72.3, 28.8],
  [73.4, 29.9], [74.5, 31.0], [74.6, 31.9], [75.3, 32.3], [74.6, 32.8],
  [74.3, 34.0],
];

/* Sri Lanka. Not part of the dataset, but its absence is conspicuous — the
   gap off the southern tip is a large part of how the subcontinent reads. */
const SRI_LANKA = [
  [79.9, 9.8], [80.5, 9.6], [81.0, 9.0], [81.5, 8.5], [81.9, 8.0],
  [81.8, 7.0], [81.4, 6.4], [80.9, 5.9], [80.2, 6.0], [79.9, 6.8],
  [79.7, 8.0], [79.8, 9.2],
];

const toPath = (points) => `${points.map(([lon, lat], i) => {
  const [x, y] = project(lon, lat);
  return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(' ')} Z`;

const outlinePath = toPath(OUTLINE);
const sriLankaPath = toPath(SRI_LANKA);

const severityRank = { High: 3, Medium: 2, Low: 1 };

const IndiaRiskMap = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  /* Markers come from the alert dataset rather than from hardcoded dots, so
     the map cannot disagree with the alerts page. One marker per site, taking
     the most severe alert that site currently has. */
  const sites = useMemo(() => {
    const bySite = new Map();

    initialAlerts.forEach((alert) => {
      const coords = alert.details?.preciseCoordinates;
      if (!coords) return;

      const name = alert.location.split(' - ')[0];
      const existing = bySite.get(name);

      if (!existing || severityRank[alert.severity] > severityRank[existing.severity]) {
        bySite.set(name, {
          id: alert.id,
          name,
          severity: alert.severity,
          status: alert.status,
          lon: coords.lon,
          lat: coords.lat,
        });
      }
    });

    return [...bySite.values()].map((site) => {
      const [x, y] = project(site.lon, site.lat);
      return { ...site, x, y };
    });
  }, []);

  const counts = useMemo(() => ({
    High: sites.filter((s) => s.severity === 'High').length,
    Medium: sites.filter((s) => s.severity === 'Medium').length,
    Low: sites.filter((s) => s.severity === 'Low').length,
  }), [sites]);

  return (
    <div className="india-risk-map-container">
      <div className="map-header">
        <div className="map-heading">
          <h2>Live India Mining Risk Map</h2>
          <p className="map-subtitle">{sites.length} monitored sites · click a site to open its incident</p>
        </div>
        <div className="live-updates">
          <span className="ms-dot" aria-hidden="true" />
          <span>Live Updates</span>
        </div>
      </div>

      <div className="map-content">
        <div className="india-map-placeholder">
          <svg viewBox="0 0 380 420" className="india-map-svg" role="img" aria-label="Risk levels across monitored Indian mining sites">
            <defs>
              {/* Land: lit from the north-west, falling away to near-black in
                  the south-east, so the mass has a direction to it. */}
              <linearGradient id="landFill" x1="0.15" y1="0" x2="0.85" y2="1">
                <stop offset="0%" stopColor="#3a3b43" />
                <stop offset="45%" stopColor="#272830" />
                <stop offset="100%" stopColor="#14151a" />
              </linearGradient>

              {/* A warm wash over the north, picking up the platform's amber. */}
              <radialGradient id="landWarm" cx="0.42" cy="0.18" r="0.7">
                <stop offset="0%" stopColor="#f39c12" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#f39c12" stopOpacity="0" />
              </radialGradient>

              {/* Coastline: brighter along the top edge, fading south. */}
              <linearGradient id="coastStroke" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.62" />
                <stop offset="60%" stopColor="#ffffff" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
              </linearGradient>

              {/* Shelf glow — a blurred copy of the landmass sitting behind it,
                  which is what separates land from sea without drawing a
                  literal border. */}
              <filter id="shelf" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="6" />
              </filter>

              <filter id="markerGlow" x="-160%" y="-160%" width="420%" height="420%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Graticule behind the landmass — reads as a chart surface. */}
            <g className="map-graticule" aria-hidden="true">
              {[10, 15, 20, 25, 30, 35].map((lat) => {
                const [, y] = project(LON_MIN, lat);
                return <line key={`lat${lat}`} x1="14" y1={y} x2="366" y2={y} />;
              })}
              {[70, 75, 80, 85, 90, 95].map((lon) => {
                const [x] = project(lon, LAT_MAX);
                return <line key={`lon${lon}`} x1={x} y1="12" x2={x} y2="408" />;
              })}
            </g>

            {/* Continental shelf */}
            <path className="map-shelf" d={outlinePath} filter="url(#shelf)" />
            <path className="map-shelf" d={sriLankaPath} filter="url(#shelf)" />

            {/* Landmass */}
            <path className="map-land" d={outlinePath} fill="url(#landFill)" />
            <path className="map-land-warm" d={outlinePath} fill="url(#landWarm)" />
            <path className="india-outline" d={outlinePath} fill="none" stroke="url(#coastStroke)" />

            <path className="map-land" d={sriLankaPath} fill="url(#landFill)" />
            <path className="india-outline" d={sriLankaPath} fill="none" stroke="url(#coastStroke)" />

            {/* Markers.
                The translate lives on an outer <g> that carries no animation,
                and the animated class sits on an inner <g>. An SVG transform
                attribute maps onto the CSS transform property, so animating
                transform on the same element replaces the translate outright —
                which sent every marker to the top-left corner of the viewBox
                the moment its entrance played. */}
            {sites.map((site, index) => {
              const level = site.severity.toLowerCase();
              const isHovered = hovered?.id === site.id;

              return (
                <g key={site.id} transform={`translate(${site.x} ${site.y})`}>
                  <g
                    className={`map-marker map-marker--${level} ${isHovered ? 'is-hovered' : ''}`}
                    onClick={() => navigate(`/alerts/${site.id}`)}
                    onMouseEnter={() => setHovered(site)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(site)}
                    onBlur={() => setHovered(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${site.name}, ${site.severity} risk`}
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    {/* Expanding halo, then the pin itself. */}
                    <circle className="marker-halo" r="5" />
                    <circle className="marker-ring" r="6.5" />
                    <circle className="marker-core" r="3.6" filter="url(#markerGlow)" />
                    {/* Generous invisible hit area — a 4px dot is not clickable. */}
                    <circle className="marker-hit" r="13" fill="transparent" />
                  </g>
                </g>
              );
            })}
          </svg>

          {hovered && (
            <div
              className={`risk-tooltip risk-tooltip--${hovered.severity.toLowerCase()}`}
              style={{
                left: `${(hovered.x / 380) * 100}%`,
                top: `${(hovered.y / 420) * 100}%`,
              }}
            >
              <span className="risk-tooltip-name">{hovered.name}</span>
              <span className="risk-tooltip-meta">
                {hovered.severity} risk · {hovered.status}
              </span>
            </div>
          )}
        </div>

        <ul className="map-legend">
          {[
            { key: 'high', label: 'High', count: counts.High },
            { key: 'medium', label: 'Medium', count: counts.Medium },
            { key: 'low', label: 'Low', count: counts.Low },
          ].map((item) => (
            <li key={item.key} className={`map-legend-item map-legend-item--${item.key}`}>
              <span className="map-legend-swatch" aria-hidden="true" />
              <span className="map-legend-label">{item.label}</span>
              <span className="map-legend-count">{item.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default IndiaRiskMap;
