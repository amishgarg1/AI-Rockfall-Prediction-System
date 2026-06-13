import React, { useState } from 'react';
import './SensoringPage.css';
import { useNavigate } from 'react-router-dom';

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

const SensoringPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleLocations, setVisibleLocations] = useState(3);
  const navigate = useNavigate();

  const filteredLocations = locationsData.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLocationClick = (id) => {
    navigate(`/sensors/${id}`); // Navigate to sensors page with specific location ID
  };

  const handleViewMore = () => {
    setVisibleLocations((prev) => prev + 3);
  };

  const handleViewLess = () => {
    setVisibleLocations(3);
  };

  return (
    <div className="sensoring-page">
      <header className="sensoring-page-header">
        <div className="sensoring-page-title-container">
          <h1 className="sensoring-page-title">Mining Locations</h1>
          <div className="sensoring-page-title-underline"></div>
        </div>
      </header>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search mining locations..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      <div className="locations-grid">
        {filteredLocations.slice(0, visibleLocations).map((location) => (
          <div
            key={location.id}
            className="location-cards"
            onClick={() => handleLocationClick(location.id)}
          >
            <div className="card-header">
              <div className="location-name-group">
                <h3 className="location-name">{location.name.split(' - ')[0]}</h3>
                <p className="location-sub-name">{location.name.split(' - ')[1]}</p>
              </div>
              {/* Potentially add an icon here if needed for "smart" look */}
            </div>
            <p className="location-details">{location.details}</p>
          </div>
        ))}
      </div>
      {filteredLocations.length > 3 && (
        <div className="view-buttons">
          {visibleLocations < filteredLocations.length ? (
            <button onClick={handleViewMore} className="view-more-button">
              View More
            </button>
          ) : (
            <button onClick={handleViewLess} className="view-less-button">
              View Less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SensoringPage;
