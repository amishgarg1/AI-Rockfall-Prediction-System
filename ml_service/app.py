from flask import Flask, request, jsonify
import joblib
import pandas as pd
# from firebase_admin import credentials, auth, initialize_app # Removed
from flask_cors import CORS
import os
from werkzeug.security import generate_password_hash, check_password_hash
import numpy as np # Import numpy

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# # Initialize Firebase Admin SDK # RemovedSSorry 
# cred = credentials.Certificate("ml_service/serviceAccountKey.json") # Removed
# firebase_admin_app = initialize_app(cred) # Removed

# # In-memory store for additional user data (for demonstration purposes) # Removed
# # In a real application, you would use a database (e.g., MongoDB, PostgreSQL) # Removed
# user_data_store = {} # Removed

# Define the path for the Excel file
USER_DATA_FILE = 'data/users.xlsx' # Updated path

# Function to load user data from Excel
def load_users():
    if os.path.exists(USER_DATA_FILE):
        try:
            import math
            df = pd.read_excel(USER_DATA_FILE)
            users_list = df.to_dict(orient='records')
            
            # Convert float nan values to None so they serialize to standard JSON null
            cleaned_users = []
            for user in users_list:
                cleaned_user = {}
                for k, v in user.items():
                    if isinstance(v, float) and math.isnan(v):
                        cleaned_user[k] = None
                    else:
                        cleaned_user[k] = v
                cleaned_users.append(cleaned_user)
            return cleaned_users
        except Exception as e:
            print(f"Error reading Excel file: {e}")
            return []
    return []

# Function to save user data to Excel
def save_users(users_list):
    try:
        os.makedirs(os.path.dirname(USER_DATA_FILE), exist_ok=True)
        df = pd.DataFrame(users_list)
        df.to_excel(USER_DATA_FILE, index=False)
    except Exception as e:
        print(f"Error writing to Excel file: {e}")

# Load the trained pipelines and feature names
try:
    # Changed from single model_pipeline to two regressors
    probability_pipeline = joblib.load('ml_service/rockfall_probability_pipeline.joblib')
    time_to_impact_pipeline = joblib.load('ml_service/rockfall_time_to_impact_pipeline.joblib')
    model_features = joblib.load('ml_service/model_features.joblib')
    print("ML Probability and Time to Impact Models and features loaded successfully.")
except Exception as e:
    print(f"Error loading ML models or features: {e}")
    probability_pipeline = None
    time_to_impact_pipeline = None
    model_features = None

# Function to simulate Factor of Safety (must match train_model.py logic)
def calculate_factor_of_safety(row):
    fs = 2.5
    if row['Slope_Angle'] > 45: fs -= 0.8
    elif row['Slope_Angle'] > 30: fs -= 0.4
    elif row['Slope_Angle'] > 15: fs -= 0.1
    if row['Rainfall'] > 40: fs -= 0.6
    elif row['Rainfall'] > 20: fs -= 0.3
    if row['Rock_Type'] == 'Sedimentary': fs -= 0.5
    elif row['Rock_Type'] == 'Metamorphic': fs -= 0.2
    if row['Change_in_NDVI'] < -0.03: fs -= 0.3
    if row['Soil_Moisture'] > 35: fs -= 0.3
    if row['Blast_Vibration'] > 0.2: fs -= 0.4
    if row['Seismic_Vibration'] > 0.03: fs -= 0.2
    return max(0.5, round(fs, 2))

# @app.route('/api/login', methods=['POST']) # Removed
# def login(): # Removed
#     try: # Removed
#         id_token = request.headers.get('Authorization').split('Bearer ')[1] # Removed
#         decoded_token = auth.verify_id_token(id_token) # Removed
#         uid = decoded_token['uid'] # Removed
        
#         # Here you can retrieve any additional user data from your database # Removed
#         # For now, let's just return a success message and dummy data # Removed
#         user_info = user_data_store.get(uid, {"message": "User logged in via Firebase", "uid": uid}) # Removed
        
#         return jsonify({"success": True, "user": user_info}), 200 # Removed
#     except Exception as e: # Removed
#         print(f"Login error: {e}") # Removed
#         return jsonify({"error": "Unauthorized", "details": str(e)}), 401 # Removed

# @app.route('/api/signup', methods=['POST']) # Removed
# def signup(): # Removed
#     try: # Removed
#         data = request.get_json() # Removed
#         email = data.get('email') # Removed
#         password = data.get('password') # Removed
#         additional_data = data.get('additional_data', {}) # For example, 'role', 'mine_location' # Removed

#         if not email or not password: # Removed
#             return jsonify({"error": "Email and password are required"}), 400 # Removed

#         # Create user in Firebase Authentication # Removed
#         user = auth.create_user(email=email, password=password) # Removed
#         uid = user.uid # Removed

#         # Store additional data in our in-memory store # Removed
#         user_data_store[uid] = { # Removed
#             "email": email, # Removed
#             "additional_info": additional_data # Removed
#         } # Removed

#         return jsonify({"success": True, "uid": uid, "message": "User created successfully"}), 201 # Removed

#     except Exception as e: # Removed
#         print(f"Signup error: {e}") # Removed
#         # Firebase authentication errors can be more specific, e.g., 'auth/email-already-exists' # Removed
#         return jsonify({"error": "Failed to create user", "details": str(e)}), 400 # Removed

# New endpoint for Excel-based signup
@app.route('/api/signup-excel', methods=['POST'])
def signup_excel():
    data = request.get_json()
    full_name = data.get('fullName')
    email = data.get('email')
    password = data.get('password')
    user_role = data.get('userRole')
    mine_location = data.get('mineLocation')
    phone_number = data.get('phoneNumber')
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if not all([full_name, email, password, user_role, mine_location, phone_number]):
        return jsonify({'error': 'Missing required fields'}), 400

    users = load_users()
    if any(user['email'] == email for user in users):
        return jsonify({'error': 'Email already registered'}), 409 # Conflict

    hashed_password = generate_password_hash(password) # Hash the password

    new_user = {
        'fullName': full_name,
        'email': email,
        'password': hashed_password, # Store hashed password
        'userRole': user_role,
        'mineLocation': mine_location,
        'phoneNumber': phone_number,
        'latitude': latitude,
        'longitude': longitude,
    }
    users.append(new_user)
    save_users(users)

    return jsonify({'message': 'User registered successfully via Excel'}), 201

# New endpoint for Excel-based login
@app.route('/api/login-excel', methods=['POST'])
def login_excel():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    users = load_users()
    user = next((u for u in users if u['email'] == email), None)

    if user and check_password_hash(user['password'], password):
        # Return full user profile (excluding password)
        user_info = {k: v for k, v in user.items() if k != 'password'}
        return jsonify({'message': 'Login successful', 'user': user_info}), 200
    else:
        return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/predict', methods=['POST'])
def predict_rockfall():
    if probability_pipeline is None or time_to_impact_pipeline is None or model_features is None:
        return jsonify({'error': 'ML models not loaded.'}), 500

    data = request.get_json(force=True)
    if not data:
        return jsonify({'error': 'No input data provided.'}), 400

    try:
        # Ensure 'Date' is handled as it was excluded from model training
        # Remove if present, as the model doesn't expect it.
        if 'Date' in data: # Make sure this is consistent with train_model.py
            del data['Date']

        # Convert input data to a DataFrame, ensuring the order of columns matches training
        input_df = pd.DataFrame([data])
        
        # Calculate Factor_of_Safety for the input data
        input_df['Factor_of_Safety'] = input_df.apply(calculate_factor_of_safety, axis=1)
        
        # Reindex the input_df to match the feature order during training
        # Fill missing columns with 0 or a suitable default, depending on your data.
        for col in model_features:
            if col not in input_df.columns:
                input_df[col] = 0.0 # Or a sensible default for the feature

        input_df = input_df[model_features]
        
        # Get predictions from both regressors
        predicted_probability = probability_pipeline.predict(input_df)[0]
        predicted_time_to_impact = time_to_impact_pipeline.predict(input_df)[0]

        # Ensure probability is between 0 and 1
        predicted_probability = np.clip(predicted_probability, 0.0, 1.0)

        # Simple Trust Score heuristic (can be refined)
        # How close is FS to 1? Lower FS (closer to 1 or below) -> higher risk, potentially more 'trust' in a high prediction
        # If FS is very high, and AI predicts high prob, trust is low. If FS is low and AI predicts high prob, trust is high.
        fs_value = input_df['Factor_of_Safety'].iloc[0]
        
        # Example trust logic: higher trust when AI prediction aligns with FS, especially for instability
        trust_score = 0.0
        if fs_value < 1.0: # Unstable according to physics
            trust_score = 1.0 - (1.0 - predicted_probability) # Higher prob, higher trust
        elif fs_value >= 1.0 and fs_value < 1.5: # Marginally stable
            trust_score = 1.0 - abs(predicted_probability - (1.5 - fs_value * 0.5)) # Trust if prob is around expected
        else: # Stable according to physics
            trust_score = 1.0 - predicted_probability # Lower prob, higher trust
        trust_score = np.clip(trust_score, 0.0, 1.0)
        
        return jsonify({
            'rockfall_probability': round(predicted_probability * 100, 2), # Convert to % for frontend
            'time_to_impact': round(predicted_time_to_impact, 2), # In hours, can be converted to days/hours on frontend
            'factor_of_safety': round(fs_value, 2),
            'trust_score': round(trust_score * 100, 2) # Convert to % for frontend
        })

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
