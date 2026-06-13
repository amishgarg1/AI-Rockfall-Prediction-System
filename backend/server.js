const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const fetch = require('node-fetch').default; // Correct import for node-fetch v3 with CommonJS

// ======================================================================
// --- Firebase & Express Initialization ---
// ======================================================================

// Firebase is optional — server still starts without the credentials file.
let db = null;
try {
  const serviceAccount = require('./mining-90eeb-firebase-adminsdk-fbsvc-be841ba6ab.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = admin.firestore();
  console.log('Firebase Admin SDK initialized successfully.');
} catch (e) {
  console.warn('Firebase credentials not found or invalid — Firebase features will be disabled.', e.message);
}
const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5174' }));

// Handle OPTIONS requests for CORS preflight
app.options('/api/save-profile', cors());
app.options('/api/login', cors());

// ======================================================================
// --- API Endpoint for User Registration ---
// ======================================================================

// This endpoint is for saving the user's profile after client-side registration.
// It is the secure and correct way to handle registration data.
app.post('/api/save-profile', async (req, res) => {
  /**
   * This is a dedicated endpoint for saving a user's profile.
   * It expects an ID token in the header and profile data in the body.
   */
  const idToken = req.headers.authorization ? req.headers.authorization.split('Bearer ')[1] : null;

  if (!idToken) {
    return res.status(401).json({ error: "Unauthorized: No ID token provided." });
  }

  let decodedToken;
  try {
    // Verify the ID token to ensure the user is authenticated
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error(`Error verifying ID token: ${error.message}`);
    return res.status(401).json({ error: "Unauthorized: Invalid or expired ID token." });
  }

  const uid = decodedToken.uid;
  const email = decodedToken.email; // Get email from decoded token

  const data = req.body;
  const requiredFields = ['fullName', 'userRole', 'mineLocation'];
  if (!requiredFields.every(field => data[field])) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { fullName, userRole, mineLocation, phoneNumber, latitude, longitude } = data;

  try {
    // Save additional user data to Firestore
    const userProfileData = {
      fullName,
      email,
      userRole,
      mineLocation,
      phoneNumber,
      latitude: latitude || null,
      longitude: longitude || null,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("user_profiles").doc(uid).set(userProfileData);

    return res.status(201).json({
      message: `User profile for ${uid} saved successfully.`,
      userId: uid
    });
  } catch (error) {
    console.error(`An unexpected error occurred during profile save: ${error}`);
    return res.status(500).json({ error: "An internal server error occurred." });
  }
});

// ======================================================================
// --- API Endpoint for User Login ---
// ======================================================================
// This endpoint is for retrieving a user's profile after they have
// successfully logged in on the client-side.
app.post('/api/login', async (req, res) => {
  /**
   * Handles user login by verifying an ID token sent from the client-side.
   * This is the secure approach where client-side Firebase SDK handles email/password authentication.
   * The backend then verifies the authenticity of the ID token.
   */
  // Expect ID token in Authorization header
  const idToken = req.headers.authorization ? req.headers.authorization.split('Bearer ')[1] : null;

  if (!idToken) {
    return res.status(401).json({ error: "Unauthorized: No ID token provided." });
  }

  try {
    // Verify the ID token using the Firebase Admin SDK.
    // This securely authenticates the user.
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Optionally, retrieve additional user profile data from Firestore
    const userProfileDoc = await db.collection("user_profiles").doc(uid).get();
    const userProfile = userProfileDoc.exists ? userProfileDoc.data() : {};

    return res.status(200).json({
      message: 'Login successful.',
      uid: uid,
      email: decodedToken.email,
      userProfile: userProfile
    });

  } catch (error) {
    // Handle specific Firebase authentication errors for token verification
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: "ID token expired. Please log in again." });
    } else if (error.code === 'auth/argument-error') {
      return res.status(401).json({ error: "Invalid ID token." });
    }
    console.error(`Error verifying ID token: ${error.message}`);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ======================================================================
// --- API Endpoint for ML Predictions ---
// ======================================================================
app.post('/api/predict-rockfall', async (req, res) => {
  try {
    const mlServiceUrl = 'http://127.0.0.1:5000/predict'; // Flask app URL
    const response = await fetch(mlServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`ML Service error: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const predictionResult = await response.json();
    return res.status(200).json(predictionResult);

  } catch (error) {
    console.error(`Error during ML prediction request: ${error.message}`);
    return res.status(500).json({ error: "Failed to get prediction from ML service.", details: error.message });
  }
});

// ======================================================================
// --- Run the Express Application ---
// ======================================================================

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
