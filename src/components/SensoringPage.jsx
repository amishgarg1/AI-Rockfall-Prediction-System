import React, { useLayoutEffect, useRef, useState } from 'react';
import './SensoringPage.css';
import { useNavigate } from 'react-router-dom';
import { initialAlerts } from '../data/alerts';

const locationsData = [
  {
    id: 'loc1',
    name: 'Jharia Coalfield - Section A',
    details: 'Details for Jharia Coalfield - Section A. This includes comprehensive sensor data, historical trends, and real-time alerts.',
  },
  {
    id: 'loc2',
    name: 'Raniganj Coalfield - Area B',
    details: 'Details for Raniganj Coalfield - Area B. This includes comprehensive sensor data, historical trends, and real-time alerts.',
  },
  {
    id: 'loc3',
    name: 'Bokaro Coalfield - Sector C',
    details: 'Details for Bokaro Coalfield - Sector C. This includes comprehensive sensor data, historical trends, and real-time alerts.',
  },
  {
    id: 'loc4',
    name: 'Singrauli Coalfield - Block D',
    details: 'Details for Singrauli Coalfield - Block D. This includes comprehensive sensor data, historical trends, and real-time alerts.',
  },
  {
    id: 'loc5',
    name: 'Talcher Coalfield - Zone E',
    details: 'Details for Talcher Coalfield - Zone E. This includes comprehensive sensor data, historical trends, and real-time alerts.',
  },
  {
    id: 'loc6',
    name: 'Korba Coalfield - Pit F',
    details: 'Details for Korba Coalfield - Pit F. This includes comprehensive sensor data, historical trends, and real-time alerts.',
  },
];

/* Worst open alert per site, looked up by the site name before the dash. A
   site with nothing logged against it is nominal rather than unknown. */
const severityRank = { High: 3, Medium: 2, Low: 1 };

const statusForSite = (siteName) => {
  const base = siteName.split(' - ')[0];

  const worst = initialAlerts
    .filter((alert) => alert.location.split(' - ')[0] === base && alert.status !== 'resolved')
    .sort((a, b) => severityRank[b.severity] - severityRank[a.severity])[0];

  if (!worst) return { key: 'nominal', label: 'Nominal' };
  return { key: worst.severity.toLowerCase(), label: `${worst.severity} risk` };
};

const PAGE_SIZE = 3;
const CARD_EXIT_MS = 240;

const SensoringPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleLocations, setVisibleLocations] = useState(PAGE_SIZE);
  const [exiting, setExiting] = useState(false);
  const [settling, setSettling] = useState(false);
  const navigate = useNavigate();

  const frameRef = useRef(null);
  const gridRef = useRef(null);
  /* How many cards were on screen before the last change, so newly revealed
     ones stagger from zero instead of inheriting a delay from their absolute
     position — the fourth card should not wait 200ms just because it is
     fourth in the list. */
  const previousCount = useRef(PAGE_SIZE);

  const filteredLocations = locationsData.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* Height is animated only while a row is being added or removed, and the
     frame goes back to `auto` the moment it lands. An earlier version held a
     measured height permanently in state: the first measurement happened before
     the grid had its real width, latched a one-column height of ~776px, and
     since the grid never resized again the observer had nothing to correct it
     with — leaving a tall empty gap under the cards. Owning the height only for
     the duration of the transition means reflows the component knows nothing
     about (window resize, font loading, filtering) need no handling at all. */
  const beginHeightTransition = () => {
    const frame = frameRef.current;
    const grid = gridRef.current;
    if (!frame || !grid) return;

    frame.style.height = `${grid.offsetHeight}px`;
    setSettling(true);
  };

  /* Runs after the new card count is in the DOM but before paint, so the frame
     transitions from the height pinned above to the height it needs now. */
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const grid = gridRef.current;
    if (!frame || !grid || !settling) return;

    frame.style.height = `${grid.offsetHeight}px`;
  }, [visibleLocations, settling]);

  const endHeightTransition = (event) => {
    if (event.propertyName !== 'height') return;
    if (frameRef.current) frameRef.current.style.height = '';
    setSettling(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLocationClick = (id) => {
    navigate(`/sensors/${id}`); // Navigate to sensors page with specific location ID
  };

  const handleViewMore = () => {
    previousCount.current = visibleLocations;
    beginHeightTransition();
    setVisibleLocations((prev) => prev + PAGE_SIZE);
  };

  /* Collapsing plays the cards' exit first and only then drops them from the
     tree. Unmounting immediately gave them nothing to animate with — the rows
     simply blinked out. The frame then closes over the space they left. */
  const handleViewLess = () => {
    setExiting(true);
    setTimeout(() => {
      previousCount.current = PAGE_SIZE;
      beginHeightTransition();
      setVisibleLocations(PAGE_SIZE);
      setExiting(false);
    }, CARD_EXIT_MS);
  };

  const isExpanded = visibleLocations >= filteredLocations.length;

  return (
    <div className="sensoring-page">
      <header className="sensoring-page-header">
        <div className="sensoring-page-title-container">
          <h1 className="sensoring-page-title">Mining Locations</h1>
        </div>
        <span className="ms-live">
          <span className="ms-dot" aria-hidden="true" />
          Live feed
        </span>
      </header>

      <div className="search-bar-container">
        <span className="search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4 4" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search mining locations..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          aria-label="Search mining locations"
        />
        {searchTerm && (
          <button
            type="button"
            className="search-clear"
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
          >
            &times;
          </button>
        )}
      </div>

      {filteredLocations.length === 0 ? (
        <p className="locations-empty">No mining location matches that search.</p>
      ) : (
        <div
          className={`locations-grid-frame ${settling ? 'is-settling' : ''}`}
          ref={frameRef}
          onTransitionEnd={endHeightTransition}
        >
        <div className="locations-grid" ref={gridRef}>
          {filteredLocations.slice(0, visibleLocations).map((location, index) => {
            const status = statusForSite(location.name);
            const isNew = index >= previousCount.current;
            const isLeaving = exiting && index >= PAGE_SIZE;

            return (
              <button
                type="button"
                key={location.id}
                className={[
                  'location-cards',
                  `location-cards--${status.key}`,
                  isLeaving ? 'is-leaving' : 'ms-enter-card',
                ].join(' ')}
                style={{
                  animationDelay: isLeaving
                    ? `${(index - PAGE_SIZE) * 40}ms`
                    : `${(isNew ? index - previousCount.current : index) * 50}ms`,
                }}
                onClick={() => handleLocationClick(location.id)}
              >
                <div className="card-header">
                  <div className="location-name-group">
                    <h3 className="location-name">{location.name.split(' - ')[0]}</h3>
                    <p className="location-sub-name">{location.name.split(' - ')[1]}</p>
                  </div>
                  <span className={`location-status location-status--${status.key}`}>
                    <span className="location-status-dot" aria-hidden="true" />
                    {status.label}
                  </span>
                </div>
                <p className="location-details">{location.details}</p>
                <span className="location-cta">
                  Open telemetry
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 3.5 10.5 8 6 12.5" />
                  </svg>
                </span>
              </button>
            );
          })}
        </div>
        </div>
      )}
      {filteredLocations.length > PAGE_SIZE && (
        <div className="view-buttons">
          {/* One button rather than two swapped branches: React keeps the same
              element, so the label changes in place and the control does not
              remount and lose its transitions mid-interaction. */}
          <button
            type="button"
            className="view-more-button"
            onClick={isExpanded ? handleViewLess : handleViewMore}
            aria-expanded={isExpanded}
          >
            <span className="view-more-label">{isExpanded ? 'View Less' : 'View More'}</span>
            <svg
              className={`view-more-chevron ${isExpanded ? 'is-up' : ''}`}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 6.5 8 10.5 12 6.5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default SensoringPage;
