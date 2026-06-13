import React, { useState } from 'react';
import './WhatIfTool.css';

const WhatIfTool = ({ onBackToPrediction }) => {
  const [scenario, setScenario] = useState(''); // 'rainfall', 'blasting', 'temperature'
  const [rainfallInput, setRainfallInput] = useState({ amount: '', duration: '' });
  const [blastingInput, setBlastingInput] = useState({ charge: '', proximity: '' });
  const [temperatureInput, setTemperatureInput] = useState({ cold: '', thaw: '' });
  const [simulationResult, setSimulationResult] = useState(null);

  const handleRunSimulation = async () => {
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
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`ML Service error: ${response.status} - ${errorData.error || response.statusText}`);
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
        output: `Simulated Rockfall Probability: ${data.rockfall_probability}%`
      });

    } catch (error) {
      console.error("Error running What-if simulation:", error);
      alert(`Failed to run simulation: ${error.message}`);
      setSimulationResult(null);
    }
  };

  return (
    <div className="what-if-tool-container">
      <div className="what-if-tool-header">
        <h2>Rockfall Simulator</h2>
        <button className="back-button" onClick={onBackToPrediction}>Back to Prediction</button>
      </div>
      <p className="tool-description">
        Virtually experiment with extreme conditions to understand their risks before they occur in the real world.
      </p>

      <div className="scenario-selection">
        <h3>Select a Scenario:</h3>
        <div className="scenario-buttons">
          <button
            className={`scenario-button ${scenario === 'rainfall' ? 'active' : ''}`}
            onClick={() => setScenario('rainfall')}
          >
            Rainfall Scenario
          </button>
          <button
            className={`scenario-button ${scenario === 'blasting' ? 'active' : ''}`}
            onClick={() => setScenario('blasting')}
          >
            Blasting Scenario
          </button>
          <button
            className={`scenario-button ${scenario === 'temperature' ? 'active' : ''}`}
            onClick={() => setScenario('temperature')}
          >
            Temperature Scenario
          </button>
        </div>
      </div>

      {scenario === 'rainfall' && (
        <div className="scenario-input-card">
          <h4>Rainfall Scenario: Testing the Water Trigger</h4>
          <p>Specify rainfall intensity and duration.</p>
          <div className="input-group">
            <label>Rainfall Amount (mm):</label>
            <input
              type="number"
              value={rainfallInput.amount}
              onChange={(e) => setRainfallInput({ ...rainfallInput, amount: e.target.value })}
              placeholder="e.g., 100"
              min="0"
            />
          </div>
          <div className="input-group">
            <label>Duration (hours):</label>
            <input
              type="number"
              value={rainfallInput.duration}
              onChange={(e) => setRainfallInput({ ...rainfallInput, duration: e.target.value })}
              placeholder="e.g., 12"
              min="0"
            />
          </div>
          <button className="run-simulation-button" onClick={handleRunSimulation}>Run Rainfall Simulation</button>
        </div>
      )}

      {scenario === 'blasting' && (
        <div className="scenario-input-card">
          <h4>Blasting Scenario: Testing the Human Trigger</h4>
          <p>Define blast charge and proximity to slope.</p>
          <div className="input-group">
            <label>Charge Size (kg TNT equivalent):</label>
            <input
              type="number"
              value={blastingInput.charge}
              onChange={(e) => setBlastingInput({ ...blastingInput, charge: e.target.value })}
              placeholder="e.g., 500"
              min="0"
            />
          </div>
          <div className="input-group">
            <label>Proximity to Slope (meters):</label>
            <input
              type="number"
              value={blastingInput.proximity}
              onChange={(e) => setBlastingInput({ ...blastingInput, proximity: e.target.value })}
              placeholder="e.g., 20"
              min="0"
            />
          </div>
          <button className="run-simulation-button" onClick={handleRunSimulation}>Run Blasting Simulation</button>
        </div>
      )}

      {scenario === 'temperature' && (
        <div className="scenario-input-card">
          <h4>Temperature Scenario: Testing the Climate Trigger</h4>
          <p>Specify extreme cold and rapid thaw temperatures.</p>
          <div className="input-group">
            <label>Extreme Cold (°C):</label>
            <input
              type="number"
              value={temperatureInput.cold}
              onChange={(e) => setTemperatureInput({ ...temperatureInput, cold: e.target.value })}
              placeholder="e.g., -10"
            />
          </div>
          <div className="input-group">
            <label>Rapid Thaw (°C):</label>
            <input
              type="number"
              value={temperatureInput.thaw}
              onChange={(e) => setTemperatureInput({ ...temperatureInput, thaw: e.target.value })}
              placeholder="e.g., 10"
            />
          </div>
          <button className="run-simulation-button" onClick={handleRunSimulation}>Run Temperature Simulation</button>
        </div>
      )}

      {simulationResult && (
        <div className="simulation-results-card">
          <h3>Simulation Results for {simulationResult.scenario}</h3>
          <p><strong>Input:</strong> {JSON.stringify(simulationResult.input)}</p>
          <p><strong>Simulation Output:</strong> {simulationResult.output}</p>
          <p><strong>Impact:</strong> {simulationResult.map}</p>
          <div className="risk-level-display">
            <h4>Simulated Risk Level: <span className={`risk-${simulationResult.riskLevel}`}>{simulationResult.riskLevel}</span></h4>
          </div>

        </div>
      )}
    </div>
  );
};

export default WhatIfTool;
