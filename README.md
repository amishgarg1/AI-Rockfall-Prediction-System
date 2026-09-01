<div align="center">
  <h1>🏔️ MineSafe</h1>
  <p><b>Real-Time Geotechnical Slope Stability Monitoring & Early Warning System</b></p>

  <p>
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black&style=for-the-badge" alt="React" />
    <img src="https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&logoColor=white&style=for-the-badge" alt="Vite" />
    <img src="https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white&style=for-the-badge" alt="Python" />
    <img src="https://img.shields.io/badge/Flask-3.0-000000?logo=flask&logoColor=white&style=for-the-badge" alt="Flask" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white&style=for-the-badge" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Pandas-2.0-150458?logo=pandas&logoColor=white&style=for-the-badge" alt="Pandas" />
    <img src="https://img.shields.io/badge/Scikit--Learn-1.5-F7931E?logo=scikit-learn&logoColor=white&style=for-the-badge" alt="Scikit-Learn" />
  </p>

  <h3><a href="https://ai-rockfall-prediction-system-ivory.vercel.app/"><b>Try the live app &rarr;</b></a></h3>

</div>

<br />

**MineSafe** is a real-time Geotechnical Slope Stability Monitoring & Early Warning System designed for open-cast mining environments. It integrates real-time telemetry processing, machine learning-driven risk modeling, and physics-based stability engines to deliver warning alerts in environments where a missed slope failure costs lives.

---

## ⚙️ Hybrid Stability Engine: Machine Learning + Physics-Based Modeling

Relying solely on predictive machine learning models in safety-critical environments can introduce uncertainty. To address this, MineSafe implements a dual-validation engine combining empirical data modeling with analytical geotechnical physics:

```
 ┌────────────────────────────────────────────────────────┐
 │                      INPUT DATA                        │
 │     (Rock Type, Rainfall, Slope Angle, Moisture...)    │
 └───────────┬────────────────────────────────┬───────────┘
             │                                │
             ▼                                ▼
┌─────────────────────────┐      ┌────────────────────────┐
│  Scikit-Learn Pipeline  │      │  Physics-Based Engine  │
│  (Random Forest Reg)    │      │  (Limit Equilibrium)   │
└────────────┬────────────┘      └───────────┬────────────┘
             │                                │
      Predicts Probability                    Calculates Factor
        & Time-to-Impact                       of Safety (FS)
             │                                │
             └───────────────┬────────────────┘
                             │
                             ▼
             ┌────────────────────────────────┐
             │   AI vs. LEM Trust Evaluator   │
             │   (Dynamic Trust Score %)      │
             └────────────────────────────────┘
```

1. **Machine Learning Pipeline**: An ensemble of Random Forest Regressors trained on telemetry and geologic parameters predicts the **Failure Probability (%)** and estimated **Time-to-Impact (Hours)**.
2. **Physics-Based Geotechnical Engine**: Implements the Limit Equilibrium Method (LEM) to compute the **Factor of Safety (FS)** of the slope. An $FS < 1.0$ indicates a critical state of failure, while $FS \ge 1.5$ indicates standard operating stability.
3. **Dynamic Trust Evaluator**: A correlation engine maps the empirical predictions of the ML model against the physical boundaries calculated by the LEM. If a deviation occurs (e.g., the ML model flags a high-probability event but physics indicates stable structural conditions), the system surfaces a telemetry warning and adjusts the **Geotechnical Trust Score (%)** to alert safety personnel of sensor anomalies.

---

## 🖥️ Application Features & Modules

The platform is structured into specialized modules to support standard mining safety workflows:

### 1. Telemetry Dashboard (HUD)
- **Geographic Risk Heatmap**: An interactive SVG visualization rendering regional mining hubs colored by active geological risk severity.
- **Ground Vibration Analysis**: Real-time rendering of Peak Particle Velocity (PPV) blasting logs.
- **Sensor Status & KPI Hub**: Centralized monitoring of active telemetry channels, warning states, and critical system alerts.

### 2. Live Sensors Telemetry
- **Geotechnical Sensor Array**: Real-time telemetry monitoring for Strain, Temperature, Rainfall, Pore Pressure, Slope Inclinometers, and Ground Vibrations.
- **Dynamic Threshold Evaluation**: Custom alert triggers that flag sensor values violating critical operating limits:
  - **Strain limit**: $75\,\mu\epsilon$ (Micro-strain displacement)
  - **Rainfall limit**: $100\,\text{mm}$ (Accumulated 24-hour precipitation)
  - **Slope Inclinometer**: $60^\circ$ (Slope face angle)
  - **Pore Water Pressure**: $50\,\text{kPa}$
  - **Ground Vibration**: $1.0\,\text{mm/s}$ (Blasting tremor limit)

### 3. Alerts & Incident Control
- **Consolidated Log Viewer**: High, Medium, and Low severity events with sorting and filtering options by Timestamp, Severity, and Source.
- **Trigger Auditing**: Granular failure analysis explaining the exact parameter threshold crossings that triggered the safety incident.
- **Incident Mitigation Controls**: Direct interfaces for safety operators to acknowledge alarms, export incident logs, or simulate on-site emergency procedures.

### 4. Predictive Inference & Automated Auditing
- **On-Demand Inference**: Manual parameter input terminal to query the local Flask ML service for instant stability forecasting.
- **One-Click Audit Exporter**: Generates highly formatted PDF reports documenting active telemetry states, weather parameters, coordinates, and ML results directly from client-side DOM components using `html2canvas` and `jsPDF`.

### 5. What-If Geotechnical Simulator
Enables engineering personnel to simulate the stability impact of extreme environmental and operational events:
- **Precipitation Simulation**: Evaluates the impact of varying rainfall volumes and duration on soil saturation levels and pore-water pressure.
- **Blasting Simulation**: Models shear stress degradation and dynamic acceleration based on charge weight (kg TNT equivalent) and proximity.
- **Thermal Cycle Simulation**: Models freeze-thaw cycles (°C) to evaluate volumetric expansion stresses on jointed rock mass.

---

## 📊 Geotechnical Data Dictionary

Here is the data structure utilized by our inference models and physics calculators:

| Feature Name | Telemetry Unit | Sensor Source | Geotechnical Significance |
| :--- | :--- | :--- | :--- |
| **Rock_Type** | Categorical | Geology Database | Determines baseline cohesion and internal friction angle (Igneous, Metamorphic, Sedimentary). |
| **Rainfall** | mm / 24 hours | Live Piezometer / Weather | Controls pore-water pressure, reducing effective stress in joint planes. |
| **Slope_Angle** | Degrees (°) | Inclinometers | Higher angle values increase shear stress on the failure plane. |
| **NDVI** | -1.0 to 1.0 | Sentinel-2 Satellite | Normalized Difference Vegetation Index: measures slope vegetation cover. |
| **Change_in_NDVI** | Delta ($\Delta$) | Satellite Epoch Comparison | Negative delta flags active surface erosion or rock movement. |
| **Soil_Moisture** | Percentage (%) | TDR Moisture Probes | Correlates with soil shear strength degradation. |
| **Blast_Vibration** | mm/s (PPV) | Seismic Geophones | Peak Particle Velocity: measures structural stress from mine blasting. |
| **Seismic_Vibration** | g (acceleration) | Accelerometer Arrays | Tracks ambient seismic events or tectonic shifts. |

---

## 🧠 Data Pipeline & Machine Learning Implementation

### 1. Model Structure & Feature Processing
- **Predictive Models**: Built using Scikit-Learn ensemble estimators (`sklearn.ensemble.RandomForestRegressor`) to model the highly non-linear relationship between geological telemetry and slope failure.
  - **Probability Pipeline**: Forecasts slope failure probability (scaled from `0.0` to `1.0`).
  - **Time-to-Impact Pipeline**: Estimates the time window preceding structural failure (in hours).
- **Preprocessing Pipelines**: Configured via `ColumnTransformer` to guarantee zero data leakage:
  - **Numerical Features**: Scaled via `StandardScaler` to handle multi-unit sensors.
  - **Categorical Features**: Encoded using `OneHotEncoder` to handle discrete geological rock classifications.

### 2. PostgreSQL Persistence
- **Credential Storage**: User accounts live in PostgreSQL. Passwords are hashed with `scrypt` and a per-user salt before storage, so the database never holds a recoverable password.
- **Case-Insensitive Identity**: Email uniqueness is enforced by a database index on the lowercased address, which also prevents two simultaneous signups from racing past a look-then-insert check.
- **Uploaded Datasets**: Files submitted through the platform are stored as rows rather than on disk, so they survive the restarts and redeploys that reset a hosted filesystem.

---

## 🏗️ Architectural Design & Implementation Details

- **Asynchronous Telemetry Isolation**: React UI state rendering is decoupled from the asynchronous telemetry polling and ML inference cycles. This prevents backend network delays or transient API exceptions from degrading frontend responsiveness or triggering runtime crashes.
- **Build-Time API Resolution**: The frontend resolves the inference service from `VITE_API_URL` at build time, falling back to the loopback address for local development. Hardcoding a host would point every visitor's browser at their own machine once the site is served from anywhere but the developer's laptop.
- **Stateless Inference Service**: The Flask service holds no local state — accounts and uploads live in PostgreSQL, and the model pipelines are read-only. Any instance can therefore be restarted or replaced without losing data, which is what makes the service deployable on hosts that reset their filesystem between releases.
- **Direct Client-Side Document Compiling**: Dynamically translates the DOM tree into high-fidelity PDF documents utilizing `html2canvas` and `jsPDF`. This reduces server-side processing overhead and eliminates the need for remote headless print servers.

---

## 🚀 Setup & Execution Guide

Ensure you have **Python 3.9+** and **Node.js 18+** installed.

### 1. Clone & Install Dependencies
```bash
# Install root (Frontend) packages
npm install

# Install Express backend gateway packages
cd backend
npm install
cd ..
```

### 2. Install Python ML service dependencies
```bash
pip install pandas scikit-learn Flask openpyxl
```

### 3. Run System Services (Run in separate terminal windows)

#### Step A: Start Flask ML service (Port 5000)
```bash
python ml_service/app.py
```

#### Step B: Start Express Server (Port 5001)
```bash
cd backend
npm start
cd ..
```

#### Step C: Start Vite Frontend Server (Port 5173)
```bash
npm run dev
```

---

## 🌐 Production Deployment

The platform runs as two deployed services:

👉 **[https://ai-rockfall-prediction-system-ivory.vercel.app/](https://ai-rockfall-prediction-system-ivory.vercel.app/)**

| Component | Host | Role |
| :--- | :--- | :--- |
| **Frontend** | Vercel | React dashboard, telemetry views and the prediction console |
| **Inference API** | Render | Flask service running the Random Forest pipelines and the LEM engine |
| **Database** | Render PostgreSQL | User accounts and uploaded datasets |

The inference API runs on a free instance that sleeps after inactivity, so the
first request following an idle period takes around a minute to wake it. Loading
the dashboard once beforehand makes everything after it immediate.

Setup instructions for both services are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
