import React, { useState, useRef } from 'react';
import './IndiaRiskMap.css';
import { useNavigate } from 'react-router-dom';

const IndiaRiskMap = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null); // Create a ref for the map container
  const [tooltip, setTooltip] = useState({
    isVisible: false,
    content: '',
    x: 0,
    y: 0,
  });

  const handleCircleClick = () => {
    navigate('/sensors');
  };

  const handleMouseEnter = (event, riskLevel, cx, cy) => {
    if (mapRef.current) {
      const mapRect = mapRef.current.getBoundingClientRect();
      const tooltipX = mapRect.left + cx; // Position relative to map container
      const tooltipY = mapRect.top + cy - 30; // Position relative to map container, adjusted for height

      setTooltip({
        isVisible: true,
        content: riskLevel,
        x: tooltipX,
        y: tooltipY,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({
      isVisible: false,
      content: '',
      x: 0,
      y: 0,
    });
  };

  return (
    <div className="india-risk-map-container">
      <div className="map-header">
        <h2>Live India Mining Risk Map</h2>
        <div className="live-updates">
          <span className="live-indicator"></span>
          <span>Live Updates</span>
        </div>
      </div>
      <div className="map-content">
        <div className="india-map-placeholder" ref={mapRef}> {/* Attach ref here */}
          <svg viewBox="0 0 260 280" className="india-map-svg">
            {/* Simplified illustrative path for India's outline */}
            <path
              className="india-outline"
              d="M 120 0 L 140 30 L 130 60 L 160 80 L 150 110 L 180 130 L 170 160 L 200 180 L 190 210 L 220 230 L 210 260 L 180 280 L 150 260 L 120 280 L 90 260 L 60 280 L 30 260 L 0 230 L 20 210 L 10 180 L 40 160 L 30 130 L 60 110 L 50 80 L 80 60 L 70 30 L 100 0 Z"
              fill="transparent"
            />
            {/* Risk points - adjusted positions to be illustrative of the image */}
            <circle cx="220" cy="155" r="3" fill="red" className='red' onClick={handleCircleClick} onMouseEnter={(e) => handleMouseEnter(e, 'High Risk', 480, 200)} onMouseLeave={handleMouseLeave} />
            <circle cx="185" cy="165" r="3" fill="yellow" onClick={handleCircleClick} onMouseEnter={(e) => handleMouseEnter(e, 'Medium Risk', 310, 210)} onMouseLeave={handleMouseLeave} />
            <circle cx="200" cy="180" r="3" fill="green" onClick={handleCircleClick} onMouseEnter={(e) => handleMouseEnter(e, 'Low Risk', 450, 320)} onMouseLeave={handleMouseLeave} />
            <circle cx="155" cy="170" r="3" fill="red" onClick={handleCircleClick} onMouseEnter={(e) => handleMouseEnter(e, 'High Risk', 280, 230)} onMouseLeave={handleMouseLeave} />
            <circle cx="170" cy="185" r="3" fill="yellow" onClick={handleCircleClick} onMouseEnter={(e) => handleMouseEnter(e, 'Medium Risk', 300, 320)} onMouseLeave={handleMouseLeave} />
          </svg>
          {tooltip.isVisible && (
            <div
              className="risk-tooltip"
              style={{
                left: tooltip.x,
                top: tooltip.y,
              }}
            >
              {tooltip.content}
            </div>
          )}
          {/* Removed map-subtitle */}
        </div>
        {/* Removed Risk Levels legend */}
      </div>
    </div>
  );
};

export default IndiaRiskMap;
