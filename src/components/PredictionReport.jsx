import React from 'react';
import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from "react"; // Import useState

const PredictionReport = ({
  rockfallProbability,
  timeToImpact,
  factorOfSafety,
  trustScore,
  droneImages,
  geoDataText,
  locationData,
  weatherData,
  sensorData,
}) => {
  const [isPdfGenerating, setIsPdfGenerating] = useState(false); // New state for PDF generation status
  const downloadPdf = async () => {
    setIsPdfGenerating(true); // Set generating state to true
    const element = document.getElementById('prediction-report-content');
    if (!element) {
      setIsPdfGenerating(false); // Reset state on error
      return;
    }

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    let imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('rockfall_prediction_report.pdf');
    setIsPdfGenerating(false); // Reset generating state after download
  };

  // Helper to determine risk level for dynamic styling
  const getRiskLevel = (probability) => {
    if (probability >= 70) return 'high';
    if (probability >= 30) return 'moderate';
    return 'low';
  };

  const riskLevel = getRiskLevel(rockfallProbability);

  return (
    <div className="prediction-report-container" id="prediction-report-content">
      <h1 className="report-title">Rockfall Prediction Report</h1>

      <section className="report-section summary-section">
        <h2>Prediction Summary</h2>
        <div className="summary-grid">
          <SummaryCard
            icon="&#x1F4CA;" // Chart icon
            title="Rockfall Probability"
            value={`${rockfallProbability}%`}
            riskLevel={riskLevel}
          />
          <SummaryCard
            icon="&#x23F1;" // Timer icon
            title="Estimated Time to Impact"
            value={`${timeToImpact} hours`}
            riskLevel={riskLevel}
          />
          <SummaryCard
            icon="&#x2692;" // Hammer and pick icon
            title="Factor of Safety (LEM)"
            value={factorOfSafety}
            riskLevel={riskLevel === 'high' ? 'critical' : riskLevel}
          />
          <SummaryCard
            icon="&#x1F914;" // Thinking face emoji
            title="Trust Score (AI vs LEM)"
            value={`${trustScore}%`}
            riskLevel={trustScore < 50 ? 'low' : 'high'}
          />
        </div>
      </section>

      {locationData && (
        <section className="report-section location-section">
          <h2>Location Information</h2>
          <div className="location-cards-grid">
            <LocationCard icon="&#x1F4CD;" label="Site" value={locationData.name} />
            <LocationCard icon="&#x1F30D;" label="Latitude" value={locationData.lat} />
            <LocationCard icon="&#x1F30E;" label="Longitude" value={locationData.lon} />
          </div>
        </section>
      )}

      {weatherData && (
        <section className="report-section weather-section">
          <h2>Current Weather Conditions</h2>
          <div className="weather-cards-grid">
            <WeatherCard icon="&#x1F321;" label="Temperature" value={weatherData.temperature} />
            <WeatherCard icon="&#x1F4A7;" label="Humidity" value={weatherData.humidity} />
            <WeatherCard icon="&#x1F327;" label="Rainfall" value={weatherData.rainfall} />
            <WeatherCard icon="&#x1F32C;" label="Wind Speed" value={weatherData.windSpeed} />
          </div>
        </section>
      )}

      {droneImages.length > 0 && (
        <section className="report-section image-section">
          <h2>Drone Images Analyzed</h2>
          <div className="image-grid">
            {droneImages.map((img, idx) => (
              <img key={idx} src={URL.createObjectURL(img)} alt={`drone-analysis-${idx}`} />
            ))}
          </div>
        </section>
      )}

      {geoDataText && (
        <section className="report-section geo-data-section">
          <h2>Raw IOT Data Input</h2>
          <pre>{geoDataText}</pre>
        </section>
      )}

      {sensorData && sensorData.length > 0 && (
        <section className="report-section sensor-data-section">
          <h2>Sensor Data Analysis</h2>
          <div className="sensor-grid">
            {sensorData.map((sensor, idx) => (
              <SensorCard
                key={idx}
                icon={sensor.icon}
                name={sensor.name}
                value={sensor.value}
                threshold={sensor.threshold}
                status={sensor.status}
              />
            ))}
          </div>
        </section>
      )}

      <button onClick={downloadPdf} className="download-pdf-button" disabled={isPdfGenerating}>
        {isPdfGenerating ? 'Generating PDF...' : 'Download as PDF'}
      </button>
    </div>
  );
};

// Helper component for summary cards
const SummaryCard = ({ icon, title, value, riskLevel }) => (
  <div className={`summary-card ${riskLevel}-risk`}>
    <div className="summary-card-icon" dangerouslySetInnerHTML={{ __html: icon }}></div>
    <div className="summary-card-content">
      <span className="summary-card-title">{title}:</span>
      <span className="summary-card-value">{value}</span>
    </div>
  </div>
);

// Helper component for location cards
const LocationCard = ({ icon, label, value }) => (
  <div className="location-card">
    <div className="location-card-icon" dangerouslySetInnerHTML={{ __html: icon }}></div>
    <div className="location-card-content">
      <span className="location-card-label">{label}:</span>
      <span className="location-card-value">{value}</span>
    </div>
  </div>
);

// Helper component for weather cards
const WeatherCard = ({ icon, label, value }) => (
  <div className="weather-card">
    <div className="weather-card-icon" dangerouslySetInnerHTML={{ __html: icon }}></div>
    <div className="weather-card-content">
      <span className="weather-card-label">{label}:</span>
      <span className="weather-card-value">{value}</span>
    </div>
  </div>
);

// Helper component for sensor cards
const SensorCard = ({ icon, name, value, threshold, status }) => (
  <div className={`sensor-card ${status}`}>
    <div className="sensor-card-header">
      <span className="sensor-icon" dangerouslySetInnerHTML={{ __html: icon }}></span>
      <span className="sensor-name">{name}</span>
    </div>
    <div className="sensor-card-body">
      <p><strong>Value:</strong> <span className={`sensor-value ${status}`}>{value}</span></p>
      <p><strong>Threshold:</strong> {threshold}</p>
      <p><strong>Status:</strong> <span className={`sensor-status-text ${status}`}>{status}</span></p>
    </div>
  </div>
);

export default PredictionReport;
