export const initialAlerts = [
  {
    id: 'alert1',
    timestamp: '2024-07-26 10:30:00',
    severity: 'High',
    location: 'Jharia Coalfield - Section A',
    description: 'Methane levels exceeded safety threshold.',
    status: 'active',
    details: {
      currentReading: '7.5% LEL',
      thresholdValue: '5.0% LEL',
      timeOfExceedance: '2024-07-26 10:29:15',
      durationOfAlert: '1 hour 30 minutes',
      preciseCoordinates: { lat: 23.7644, lon: 86.4131 },
      assetsAtRisk: ['Ventilation Fan 3', 'Section A Personnel', 'Power Substation A'],
      sensorHealth: { batteryLevel: '98%', lastCalibration: '2024-06-01' },
      historicalData: {
        timeSeriesGraph: [
          { date: '2020', value: 5.0 },
          { date: '2021', value: 5.2 },
          { date: '2022', value: 6.1 },
          { date: '2023', value: 7.0 },
          { date: '2024', value: 7.3 },
          { date: '2025', value: 7.5 },
        ], // Actual chart data
        historicalPeak: { date: '2024-05-10', value: '8.2% LEL' },
      },
      actionableRecommendations: {
        sopLink: 'SOP-GAS-003: Evacuation & Ventilation',
        requiredActionChecklist: [
          'Verify ventilation system status.',
          'Initiate radio alert to on-site teams.',
          'Isolate power to the affected section.',
        ],
        escalationContact: { name: 'Safety Manager, R. Sharma', phone: '+91-9876543210' },
      },
      auditTrail: [
        '2024-07-25 09:00:00: Severity upgraded from Low to Medium by System.',
        '2024-07-26 10:29:15: Alert status changed to Active by System.',
      ],
    },
  },
  {
    id: 'alert2',
    timestamp: '2024-07-26 09:45:00',
    severity: 'Medium',
    location: 'Raniganj Coalfield - Area B',
    description: 'Vibration spike detected on Crusher-2.',
    status: 'active',
    details: {
      currentReading: '2.5mm/s',
      thresholdValue: '2.0mm/s',
      timeOfExceedance: '2024-07-26 09:44:30',
      durationOfAlert: '45 minutes',
      preciseCoordinates: { lat: 23.6, lon: 87.1 },
      assetsAtRisk: ['Crusher-2', 'Conveyor Belt C'],
      sensorHealth: { batteryLevel: '95%', lastCalibration: '2024-07-01' },
      historicalData: {
        timeSeriesGraph: [
          { date: '2020', value: 1.5 },
          { date: '2021', value: 1.8 },
          { date: '2022', value: 2.0 },
          { date: '2023', value: 2.5 },
          { date: '2024', value: 2.3 },
          { date: '2025', value: 2.1 },
        ], // Actual chart data
        historicalPeak: { date: '2024-04-20', value: '3.1mm/s' },
      },
      actionableRecommendations: {
        sopLink: 'SOP-MECH-005: Equipment Vibration Protocol',
        requiredActionChecklist: [
          'Inspect Crusher-2 for mechanical faults.',
          'Adjust operational speed.',
          'Notify maintenance team.',
        ],
        escalationContact: { name: 'Maintenance Head, S. Kumar', phone: '+91-9988776655' },
      },
      auditTrail: [
        '2024-07-26 09:44:30: Alert status changed to Active by System.',
      ],
    },
  },
  {
    id: 'alert3',
    timestamp: '2024-07-25 18:00:00',
    severity: 'Low',
    location: 'Bokaro Coalfield - Sector C',
    description: 'Minor rockfall detected by acoustic sensor.',
    status: 'resolved',
    details: {
      currentReading: '3 acoustic events/hr',
      thresholdValue: '5 acoustic events/hr',
      timeOfExceedance: '2024-07-25 17:58:00',
      durationOfAlert: '2 minutes (resolved)',
      preciseCoordinates: { lat: 23.78, lon: 85.87 },
      assetsAtRisk: ['Sector C Access Road'],
      sensorHealth: { batteryLevel: '99%', lastCalibration: '2024-06-15' },
      historicalData: {
        timeSeriesGraph: [
          { date: '2020', value: 4 },
          { date: '2021', value: 3 },
          { date: '2022', value: 2 },
          { date: '2023', value: 3 },
          { date: '2024', value: 3 },
        ], // Actual chart data
        historicalPeak: { date: '2024-03-01', value: '10 acoustic events/hr' },
      },
      actionableRecommendations: {
        sopLink: 'SOP-GEO-001: Rockfall Monitoring & Response',
        requiredActionChecklist: [
          'Visually inspect affected area.',
          'Clear minor debris.',
          'Document incident.',
        ],
        escalationContact: { name: 'Site Supervisor, A. Singh', phone: '+91-9765432109' },
      },
      auditTrail: [
        '2024-07-25 18:00:00: Alert status changed to Active by System.',
        '2024-07-25 18:02:00: Alert status changed to Resolved by System.',
      ],
    },
  },
  {
    id: 'alert4',
    timestamp: '2024-07-25 14:15:00',
    severity: 'High',
    location: 'Singrauli Coalfield - Block D',
    description: 'Sudden ground movement detected, potential landslide risk.',
    status: 'active',
    details: {
      currentReading: '15mm displacement',
      thresholdValue: '10mm displacement',
      timeOfExceedance: '2024-07-25 14:14:00',
      durationOfAlert: '3 hours 45 minutes',
      preciseCoordinates: { lat: 24.18, lon: 82.68 },
      assetsAtRisk: ['Block D Personnel', 'Slope Stability Zone 1', 'Haul Road D'],
      sensorHealth: { batteryLevel: '90%', lastCalibration: '2024-05-20' },
      historicalData: {
        timeSeriesGraph: [
          { date: '2020', value: 8 },
          { date: '2021', value: 10 },
          { date: '2022', value: 12 },
          { date: '2023', value: 15 },
          { date: '2024', value: 14 },
          { date: '2025', value: 13 },
        ], // Actual chart data
        historicalPeak: { date: '2023-11-12', value: '25mm displacement' },
      },
      actionableRecommendations: {
        sopLink: 'SOP-GEO-002: Ground Movement Emergency',
        requiredActionChecklist: [
          'Evacuate Block D immediately.',
          'Mobilize geotechnical engineers.',
          'Implement emergency slope stabilization.',
        ],
        escalationContact: { name: 'Mine Manager, P. Sharma', phone: '+91-9123456789' },
      },
      auditTrail: [
        '2024-07-25 14:14:00: Alert status changed to Active by System.',
      ],
    },
  },
  {
    id: 'alert5',
    timestamp: '2024-07-24 11:00:00',
    severity: 'Medium',
    location: 'Jharia Coalfield - Section A',
    description: 'Temperature sensor anomaly in tunnel 3.',
    status: 'acknowledged',
    details: {
      currentReading: '55°C',
      thresholdValue: '50°C',
      timeOfExceedance: '2024-07-24 10:58:00',
      durationOfAlert: 'Acknowledged (Previous Duration: 2 hours)',
      preciseCoordinates: { lat: 23.76, lon: 86.41 },
      assetsAtRisk: ['Tunnel 3', 'Ventilation System T3'],
      sensorHealth: { batteryLevel: '97%', lastCalibration: '2024-06-10' },
      historicalData: {
        timeSeriesGraph: [
          { date: '2020', value: 48 },
          { date: '2021', value: 50 },
          { date: '2022', value: 53 },
          { date: '2023', value: 55 },
          { date: '2024', value: 55 },
        ], // Actual chart data
        historicalPeak: { date: '2024-01-05', value: '60°C' },
      },
      actionableRecommendations: {
        sopLink: 'SOP-ENV-001: Temperature Anomaly Response',
        requiredActionChecklist: [
          'Check tunnel ventilation.',
          'Investigate source of heat.',
          'Monitor temperature actively.',
        ],
        escalationContact: { name: 'Environmental Officer, D. Gupta', phone: '+91-9012345678' },
      },
      auditTrail: [
        '2024-07-24 10:58:00: Alert status changed to Active by System.',
        '2024-07-24 11:00:00: Alert acknowledged by Operator S. Das.',
      ],
    },
  },
];
