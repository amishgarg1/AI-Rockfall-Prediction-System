import React, { useState } from 'react';
import './AlertsPage.css';
import { useNavigate } from 'react-router-dom';

import { initialAlerts } from '../data/alerts';

const AlertsPage = () => {
  const alertsSummary = {
    totalNewAlerts: 12,
    alertsToday: 5,
    highSeverity: 3,
    mediumSeverity: 7,
    lowSeverity: 2,
  };

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSortOrderChange = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const handleViewDetails = (id) => {
    navigate(`/alerts/${id}`);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'High':
        return <span style={{ color: '#e53e3e' }}>&#9888;</span>; // Warning sign
      case 'Medium':
        return <span style={{ color: '#dd6b20' }}>&#9888;</span>; // Warning sign
      case 'Low':
        return <span style={{ color: '#48bb78' }}>&#9998;</span>; // Info sign (pencil icon for resolved/low severity alerts)
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    let badgeClass = '';
    let badgeText = '';
    switch (status) {
      case 'active':
        badgeClass = 'status-active';
        badgeText = 'Active';
        break;
      case 'acknowledged':
        badgeClass = 'status-acknowledged';
        badgeText = 'Acknowledged';
        break;
      case 'resolved':
        badgeClass = 'status-resolved';
        badgeText = 'Resolved';
        break;
      default:
        return null;
    }
    return <span className={`status-badge ${badgeClass}`}>{badgeText}</span>;
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
        const severityOrder = { High: 3, Medium: 2, Low: 1 };
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

  return (
    <div className="alerts-page">
      <header className="alerts-page-header">
        <div className="alerts-page-title-container">
          <h1 className="alerts-page-title">Alerts Overview</h1>
          <div className="alerts-page-title-underline"></div>
        </div>
      </header>
      
      <div className="alerts-summary">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-icon">&#x1F514;</span> {/* Bell icon */}
            <span className="label">Total New Alerts</span>
            </div>
          <span className="value">{alertsSummary.totalNewAlerts}</span>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-icon">&#x23F0;</span> {/* Clock icon */}
            <span className="label">Alerts Today</span>
          </div>
          <span className="value">{alertsSummary.alertsToday}</span>
        </div>
        <div className="kpi-card high">
          <div className="kpi-header">
            <span className="kpi-icon high-severity-icon">&#x26A0;</span> {/* Warning icon */}
            <span className="label">High Severity</span>
          </div>
          <span className="value">{alertsSummary.highSeverity}</span>
        </div>
        <div className="kpi-card medium">
          <div className="kpi-header">
            <span className="kpi-icon medium-severity-icon">&#x25C6;</span> {/* Diamond icon */}
            <span className="label">Medium Severity</span>
          </div>
          <span className="value">{alertsSummary.mediumSeverity}</span>
        </div>
        
        <div className="kpi-card low">
          <div className="kpi-header">
            <span className="kpi-icon low-severity-icon">&#x2714;</span> {/* Checkmark icon */}
            <span className="label">Low Severity</span>
          </div>
          <span className="value">{alertsSummary.lowSeverity}</span>
        </div>
      </div>

      <h2 className="section-title">Detailed Alert List</h2>
      <div className="filters-sort-container">
        <div className="filter-group">
          <label htmlFor="severity-filter">Severity:</label>
          <select name="severity" id="severity-filter" value={filters.severity} onChange={handleFilterChange}>
            <option value="All">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="time-range-filter">Time Range:</label>
          <select name="timeRange" id="time-range-filter" value={filters.timeRange} onChange={handleFilterChange}>
            <option value="All">All</option>
            <option value="Last Day">Last Day</option>
            <option value="Last Week">Last Week</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="location-filter">Location:</label>
          <select name="location" id="location-filter" value={filters.location} onChange={handleFilterChange}>
            <option value="All">All</option>
            {uniqueLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select name="status" id="status-filter" value={filters.status} onChange={handleFilterChange}>
            <option value="All">All</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="sort-group">
          <label htmlFor="sort-by">Sort By:</label>
          <select name="sortBy" id="sort-by" value={sortBy} onChange={handleSortChange}>
            <option value="timestamp">Timestamp</option>
            <option value="severity">Severity</option>
            <option value="location">Location</option>
          </select>
          <button onClick={handleSortOrderChange} className="sort-order-button">
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="alert-list">
        {displayedAlerts.length > 0 ? (
          displayedAlerts.map((alert) => (
            <div key={alert.id} className="alert-item">
              <div className="alert-header">
                <span className="timestamp">{alert.timestamp}</span>
                {getSeverityIcon(alert.severity)}
                <span className={`severity-text ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                {getStatusBadge(alert.status)}
              </div>
              <div className="alert-body">
                <p className="alert-location"><strong>Location:</strong> {alert.location}</p>
                <p className="alert-description">{alert.description}</p>
              </div>
              <div className="alert-actions">
                <button className="action-button view-details" onClick={() => handleViewDetails(alert.id)}>View Details</button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-alerts-message">No alerts found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
