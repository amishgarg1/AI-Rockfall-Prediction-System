import React, { useEffect, useMemo, useState } from 'react';
import './PredictionPage.css';
import { API_BASE, apiUrl } from '../config';
import PredictionReport from './PredictionReport'; // Import the new component
import WhatIfTool from './WhatIfTool'; // Import the WhatIfTool component

const CSV_HEADERS = ["Rock_Type", "Date", "Rainfall", "Slope_Angle", "NDVI", "Change_in_NDVI", "Soil_Moisture", "Blast_Vibration", "Seismic_Vibration"];
const SAMPLE_ROW = 'Sedimentary,2024-07-26,125,67,0.42,-0.08,38,0.8,0.15';

/* Classifies the Factor of Safety the way the geotechnical literature does:
   below 1.0 the slope is failing, 1.0–1.5 is marginal, at or above 1.5 it is
   considered stable. */
const classifyFoS = (fos) => {
  if (fos === null || fos === undefined) return { key: 'unknown', label: 'Unknown' };
  if (fos < 1.0) return { key: 'critical', label: 'Failing' };
  if (fos < 1.5) return { key: 'marginal', label: 'Marginal' };
  return { key: 'stable', label: 'Stable' };
};

const classifyProbability = (p) => {
  if (p >= 70) return { key: 'high', label: 'High risk' };
  if (p >= 30) return { key: 'moderate', label: 'Moderate risk' };
  return { key: 'low', label: 'Low risk' };
};

/* Radial gauge. The arc is a single stroked circle whose dash offset carries
   the value, which keeps it to one element and animates for free. */
const Gauge = ({ value, max = 100, tone, children }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(value / max, 1));

  return (
    <div className={`gauge gauge--${tone}`}>
      <svg viewBox="0 0 100 100" className="gauge-svg" aria-hidden="true">
        <circle className="gauge-track" cx="50" cy="50" r={radius} fill="none" strokeWidth="8" />
        <circle
          className="gauge-arc"
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="gauge-center">{children}</div>
    </div>
  );
};

const PredictionPage = () => {
  const [droneImages, setDroneImages] = useState([]);
  const [geoDataFile, setGeoDataFile] = useState(null);
  const [geoDataText, setGeoDataText] = useState('');
  const [rockfallProbability, setRockfallProbability] = useState(null); // New state for rockfall probability
  const [timeToImpact, setTimeToImpact] = useState(null); // New state for time to impact
  const [factorOfSafety, setFactorOfSafety] = useState(null); // New state for Factor of Safety
  const [trustScore, setTrustScore] = useState(null); // New state for Trust Score

  const [showReport, setShowReport] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [sensorData, setSensorData] = useState([]); // Initialize as empty array
  const [showWhatIfTool, setShowWhatIfTool] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator
  const [isDragActive, setIsDragActive] = useState(false); // New state for drag and drop active status
  const [error, setError] = useState(null);

  /* Object URLs are created per file and released when the selection changes
     or the page unmounts. Building them inline during render, as before, made
     a fresh URL on every re-render and never revoked any of them. */
  const previews = useMemo(
    () => droneImages.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [droneImages]
  );

  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  // Handle drone image upload
  const handleDroneImageChange = (e) => {
    setDroneImages(Array.from(e.target.files));
  };

  const removeImage = (index) => {
    setDroneImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setDroneImages(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  // Handle geotechnical data file upload
  const handleGeoDataFileChange = (e) => {
    setGeoDataFile(e.target.files[0]);
    setGeoDataText(''); // Clear manual input if file is uploaded
  };

  // Handle manual geotechnical data input
  const handleGeoDataTextChange = (e) => {
    setGeoDataText(e.target.value);
    setGeoDataFile(null); // Clear file if manual input is used
  };

  const handleGeneratePrediction = async () => {
    setError(null);
    setRockfallProbability(null);
    setTimeToImpact(null);
    setFactorOfSafety(null);
    setTrustScore(null);
    setShowReport(false);
    setShowWhatIfTool(false); // Also reset What-if tool state when generating a new prediction

    /* Validation runs before the loading flag is raised. Previously the flag
       went up first and the early returns skipped the finally block, so a bad
       input left the button stuck on "Generating..." for good. */
    let inputData = {};

    if (geoDataText) {
      const values = geoDataText.split(',').map(s => s.trim());

      if (values.length !== CSV_HEADERS.length) {
        setError(`Expected ${CSV_HEADERS.length} comma-separated values in the order: ${CSV_HEADERS.join(', ')}.`);
        return;
      }

      CSV_HEADERS.forEach((header, index) => {
        // Exclude 'Date' for ML model, but keep others as is
        if (header !== "Date") {
          inputData[header] = isNaN(parseFloat(values[index])) ? values[index] : parseFloat(values[index]);
        }
      });
    } else if (geoDataFile) {
      setError('CSV file upload for ML inference is not wired up yet — paste the row into the manual field instead.');
      return;
    } else {
      setError('Add IOT telemetry before running inference.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(apiUrl('/predict'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`${response.status} — ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log("ML Prediction Response:", data);

      setRockfallProbability(data.rockfall_probability);
      setTimeToImpact(data.time_to_impact);
      setFactorOfSafety(data.factor_of_safety);
      setTrustScore(data.trust_score);

      // Simulate other data for report (as before)
      setLocationData({ name: 'Jharia Coalfield - Section A', lat: 23.75, lon: 86.42 });
      setWeatherData({
        temperature: '32°C',
        humidity: '75%',
        rainfall: '125mm (last 24h)',
        windSpeed: '15 km/h',
      });
      setSensorData([
        { name: 'Strain', value: '78µε', threshold: '75µε', status: 'exceeded', icon: '&#x23F1;' },
        { name: 'Temperature', value: '32°C', threshold: '40°C', status: 'ok', icon: '&#x1F321;' },
        { name: 'Rainfall', value: '125mm', threshold: '100mm', status: 'exceeded', icon: '&#x1F327;' },
        { name: 'Pore Pressure', value: '45kPa', threshold: '50kPa', status: 'warning', icon: '&#x203B;' },
        { name: 'Slope Angle', value: '67°', threshold: '60°', status: 'exceeded', icon: '&#x2302;' },
        { name: 'Vibration', value: '0.8mm/s', threshold: '1mm/s', status: 'ok', icon: '&#x1F55B;' },
      ]);
    } catch (err) {
      console.error("Error generating prediction:", err);
      /* A failed fetch to 127.0.0.1:5000 nearly always means the Flask service
         is not running, so the message says that rather than "Failed to fetch". */
      const offline = err instanceof TypeError;
      setError(offline
        ? `Could not reach the inference service at ${API_BASE}.`
        : `Inference failed: ${err.message}`);
    } finally {
      setIsLoading(false); // Always set loading to false in finally block
    }
  };

  const handleGenerateReport = () => {
    setShowReport(true);
    setShowWhatIfTool(false); // Ensure What-if tool is hidden when report is shown
  };

  const handleBackToPrediction = () => {
    setShowReport(false);
    setShowWhatIfTool(false); // Ensure both are false to show main prediction area
  };

  const handleOpenWhatIfTool = () => {
    setShowWhatIfTool(true);
    setShowReport(false); // Ensure report is hidden when What-if tool is shown
  };

  const hasResults = rockfallProbability !== null && timeToImpact !== null
    && factorOfSafety !== null && trustScore !== null;

  const probabilityClass = hasResults ? classifyProbability(rockfallProbability) : null;
  const fosClass = hasResults ? classifyFoS(factorOfSafety) : null;
  const canSubmit = !isLoading && (droneImages.length > 0 || geoDataFile || geoDataText);

  return (
    <div className="prediction-page-root">
      <header className="alerts-page-header">
        <div className="alerts-page-title-container">
          <h1 className="alerts-page-title">Rockfall Prediction</h1>
        </div>
        <span className="ms-live">
          <span className="ms-dot ms-dot--idle" aria-hidden="true" />
          ML service
        </span>
      </header>

      {/* Conditionally render the main prediction input/results or the sub-tools */}
      {!showReport && !showWhatIfTool && (
        <>
          <div className="prediction-sections">
            {/* Image Data Upload Section */}
            <div className="prediction-card">
              <div className="prediction-card-head">
                <h2>Upload Image Data</h2>
                <span className="prediction-card-count">{droneImages.length} selected</span>
              </div>
              <p>Upload one or more image data files (JPG, PNG, etc.) for analysis.</p>
              <label
                className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleDroneImageChange}
                  style={{ display: 'none' }}
                />
                <div className="dropzone-content">
                  <span className="dropzone-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5.5" width="18" height="14" rx="2.5" />
                      <circle cx="12" cy="12.5" r="3.4" />
                      <path d="M8 5.5 9.2 3h5.6l1.2 2.5" />
                    </svg>
                  </span>
                  <span className="dropzone-text">Click or drag images here to upload</span>
                  <span className="dropzone-hint">JPG, PNG · multiple files supported</span>
                </div>
              </label>
              <div className="preview-grid">
                {previews.map((preview, idx) => (
                  <div key={preview.url} className="preview-thumb">
                    <img src={preview.url} alt={preview.file.name} />
                    <button
                      type="button"
                      className="preview-remove"
                      onClick={() => removeImage(idx)}
                      aria-label={`Remove ${preview.file.name}`}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {droneImages.length === 0 && <span className="no-uploaded">No images uploaded.</span>}
              </div>
            </div>

            {/* Geotechnical Data Upload/Input Section */}
            <div className="prediction-card">
              <div className="prediction-card-head">
                <h2>IOT Data</h2>
                <button type="button" className="sample-button" onClick={() => { setGeoDataText(SAMPLE_ROW); setGeoDataFile(null); }}>
                  Load sample row
                </button>
              </div>
              <p>Upload a CSV file or enter data manually (e.g., from piezometers, inclinometers, etc.).</p>
              <label className="custom-upload-btn">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleGeoDataFileChange}
                  style={{ display: 'none' }}
                />
                <span>Upload CSV</span>
              </label>
              <div className="csv-filename">{geoDataFile ? geoDataFile.name : 'No CSV uploaded.'}</div>
              <div className="or-divider"><span>OR</span></div>

              {/* The expected column order, shown rather than hidden in a
                  validation message the operator only sees after failing. */}
              <ul className="schema-hint">
                {CSV_HEADERS.map((header) => (
                  <li key={header}>{header}</li>
                ))}
              </ul>

              <textarea
                rows={5}
                placeholder="Paste or type IOT data here (CSV format or tabular)..."
                value={geoDataText}
                onChange={handleGeoDataTextChange}
                className="geo-textarea"
              />
            </div>
          </div>

          {error && (
            <div className="prediction-error" role="alert">
              <span className="prediction-error-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7.5v5.5M12 16.5h.01" />
                </svg>
              </span>
              <span>{error}</span>
              <button type="button" className="prediction-error-close" onClick={() => setError(null)} aria-label="Dismiss">&times;</button>
            </div>
          )}

          <div className="generate-prediction-container">
            <button
              className="generate-prediction-button"
              onClick={handleGeneratePrediction}
              disabled={!canSubmit}
            >
              {isLoading && <span className="button-spinner" aria-hidden="true" />}
              {isLoading ? 'Running inference…' : 'Generate Predictions'}
            </button>
          </div>

          {hasResults && (
            <div className="prediction-results-card">
              <div className="results-head">
                <h2>Prediction Results</h2>
                <span className={`ms-chip ms-chip--${probabilityClass.key === 'high' ? 'critical' : probabilityClass.key === 'moderate' ? 'medium' : 'low'}`}>
                  {probabilityClass.label}
                </span>
              </div>

              <div className="results-grid">
                {/* Failure probability — the headline number, on a gauge. */}
                <div className="result-tile result-tile--primary">
                  <Gauge value={rockfallProbability} tone={probabilityClass.key}>
                    <span className="gauge-value">{Math.round(rockfallProbability)}<span className="gauge-suffix">%</span></span>
                    <span className="gauge-label">Failure probability</span>
                  </Gauge>
                </div>

                <div className="result-tile">
                  <span className="result-label">Estimated time to impact</span>
                  <span className="result-value time-to-impact-text">
                    {timeToImpact}<span className="result-unit">hours</span>
                  </span>
                  <div className="probability-bar-container">
                    <div
                      className={`probability-bar ${probabilityClass.key === 'high' ? 'high-risk' : probabilityClass.key === 'moderate' ? 'moderate-risk' : 'low-risk'}`}
                      style={{ '--fill-width': `${Math.min(rockfallProbability, 100)}%` }}
                    />
                  </div>
                  <span className="result-note">Window narrows as probability climbs</span>
                </div>

                <div className={`result-tile result-tile--fos fos-${fosClass.key}`}>
                  <span className="result-label">Factor of Safety (LEM)</span>
                  <span className="result-value">{factorOfSafety}</span>
                  <div className="fos-scale" aria-hidden="true">
                    <span className="fos-band fos-band--critical" />
                    <span className="fos-band fos-band--marginal" />
                    <span className="fos-band fos-band--stable" />
                    {/* Marker positioned on a 0–2.5 scale, clamped at both ends. */}
                    <span
                      className="fos-marker"
                      style={{ left: `${Math.max(2, Math.min((factorOfSafety / 2.5) * 100, 98))}%` }}
                    />
                  </div>
                  <span className="result-note">{fosClass.label} · failure below 1.0</span>
                </div>

                <div className="result-tile">
                  <span className="result-label">Trust score (AI vs LEM)</span>
                  <span className="result-value">{trustScore}<span className="result-unit">%</span></span>
                  <div className="ms-meter trust-meter">
                    <div
                      className="ms-meter-fill trust-meter-fill"
                      style={{ width: `${Math.min(trustScore, 100)}%` }}
                    />
                  </div>
                  <span className="result-note">Agreement between the model and the physics</span>
                </div>
              </div>
            </div>
          )}

          {/* What-if Tool/Generate Report buttons */}
          {(rockfallProbability !== null && timeToImpact !== null) && (
            <div className="generate-report-container">
              <button className="generate-report-button" onClick={handleGenerateReport}>
                Generate Report
              </button>
              <button className="what-if-tool-button" onClick={handleOpenWhatIfTool}>
                What-if Tool
              </button>
            </div>
          )}
        </>
      )}

      {/* Prediction Report section (show only if showReport is true) */}
      {showReport && (rockfallProbability !== null && timeToImpact !== null) && (
        <div className="prediction-report-section">
          <button className="back-to-prediction-button" onClick={handleBackToPrediction}>Back to Prediction</button>
          <PredictionReport
            rockfallProbability={rockfallProbability}
            timeToImpact={timeToImpact}
            factorOfSafety={factorOfSafety}
            trustScore={trustScore}
            droneImages={droneImages}
            geoDataFile={geoDataFile}
            geoDataText={geoDataText}
            locationData={locationData}
            weatherData={weatherData}
            sensorData={sensorData}
          />
        </div>
      )}

      {/* What-if Tool section (show only if showWhatIfTool is true) */}
      {showWhatIfTool && (
        <div className="what-if-tool-section">
          <WhatIfTool onBackToPrediction={handleBackToPrediction} />
        </div>
      )}
    </div>
  );
};

export default PredictionPage;
