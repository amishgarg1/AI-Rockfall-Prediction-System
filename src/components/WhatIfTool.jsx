import React, { useState } from 'react';
import './WhatIfTool.css';
import { API_BASE, apiUrl } from '../config';

const scenarios = [
  {
    key: 'rainfall',
    label: 'Rainfall',
    blurb: 'Testing the water trigger',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 12.5a4 4 0 0 0-.8-7.9 5.6 5.6 0 0 0-10.6 1.8A3.7 3.7 0 0 0 6.5 13" />
        <path d="M8 16.5 7 19M12 16.5 11 19M16 16.5 15 19" />
      </svg>
    ),
  },
  {
    key: 'blasting',
    label: 'Blasting',
    blurb: 'Testing the human trigger',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h2.4l2-5.5 3.2 11 2.4-7 1.6 3.5H21" />
      </svg>
    ),
  },
  {
    key: 'temperature',
    label: 'Temperature',
    blurb: 'Testing the climate trigger',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.5 13.6V5a1.9 1.9 0 1 0-3.8 0v8.6a4 4 0 1 0 3.8 0Z" />
      </svg>
    ),
  },
];

/* Labels for the model's feature names, so the readout of what was actually
   sent to the pipeline is legible instead of a raw JSON dump. */
const featureLabels = {
  Rock_Type: 'Rock type',
  Rainfall: 'Rainfall (mm)',
  Slope_Angle: 'Slope angle (°)',
  NDVI: 'NDVI',
  Change_in_NDVI: 'Change in NDVI',
  Soil_Moisture: 'Soil moisture (%)',
  Blast_Vibration: 'Blast vibration (mm/s)',
  Seismic_Vibration: 'Seismic vibration (g)',
};

const WhatIfTool = ({ onBackToPrediction }) => {
  const [scenario, setScenario] = useState(''); // 'rainfall', 'blasting', 'temperature'
  const [rainfallInput, setRainfallInput] = useState({ amount: '', duration: '' });
  const [blastingInput, setBlastingInput] = useState({ charge: '', proximity: '' });
  const [temperatureInput, setTemperatureInput] = useState({ cold: '', thaw: '' });
  const [simulationResult, setSimulationResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  const handleRunSimulation = async () => {
    setError(null);
    setIsRunning(true);

    let inputData = {
      Rock_Type: "Sedimentary",
      Date: "2024-01-01",
      Rainfall: 0,
      Slope_Angle: 30,
      NDVI: 0.5,
      Change_in_NDVI: 0,
      Soil_Moisture: 20,
      Blast_Vibration: 0,
      Seismic_Vibration: 0.01,
    };

    if (scenario === 'rainfall') {
      inputData.Rainfall = parseFloat(rainfallInput.amount) || 0;
    } else if (scenario === 'blasting') {
      inputData.Blast_Vibration = parseFloat(blastingInput.charge) * 0.001 || 0;
    } else if (scenario === 'temperature') {
      const cold = parseFloat(temperatureInput.cold) || 0;
      const thaw = parseFloat(temperatureInput.thaw) || 0;
      if (cold < 0 && thaw > 0) {
        inputData.Change_in_NDVI = -0.05;
      } else {
        inputData.Change_in_NDVI = 0;
      }
    }

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
      console.log("What-if Tool ML Prediction Response:", data);

      let simulatedRiskLevel;
      if (data.rockfall_probability >= 70) {
        simulatedRiskLevel = 'High';
      } else if (data.rockfall_probability >= 30) {
        simulatedRiskLevel = 'Moderate';
      } else {
        simulatedRiskLevel = 'Low';
      }

      setSimulationResult({
        scenario: scenario,
        input: inputData,
        rockfallProbability: data.rockfall_probability,
        riskLevel: simulatedRiskLevel,
      });
    } catch (err) {
      console.error("Error running What-if simulation:", err);
      const offline = err instanceof TypeError;
      setError(offline
        ? `Could not reach the inference service at ${API_BASE}.`
        : `Simulation failed: ${err.message}`);
      setSimulationResult(null);
    } finally {
      setIsRunning(false);
    }
  };

  const activeScenario = scenarios.find((s) => s.key === scenario);

  const renderField = (label, hint, value, onChange, placeholder) => (
    <div className="input-group">
      <label>
        {label}
        {hint && <span className="input-hint">{hint}</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="what-if-tool-container">
      <div className="what-if-tool-header">
        <div>
          <span className="ms-eyebrow">Geotechnical simulator</span>
          <h2>Rockfall Simulator</h2>
        </div>
        <button className="back-button" onClick={onBackToPrediction}>Back to Prediction</button>
      </div>

      <p className="tool-description">
        Virtually experiment with extreme conditions to understand their risks before they occur in the real world.
      </p>

      <div className="scenario-selection">
        <h3>Select a scenario</h3>
        <div className="scenario-buttons">
          {scenarios.map((item) => (
            <button
              key={item.key}
              className={`scenario-button ${scenario === item.key ? 'active' : ''}`}
              onClick={() => { setScenario(item.key); setSimulationResult(null); setError(null); }}
              aria-pressed={scenario === item.key}
            >
              <span className="scenario-icon" aria-hidden="true">{item.icon}</span>
              <span className="scenario-copy">
                <span className="scenario-label">{item.label}</span>
                <span className="scenario-blurb">{item.blurb}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {!scenario && (
        <p className="scenario-placeholder">Pick a trigger above to configure a simulation.</p>
      )}

      {scenario === 'rainfall' && (
        <div className="scenario-input-card">
          <h4>Rainfall Scenario: Testing the Water Trigger</h4>
          <p>Specify rainfall intensity and duration.</p>
          <div className="input-row">
            {renderField('Rainfall amount (mm)', 'feeds the model', rainfallInput.amount,
              (e) => setRainfallInput({ ...rainfallInput, amount: e.target.value }), 'e.g., 100')}
            {renderField('Duration (hours)', 'context only', rainfallInput.duration,
              (e) => setRainfallInput({ ...rainfallInput, duration: e.target.value }), 'e.g., 12')}
          </div>
          <button className="run-simulation-button" onClick={handleRunSimulation} disabled={isRunning}>
            {isRunning && <span className="button-spinner" aria-hidden="true" />}
            {isRunning ? 'Running…' : 'Run Rainfall Simulation'}
          </button>
        </div>
      )}

      {scenario === 'blasting' && (
        <div className="scenario-input-card">
          <h4>Blasting Scenario: Testing the Human Trigger</h4>
          <p>Define blast charge and proximity to slope.</p>
          <div className="input-row">
            {renderField('Charge size (kg TNT equiv.)', 'feeds the model', blastingInput.charge,
              (e) => setBlastingInput({ ...blastingInput, charge: e.target.value }), 'e.g., 500')}
            {renderField('Proximity to slope (m)', 'context only', blastingInput.proximity,
              (e) => setBlastingInput({ ...blastingInput, proximity: e.target.value }), 'e.g., 20')}
          </div>
          <button className="run-simulation-button" onClick={handleRunSimulation} disabled={isRunning}>
            {isRunning && <span className="button-spinner" aria-hidden="true" />}
            {isRunning ? 'Running…' : 'Run Blasting Simulation'}
          </button>
        </div>
      )}

      {scenario === 'temperature' && (
        <div className="scenario-input-card">
          <h4>Temperature Scenario: Testing the Climate Trigger</h4>
          <p>Specify extreme cold and rapid thaw temperatures. A freeze-thaw cycle (cold below zero followed by thaw above it) is applied as surface degradation.</p>
          <div className="input-row">
            {renderField('Extreme cold (°C)', null, temperatureInput.cold,
              (e) => setTemperatureInput({ ...temperatureInput, cold: e.target.value }), 'e.g., -10')}
            {renderField('Rapid thaw (°C)', null, temperatureInput.thaw,
              (e) => setTemperatureInput({ ...temperatureInput, thaw: e.target.value }), 'e.g., 10')}
          </div>
          <button className="run-simulation-button" onClick={handleRunSimulation} disabled={isRunning}>
            {isRunning && <span className="button-spinner" aria-hidden="true" />}
            {isRunning ? 'Running…' : 'Run Temperature Simulation'}
          </button>
        </div>
      )}

      {error && (
        <div className="simulation-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss">&times;</button>
        </div>
      )}

      {simulationResult && (
        <div className={`simulation-results-card risk-tone-${simulationResult.riskLevel.toLowerCase()}`}>
          <div className="simulation-results-head">
            <h3>
              {activeScenario ? `${activeScenario.label} simulation` : 'Simulation'} result
            </h3>
            <span className={`risk-badge risk-${simulationResult.riskLevel}`}>
              {simulationResult.riskLevel} risk
            </span>
          </div>

          <div className="simulation-headline">
            <span className="simulation-probability">
              {Math.round(simulationResult.rockfallProbability)}<span className="simulation-suffix">%</span>
            </span>
            <span className="simulation-caption">simulated failure probability</span>
          </div>

          <div className="simulation-bar">
            <div
              className="simulation-bar-fill"
              style={{ width: `${Math.min(simulationResult.rockfallProbability, 100)}%` }}
            />
          </div>

          {/* The exact feature vector handed to the pipeline. Previously this
              was JSON.stringify'd straight onto the page. */}
          <details className="simulation-inputs">
            <summary>Parameters sent to the model</summary>
            <dl>
              {Object.entries(simulationResult.input)
                .filter(([key]) => key !== 'Date')
                .map(([key, value]) => (
                  <div key={key} className="simulation-input-row">
                    <dt>{featureLabels[key] ?? key}</dt>
                    <dd>{String(value)}</dd>
                  </div>
                ))}
            </dl>
          </details>
        </div>
      )}
    </div>
  );
};

export default WhatIfTool;
