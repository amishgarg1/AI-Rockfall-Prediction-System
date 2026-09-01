import React, { useMemo, useState } from 'react';
import './AlertsPage.css';
import { useNavigate } from 'react-router-dom';
import Select from './Select';

import { initialAlerts } from '../data/alerts';

const severityOrder = { High: 3, Medium: 2, Low: 1 };

const icons = {
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.2 7.5-2.2 7.5h16.4S18 14.5 18 8.5Z" />
      <path d="M13.7 20a2 2 0 0 1-3.4 0" />
    </svg>
  ),
  pulse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h3.6l2.4-6 3.4 12 2.4-6H21" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4M12 17h.01" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  ),
};

/* Severity marks: a filled triangle for High, a hollow diamond for Medium, a
   dot for Low. Distinguishable by shape as well as by colour, which the
   previous version — the same ⚠ glyph in three different colours — was not. */
const severityMark = {
  High: <path d="M8 1.6 15 14H1L8 1.6Z" />,
  Medium: <path d="M8 1.8 14.2 8 8 14.2 1.8 8 8 1.8Z" />,
  Low: <circle cx="8" cy="8" r="4.6" />,
};

const AlertsPage = () => {
  const alerts = initialAlerts;
  const [filters, setFilters] = useState({
    severity: 'All',
    timeRange: 'All',
    location: 'All',
    status: 'All',
  });
  const [sortBy, setSortBy] = useState('timestamp'); // 'timestamp', 'severity', 'location'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const navigate = useNavigate();

  /* Counted from the dataset rather than written down. The summary row used
     to be a fixed object (12 new, 5 today, 3 high, 7 medium, 2 low) that
     described a different set of alerts from the list underneath it. */
  const summary = useMemo(() => {
    const bySeverity = (level) => alerts.filter((a) => a.severity === level).length;

    return {
      total: alerts.length,
      active: alerts.filter((a) => a.status === 'active').length,
      high: bySeverity('High'),
      sites: new Set(alerts.map((a) => a.location.split(' - ')[0])).size,
    };
  }, [alerts]);

  const setFilter = (name, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const setSeverity = (value) => setFilter('severity', value);

  const handleSortOrderChange = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const handleViewDetails = (id) => {
    navigate(`/alerts/${id}`);
  };

  const getSeverityIcon = (severity) => (
    <span className={`severity-mark severity-mark--${severity.toLowerCase()}`} aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="currentColor">
        {severityMark[severity]}
      </svg>
    </span>
  );

  const getStatusBadge = (status) => {
    const labels = {
      active: 'Active',
      acknowledged: 'Acknowledged',
      resolved: 'Resolved',
    };
    if (!labels[status]) return null;

    return <span className={`status-badge status-${status}`}>{labels[status]}</span>;
  };

  const filterAndSortAlerts = () => {
    let filtered = [...alerts];

    // Filter by severity
    if (filters.severity !== 'All') {
      filtered = filtered.filter((alert) => alert.severity === filters.severity);
    }

    // Filter by time range (simplified for demonstration)
    if (filters.timeRange === 'Last Day') {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      filtered = filtered.filter((alert) => new Date(alert.timestamp) > oneDayAgo);
    } else if (filters.timeRange === 'Last Week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter((alert) => new Date(alert.timestamp) > oneWeekAgo);
    }

    // Filter by location
    if (filters.location !== 'All') {
      filtered = filtered.filter((alert) => alert.location === filters.location);
    }

    // Filter by status
    if (filters.status !== 'All') {
      filtered = filtered.filter((alert) => alert.status === filters.status);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'timestamp') {
        comparison = new Date(a.timestamp) - new Date(b.timestamp);
      } else if (sortBy === 'severity') {
        comparison = severityOrder[a.severity] - severityOrder[b.severity];
      } else if (sortBy === 'location') {
        comparison = a.location.localeCompare(b.location);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const displayedAlerts = filterAndSortAlerts();
  const uniqueLocations = [...new Set(initialAlerts.map(alert => alert.location))];

  const kpis = [
    { key: 'total', tone: '', icon: icons.bell, label: 'Logged alerts', value: summary.total },
    { key: 'active', tone: 'high', icon: icons.pulse, label: 'Currently active', value: summary.active },
    { key: 'high', tone: 'critical', icon: icons.warning, label: 'High severity', value: summary.high },
    { key: 'sites', tone: 'medium', icon: icons.pin, label: 'Sites affected', value: summary.sites },
  ];

  return (
    <div className="alerts-page">
      <header className="alerts-page-header">
        <div className="alerts-page-title-container">
          <h1 className="alerts-page-title">Alerts</h1>
        </div>
        <span className="ms-live">
          <span className="ms-dot ms-dot--critical" aria-hidden="true" />
          {summary.active} active
        </span>
      </header>

      <div className="alerts-summary">
        {kpis.map((kpi, index) => (
          <div
            key={kpi.key}
            className={`kpi-card ${kpi.tone} ms-enter-card`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="kpi-header">
              <span className="kpi-icon" aria-hidden="true">{kpi.icon}</span>
              <span className="label">{kpi.label}</span>
            </div>
            <span className="value">{kpi.value}</span>
          </div>
        ))}
      </div>

      <h2 className="section-title">Detailed Alert List</h2>

      <div className="filters-sort-container">
        {/* Severity is the filter that gets used most, so it is a row of
            one-click chips rather than another dropdown. */}
        <div className="severity-chips" role="group" aria-label="Filter by severity">
          {['All', 'High', 'Medium', 'Low'].map((level) => (
            <button
              key={level}
              type="button"
              className={`severity-chip severity-chip--${level.toLowerCase()} ${filters.severity === level ? 'is-active' : ''}`}
              onClick={() => setSeverity(level)}
              aria-pressed={filters.severity === level}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="time-range-filter">Time Range</label>
            <Select
              id="time-range-filter"
              ariaLabel="Filter by time range"
              value={filters.timeRange}
              onChange={(v) => setFilter('timeRange', v)}
              options={[
                { value: 'All', label: 'All' },
                { value: 'Last Day', label: 'Last Day' },
                { value: 'Last Week', label: 'Last Week' },
              ]}
            />
          </div>

          <div className="filter-group filter-group--wide">
            <label htmlFor="location-filter">Location</label>
            <Select
              id="location-filter"
              ariaLabel="Filter by location"
              value={filters.location}
              onChange={(v) => setFilter('location', v)}
              options={[
                { value: 'All', label: 'All' },
                ...uniqueLocations.map((loc) => ({ value: loc, label: loc })),
              ]}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <Select
              id="status-filter"
              ariaLabel="Filter by status"
              value={filters.status}
              onChange={(v) => setFilter('status', v)}
              options={[
                { value: 'All', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'acknowledged', label: 'Acknowledged' },
                { value: 'resolved', label: 'Resolved' },
              ]}
            />
          </div>

          <div className="sort-group">
            <label htmlFor="sort-by">Sort By</label>
            <div className="sort-controls">
              <Select
                id="sort-by"
                ariaLabel="Sort by"
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: 'timestamp', label: 'Timestamp' },
                  { value: 'severity', label: 'Severity' },
                  { value: 'location', label: 'Location' },
                ]}
              />
              <button
                onClick={handleSortOrderChange}
                className="sort-order-button"
                aria-label={sortOrder === 'asc' ? 'Sort ascending, switch to descending' : 'Sort descending, switch to ascending'}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={sortOrder === 'asc' ? 'is-asc' : ''}>
                  <path d="M8 3.5v9M4.5 9 8 12.5 11.5 9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="alert-list">
        {displayedAlerts.length > 0 ? (
          displayedAlerts.map((alert, index) => (
            <article
              key={alert.id}
              className={`alert-item alert-item--${alert.severity.toLowerCase()} ms-enter`}
              style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
            >
              <span className="alert-item-rail" aria-hidden="true" />

              <div className="alert-item-main">
                <div className="alert-header">
                  {getSeverityIcon(alert.severity)}
                  <span className={`severity-text ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                  {getStatusBadge(alert.status)}
                  <span className="timestamp">{alert.timestamp}</span>
                </div>

                <div className="alert-body">
                  <p className="alert-location">{alert.location}</p>
                  <p className="alert-description">{alert.description}</p>
                </div>
              </div>

              <div className="alert-actions">
                <button className="action-button view-details" onClick={() => handleViewDetails(alert.id)}>
                  View Details
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 3.5 10.5 8 6 12.5" />
                  </svg>
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="no-alerts-message">No alerts found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
