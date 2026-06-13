import React from 'react';
import './Sensors.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MineOverview from './MineOverview';
import { useParams } from 'react-router-dom';

const locationsData = [
  {
    id: 'loc1',
    name: 'Jharia Coalfield - Section A',
    details: 'Details for Jharia Coalfield - Section A. This includes comprehensive sensor data, historical trends, and real-time alerts.',
    mineData: {
      name: 'Jharia Coalfield - Section A',
      location: 'Jharkhand, India',
      coordinates: '23.7644° N, 86.4131° E',
      status: 'Active Mine',
      lastInspection: '3 days ago',
    },
    alertStatus: 'high', // Derived from sensorData for demonstration
    sensorData: [
      {
        id: 'strain',
        name: 'Strain',
        icon: '&#x231B;', // Placeholder for strain icon
        value: '78µε',
        threshold: '75µε',
        status: 'error', // error, warning, success
      },
      {
        id: 'temperature',
        name: 'Temperature',
        icon: '&#x1F321;', // Thermometer icon for temperature
        value: '32°C',
        threshold: '40°C',
        status: 'success',
      },
      {
        id: 'rainfall',
        name: 'Rainfall',
        icon: '&#x2614;', // Placeholder for rainfall icon
        value: '125mm',
        threshold: '100mm',
        status: 'error',
      },
      {
        id: 'pore_pressure',
        name: 'Pore Pressure',
        icon: '&#x2100;', // Placeholder for pore pressure icon
        value: '45kPa',
        threshold: '50kPa',
        status: 'warning',
      },
      {
        id: 'slope_angle',
        name: 'Slope Angle',
        icon: '&#x2302;', // Placeholder for slope angle icon
        value: '67°',
        threshold: '60°',
        status: 'error',
      },
      {
        id: 'vibration',
        name: 'Vibration',
        icon: '&#x23F0;', // Placeholder for vibration icon
        value: '0.8mm/s',
        threshold: '1mm/s',
        status: 'success',
      },
    ],
    chartData: [
      { name: 'Jan', incidents: 15, casualties: 2, other: 5 },
      { name: 'Feb', incidents: 20, casualties: 3, other: 6 },
      { name: 'Mar', incidents: 18, casualties: 1, other: 3 },
      { name: 'Apr', incidents: 30, casualties: 4, other: 8 },
      { name: 'May', incidents: 25, casualties: 2, other: 5 },
      { name: 'Jun', incidents: 28, casualties: 1, other: 7 },
    ],
  },
  {
    id: 'loc2',
    name: 'Raniganj Coalfield - Area B',
    details: 'Details for Raniganj Coalfield - Area B. This includes comprehensive sensor data, historical trends, and real-time alerts.',
    mineData: {
      name: 'Raniganj Coalfield - Area B',
      location: 'West Bengal, India',
      coordinates: '23.6° N, 87.1° E',
      status: 'Active Mine',
      lastInspection: '2 days ago',
    },
    alertStatus: 'success', // Derived from sensorData for demonstration
    sensorData: [
      {
        id: 'strain',
        name: 'Strain',
        icon: '&#x231B;', // Placeholder for strain icon
        value: '60µε',
        threshold: '75µε',
        status: 'success',
      },
      {
        id: 'temperature',
        name: 'Temperature',
        icon: '&#x1F321;', // Thermometer icon for temperature
        value: '35°C',
        threshold: '40°C',
        status: 'success',
      },
      {
        id: 'rainfall',
        name: 'Rainfall',
        icon: '&#x2614;', // Placeholder for rainfall icon
        value: '90mm',
        threshold: '100mm',
        status: 'success',
      },
      {
        id: 'pore_pressure',
        name: 'Pore Pressure',
        icon: '&#x2100;', // Placeholder for pore pressure icon
        value: '40kPa',
        threshold: '50kPa',
        status: 'success',
      },
      {
        id: 'slope_angle',
        name: 'Slope Angle',
        icon: '&#x2302;', // Placeholder for slope angle icon
        value: '55°',
        threshold: '60°',
        status: 'success',
      },
      {
        id: 'vibration',
        name: 'Vibration',
        icon: '&#x23F0;', // Placeholder for vibration icon
        value: '0.5mm/s',
        threshold: '1mm/s',
        status: 'success',
      },
    ],
    chartData: [
      { name: 'Jan', incidents: 10, casualties: 1, other: 3 },
      { name: 'Feb', incidents: 15, casualties: 2, other: 4 },
      { name: 'Mar', incidents: 12, casualties: 1, other: 2 },
      { name: 'Apr', incidents: 20, casualties: 3, other: 5 },
      { name: 'May', incidents: 18, casualties: 2, other: 4 },
      { name: 'Jun', incidents: 22, casualties: 1, other: 6 },
    ],
  },
];

const Sensors = () => {
  const { id } = useParams();
  const selectedLocation = locationsData.find((loc) => loc.id === id);


  if (!selectedLocation) {
    return <div className="sensors-page"><h1>Location not found</h1></div>;
  }

  return (
    <div className="sensors-page">
      <header className="sensors-page-header">
        <div className="sensors-page-title-container">
          <h1 className="sensors-page-title">Sensors</h1>
          <div className="sensors-page-title-underline"></div>
        </div>
      </header>
      <MineOverview mineData={selectedLocation.mineData} sensorData={selectedLocation.sensorData} />
      
      <div className="chart-container">
        <h2 className="chart-title">Mining Incidents & Casualties Timeline</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={selectedLocation.chartData || []}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff7300" stopOpacity={0.7}/>
                <stop offset="100%" stopColor="#ff7300" stopOpacity={0.8}/>
              </linearGradient>
              <linearGradient id="colorOther" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD700" stopOpacity={0.7}/>
                <stop offset="100%" stopColor="#FFD700" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorCasualties" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff0000" stopOpacity={0.7}/>
                <stop offset="100%" stopColor="#ff0000" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} />
            <Area type="monotone" dataKey="incidents" stackId="1" stroke="#ff7300" fill="url(#colorIncidents)" />
            <Area type="monotone" dataKey="other" stackId="1" stroke="#FFD700" fill="url(#colorOther)" />
            <Area type="monotone" dataKey="casualties" stackId="1" stroke="#ff0000" fill="url(#colorCasualties)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Sensors;
