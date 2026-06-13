import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './GroundVibrationChart.css'; // This CSS will also be used by the detail page

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const generateVibrationData = (timeframe, location) => {
  const dataPoints = [];
  const blastEvents = [];
  let labels = [];
  let maxPPV = 0;
  let timeOfMaxPPV = '';
  let totalPPV = 0;
  let blastCount = 0;

  const now = new Date();
  let interval = 1; // hours for 24h/7days, minutes for 1h
  let numPoints = 24; // Default for 24h

  // Simulate different data patterns based on location
  const locationFactor = location === 'Jharia Coalfield' ? 1 : location === 'Raniganj Coalfield' ? 1.2 : 0.8;

  if (timeframe === '1h') {
    interval = 5; // minutes
    numPoints = 12; // 12 * 5 minutes = 60 minutes
    for (let i = 0; i < numPoints; i++) {
      const date = new Date(now.getTime() - (numPoints - 1 - i) * interval * 60 * 1000);
      labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  } else if (timeframe === '24h') {
    for (let i = 0; i < numPoints; i++) {
      const date = new Date(now.getTime() - (numPoints - 1 - i) * interval * 60 * 60 * 1000);
      labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  } else if (timeframe === '7d') {
    numPoints = 7;
    for (let i = 0; i < numPoints; i++) {
      const date = new Date(now.getTime() - (numPoints - 1 - i) * 24 * 60 * 60 * 1000);
      labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
    }
  }

  for (let i = 0; i < numPoints; i++) {
    let ppv = parseFloat(((Math.random() * 3 + 0.5) * locationFactor).toFixed(1)); // Adjusted Base PPV to be lower and more variable
    let frequency = parseFloat(((Math.random() * 8 + 3) / locationFactor).toFixed(1)); // Adjusted Base Frequency

    // Simulate blast events (randomly)
    if (Math.random() < 0.15) { // 15% chance of a blast event
      ppv = parseFloat(((Math.random() * 15 + 10) * locationFactor).toFixed(1)); // Higher PPV for blasts
      frequency = parseFloat(((Math.random() * 8 + 2) / locationFactor).toFixed(1)); // Lower frequency for blasts
      blastEvents.push({ time: labels[i], ppv: ppv, frequency: frequency, event: `Blast ${blastCount + 1}` });
      blastCount++;
    }

    dataPoints.push({ ppv, frequency });

    if (ppv > maxPPV) {
      maxPPV = ppv;
      timeOfMaxPPV = labels[i];
    }
    totalPPV += ppv;
  }

  return {
    labels,
    datasets: [
      {
        label: 'Peak Particle Velocity (mm/s)',
        data: dataPoints.map(dp => dp.ppv),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Frequency (Hz)',
        data: dataPoints.map(dp => dp.frequency),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1',
      },
    ],
    summary: {
      maxPPV,
      timeOfMaxPPV,
      averagePPV: (totalPPV / numPoints).toFixed(1),
      blastEvents: blastCount,
    }
  };
};

const GroundVibrationDetailPage = ({ onBackToDashboard }) => {
  const [timeframe, setTimeframe] = useState('24h');
  const [selectedLocation, setSelectedLocation] = useState('Jharia Coalfield'); // New state for location
  const [chartData, setChartData] = useState(generateVibrationData('24h', 'Jharia Coalfield'));

  useEffect(() => {
    setChartData(generateVibrationData(timeframe, selectedLocation));
  }, [timeframe, selectedLocation]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: `Ground Vibration Data for ${selectedLocation} - Last ${timeframe === '1h' ? '1 Hour' : timeframe === '24h' ? '24 Hours' : '7 Days'}`, 
        color: '#e0e0e0',
        font: { size: 18 }
      },
      legend: {
        labels: {
          color: '#e0e0e0',
        }
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#e0e0e0' },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'PPV (mm/s)',
          color: '#e53e3e',
        },
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#e0e0e0' },
        suggestedMax: 20,
        suggestedMin: 0,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Frequency (Hz)',
          color: '#63b3ed',
        },
        grid: { drawOnChartArea: false },
        ticks: { color: '#e0e0e0' },
        suggestedMax: 20,
        suggestedMin: 0,
      },
    },
  };

  const ppvThresholdHigh = 10; // mm/s
  const ppvThresholdMedium = 5; // mm/s

  const getPPVColor = (ppv) => {
    if (ppv >= ppvThresholdHigh) return '#e53e3e'; // Red
    if (ppv >= ppvThresholdMedium) return '#dd6b20'; // Orange
    return '#48bb78'; // Green
  };

  return (
    <div className="ground-vibration-chart-container">
      <div className="chart-header"> 
        <h2>Ground Vibration Data - Detailed View</h2>
        <div className="controls-container">
          <div className="timeframe-selector">
            <button onClick={() => setTimeframe('1h')} className={timeframe === '1h' ? 'active' : ''}>Last 1h</button>
            <button onClick={() => setTimeframe('24h')} className={timeframe === '24h' ? 'active' : ''}>Last 24h</button>
            <button onClick={() => setTimeframe('7d')} className={timeframe === '7d' ? 'active' : ''}>Last 7 Days</button>
          </div>
          <select onChange={(e) => setSelectedLocation(e.target.value)} value={selectedLocation} className="location-selector">
            <option value="Jharia Coalfield">Jharia Coalfield</option>
            <option value="Raniganj Coalfield">Raniganj Coalfield</option>
            <option value="Bokaro Coalfield">Bokaro Coalfield</option>
          </select>
          <button onClick={onBackToDashboard} className="back-to-dashboard-button">Back to Dashboard</button>
        </div>
      </div>
      
      <div className="chart-area">
        <Line data={chartData} options={options} />
        <>
          <div className="threshold-line high" style={{ bottom: `${(ppvThresholdHigh / options.scales.y.suggestedMax) * 100}%` }}>High Risk (&gt;{ppvThresholdHigh} mm/s)</div>
          
        </>
      </div>

      <div className="summary-statistics">
        <div className="stat-card">
          <h4>Max PPV (Last {timeframe === '1h' ? '1h' : timeframe === '24h' ? '24h' : '7d'}) for {selectedLocation}:</h4>
          <p style={{ color: getPPVColor(chartData.summary.maxPPV) }}>{chartData.summary.maxPPV} mm/s</p>
        </div>
        <div className="stat-card">
          <h4>Time of Max PPV for {selectedLocation}:</h4>
          <p>{chartData.summary.timeOfMaxPPV}</p>
        </div>
        <div className="stat-card">
          <h4>Average PPV for {selectedLocation}:</h4>
          <p>{chartData.summary.averagePPV} mm/s</p>
        </div>
        <div className="stat-card">
          <h4>Blast Events Detected for {selectedLocation}:</h4>
          <p>{chartData.summary.blastEvents}</p>
        </div>
      </div>

      {/* Optional: Integrated Contextual Information */}
      <div className="contextual-info">
        <h4>Associated Sensor: <span className="sensor-id">MS-001 - {selectedLocation}</span></h4>
        <h4>Location: <span className="sensor-location">{selectedLocation}</span></h4>
        <h4>Weather: <span className="weather-condition">Clear, 10 km/h Wind</span></h4>
      </div>
    </div>
  );
};

export default GroundVibrationDetailPage;
