import React, { useState } from 'react';
import './PredictionPage.css';
import PredictionReport from './PredictionReport'; // Import the new component
import WhatIfTool from './WhatIfTool'; // Import the WhatIfTool component

const PredictionPage = () => {
  const [droneImages, setDroneImages] = useState([]);
  const [geoDataFile, setGeoDataFile] = useState(null);
  const [geoDataText, setGeoDataText] = useState('');
  // const [predictionResult, setPredictionResult] = useState(null); // Removed
  // const [predictionProbability, setPredictionProbability] = useState(null); // Removed
  const [rockfallProbability, setRockfallProbability] = useState(null); // New state for rockfall probability
  const [timeToImpact, setTimeToImpact] = useState(null); // New state for time to impact
  const [factorOfSafety, setFactorOfSafety] = useState(null); // New state for Factor of Safety
  const [trustScore, setTrustScore] = useState(null); // New state for Trust Score

  const [showReport, setShowReport] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [sensorData, setSensorData] = useState([]); // Initialize as empty array
  const [showWhatIfTool, setShowWhatIfTool] = useState(false); // <--- THIS IS THE FIX
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator
  const [isDragActive, setIsDragActive] = useState(false); // New state for drag and drop active status

  // Handle drone image upload
  const handleDroneImageChange = (e) => {
    setDroneImages(Array.from(e.target.files));
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
    // Clear previous results
    setIsLoading(true); // Set loading to true at the start
    // setPredictionResult(null);
    // setPredictionProbability(null);
    setRockfallProbability(null);
    setTimeToImpact(null);
    setFactorOfSafety(null);
    setTrustScore(null);
    setShowReport(false);
    setShowWhatIfTool(false); // Also reset What-if tool state when generating a new prediction

    let inputData = {};

    if (geoDataText) {
      const headers = ["Rock_Type", "Date", "Rainfall", "Slope_Angle", "NDVI", "Change_in_NDVI", "Soil_Moisture", "Blast_Vibration", "Seismic_Vibration"];
      const values = geoDataText.split(',').map(s => s.trim());

      if (values.length === headers.length) {
        headers.forEach((header, index) => {
          // Exclude 'Date' for ML model, but keep others as is
          if (header !== "Date") {
            inputData[header] = isNaN(parseFloat(values[index])) ? values[index] : parseFloat(values[index]);
          }
        });
      } else {
        alert("Please enter IOT data in the correct CSV format: Rock_Type,Date,Rainfall,Slope_Angle,NDVI,Change_in_NDVI,Soil_Moisture,Blast_Vibration,Seismic_Vibration");
        return;
      }
    } else if (geoDataFile) {
      alert("CSV file upload for ML prediction is not yet implemented. Please use manual input for now.");
      return;
    } else {
      alert("Please upload image data or enter IOT data to generate predictions.");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Backend error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log("ML Prediction Response:", data);

      setRockfallProbability(data.rockfall_probability);
      setTimeToImpact(data.time_to_impact);
      setFactorOfSafety(data.factor_of_safety);
      setTrustScore(data.trust_score);

      // Determine a 'result' string for display based on probability for consistency with old UI elements or for a summary
      // setPredictionResult(resultString); // If you still need this for some display logic

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
      
      // Show the results section immediately after successful prediction
      // You don't need to explicitly call setShowReport(false) here as it's at the start of the function

    } catch (error) {
      console.error("Error generating prediction:", error);
      // setPredictionResult("Error");
      // setPredictionProbability(0);
      alert(`Failed to get prediction: ${error.message}`);
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

  return (
    <div className="prediction-page-root">
      <header className="alerts-page-header">
        <div className="alerts-page-title-container">
          <h1 className="alerts-page-title">Rockfall Prediction</h1>
          <div className="alerts-page-title-underline"></div>
        </div>
      </header>
      
      {/* Conditionally render the main prediction input/results or the sub-tools */}
      {!showReport && !showWhatIfTool && (
        <>
          <div className="prediction-sections">
            {/* Image Data Upload Section */}
            <div className="prediction-card">
              <h2>Upload Image Data</h2>
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
                  <span className="dropzone-icon">📷</span>
                  <span className="dropzone-text">Click or drag images here to upload</span>
                </div>
              </label>
              <div className="preview-grid">
                {droneImages.map((img, idx) => (
                  <div key={idx} className="preview-thumb">
                    <img src={URL.createObjectURL(img)} alt={`image-${idx}`} />
                  </div>
                ))}
                {droneImages.length === 0 && <span className="no-uploaded">No images uploaded.</span>}
              </div>
            </div>
            {/* Geotechnical Data Upload/Input Section */}
            <div className="prediction-card">
              <h2>IOT Data</h2>
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
              <div className="or-divider">OR</div>
              <textarea
                rows={6}
                placeholder="Paste or type IOT data here (CSV format or tabular)..."
                value={geoDataText}
                onChange={handleGeoDataTextChange}
                className="geo-textarea"
              />
            </div>
          </div>

          <div className="generate-prediction-container">
            <button
              className="generate-prediction-button"
              onClick={handleGeneratePrediction}
              disabled={isLoading || (droneImages.length === 0 && !geoDataFile && !geoDataText)} // Disable when loading or no input
            >
              {isLoading ? 'Generating...' : 'Generate Predictions'} {/* Change text based on loading state */}
            </button>
          </div>

          {(rockfallProbability !== null && timeToImpact !== null && factorOfSafety !== null && trustScore !== null) && (
            <div className="prediction-results-card">
              <h2>Prediction Results</h2>
              <div className="prediction-summary">
                <p><strong>Rockfall Probability:</strong> {rockfallProbability}%</p>
                <div className="probability-bar-container">
                  <div
                    className={`probability-bar ${
                      rockfallProbability >= 70 ? 'high-risk' : rockfallProbability >= 30 ? 'moderate-risk' : 'low-risk'
                    }`}
                    style={{ '--fill-width': `${rockfallProbability}%` }}
                  ></div>
                </div>
                <p><strong>Estimated Time to Impact:</strong> <span className="time-to-impact-text">{timeToImpact} hours</span></p>
                <p><strong>Factor of Safety (LEM):</strong> {factorOfSafety}</p>
                <p><strong>Trust Score (AI vs LEM):</strong> {trustScore}%</p>
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
          {/* Note: You should pass relevant props to WhatIfTool here if needed */}
          <WhatIfTool onBackToPrediction={handleBackToPrediction} />
        </div>
      )}
    </div>
  );
};

export default PredictionPage;
