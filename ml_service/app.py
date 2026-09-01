from flask import Flask, request, jsonify, Response
import joblib
import pandas as pd
from flask_cors import CORS
import os
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import numpy as np # Import numpy

import db

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)

# Anything larger is rejected before Flask reads it into memory. Uploads are
# stored as rows, and a hosted database is not the place for large binaries.
MAX_UPLOAD_MB = int(os.environ.get('MAX_UPLOAD_MB', '10'))
app.config['MAX_CONTENT_LENGTH'] = MAX_UPLOAD_MB * 1024 * 1024

# CORS(app) with no arguments allows every origin on the internet to call this
# service with the browser's credentials attached. Fine while everything is on
# localhost, wrong once it is public — so the allowed origins come from the
# environment, and local dev ports stay in the list as a convenience.
_default_origins = 'http://localhost:5173,http://127.0.0.1:5173'
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get('ALLOWED_ORIGINS', _default_origins).split(',')
    if origin.strip()
]
CORS(app, origins=ALLOWED_ORIGINS)

# Create the tables if they are not there yet. Wrapped because the service must
# still boot and serve /predict when the database is unreachable — inference
# does not need it, and a health check that dies on a database blip makes
# deploys much harder to debug.
try:
    db.init_schema()
    print(f"Database ready. Allowed origins: {ALLOWED_ORIGINS}")
except Exception as exc:
    print(f"WARNING: database unavailable at startup ({exc}). "
          f"Auth and upload endpoints will return 503 until it recovers.")


def _require_db(fn):
    """Turn a missing/broken database into a clear 503 instead of a 500."""
    from functools import wraps

    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            return fn(*args, **kwargs)
        except db.DatabaseNotConfigured as exc:
            return jsonify({'error': str(exc)}), 503
    return wrapper


@app.route('/api/health', methods=['GET'])
def health():
    """Render pings this to know the service is alive, and it doubles as the
    quickest way to tell whether the database link is actually working."""
    try:
        with db.get_cursor() as cur:
            cur.execute('SELECT 1')
        database = 'connected'
    except Exception as exc:
        database = f'unavailable: {exc}'

    return jsonify({
        'status': 'ok',
        'database': database,
        'models_loaded': probability_pipeline is not None,
    }), 200

# # Initialize Firebase Admin SDK # RemovedSSorry 
# cred = credentials.Certificate("ml_service/serviceAccountKey.json") # Removed
# firebase_admin_app = initialize_app(cred) # Removed

# # In-memory store for additional user data (for demonstration purposes) # Removed
# # In a real application, you would use a database (e.g., MongoDB, PostgreSQL) # Removed
# user_data_store = {} # Removed

# Authentication used to be backed by an Excel workbook kept in the repository.
# It was replaced by Postgres (see db.py) because a hosted filesystem does not
# persist: every deploy and restart wiped it, and because the file was itself
# committed, a deploy actively reverted it to whatever was last checked in.

# Load the trained pipelines and feature names
try:
    # Changed from single model_pipeline to two regressors
    # Resolved against this file's own directory, not the working directory.
    # The old 'ml_service/...' paths only worked when the process happened to
    # start from the repository root — but `import db` needs ml_service itself
    # on sys.path, so gunicorn has to start from inside that folder, and the
    # two requirements contradicted each other. Absolute paths satisfy both.
    probability_pipeline = joblib.load(os.path.join(BASE_DIR, 'rockfall_probability_pipeline.joblib'))
    time_to_impact_pipeline = joblib.load(os.path.join(BASE_DIR, 'rockfall_time_to_impact_pipeline.joblib'))
    model_features = joblib.load(os.path.join(BASE_DIR, 'model_features.joblib'))
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

# --------------------------------------------------------------------------
# Authentication
#
# Passwords go through werkzeug's generate_password_hash, which defaults to
# scrypt with a per-user salt — the same treatment the Excel ledger gave them.
# Only the storage changed.
# --------------------------------------------------------------------------

@app.route('/api/signup', methods=['POST'])
@_require_db
def signup():
    data = request.get_json(silent=True) or {}

    full_name = data.get('fullName')
    email = data.get('email')
    password = data.get('password')
    user_role = data.get('userRole')
    mine_location = data.get('mineLocation')
    phone_number = data.get('phoneNumber')

    if not all([full_name, email, password, user_role, mine_location, phone_number]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Cheap guards, but they are the difference between a real account and one
    # nobody can ever sign back into.
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    if '@' not in email:
        return jsonify({'error': 'Enter a valid email address'}), 400

    profile = db.create_user(
        full_name=full_name,
        email=email.strip(),
        password_hash=generate_password_hash(password),
        user_role=user_role,
        mine_location=mine_location,
        phone_number=phone_number,
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
    )

    if profile is None:
        return jsonify({'error': 'Email already registered'}), 409

    return jsonify({'message': 'User registered successfully', 'user': profile}), 201


@app.route('/api/login', methods=['POST'])
@_require_db
def login():
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    row = db.find_user_by_email(email.strip())

    # One message for both "no such user" and "wrong password". Distinguishing
    # them tells an attacker which addresses are registered.
    if row is None or not check_password_hash(row['password_hash'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({'message': 'Login successful', 'user': db.user_profile(row)}), 200


# --------------------------------------------------------------------------
# Uploads
#
# Files live in the database rather than on disk. Render's filesystem does not
# persist across restarts, so anything written next to the app is gone by the
# next deploy.
# --------------------------------------------------------------------------

@app.route('/api/uploads', methods=['POST'])
@_require_db
def create_upload():
    user_email = (request.form.get('email') or '').strip()
    if not user_email:
        return jsonify({'error': 'email is required'}), 400

    uploaded = request.files.get('file')
    if uploaded is None or not uploaded.filename:
        return jsonify({'error': 'No file provided'}), 400

    payload = uploaded.read()
    if not payload:
        return jsonify({'error': 'File is empty'}), 400

    record = db.save_upload(
        user_email=user_email,
        # secure_filename strips directory components, so an uploaded name like
        # "../../etc/passwd" cannot travel anywhere as a path later on.
        filename=secure_filename(uploaded.filename),
        content_type=uploaded.mimetype,
        data=payload,
    )

    return jsonify({
        'message': 'Upload stored',
        'upload': {
            'id': record['id'],
            'filename': record['filename'],
            'contentType': record['content_type'],
            'sizeBytes': record['size_bytes'],
            'uploadedAt': record['uploaded_at'].isoformat() if hasattr(record['uploaded_at'], 'isoformat') else str(record['uploaded_at']),
        },
    }), 201


@app.route('/api/uploads', methods=['GET'])
@_require_db
def get_uploads():
    user_email = (request.args.get('email') or '').strip()
    if not user_email:
        return jsonify({'error': 'email is required'}), 400

    rows = db.list_uploads(user_email)
    return jsonify({'uploads': [{
        'id': r['id'],
        'filename': r['filename'],
        'contentType': r['content_type'],
        'sizeBytes': r['size_bytes'],
        'uploadedAt': r['uploaded_at'].isoformat() if hasattr(r['uploaded_at'], 'isoformat') else str(r['uploaded_at']),
    } for r in rows]}), 200


@app.route('/api/uploads/<int:upload_id>', methods=['GET'])
@_require_db
def download_upload(upload_id):
    user_email = (request.args.get('email') or '').strip()
    if not user_email:
        return jsonify({'error': 'email is required'}), 400

    row = db.get_upload(upload_id, user_email)
    if row is None:
        return jsonify({'error': 'Not found'}), 404

    return Response(
        bytes(row['data']),
        mimetype=row['content_type'] or 'application/octet-stream',
        headers={'Content-Disposition': f'attachment; filename="{row["filename"]}"'},
    )


@app.errorhandler(413)
def upload_too_large(_):
    return jsonify({'error': f'File exceeds the {MAX_UPLOAD_MB}MB limit'}), 413


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
    # Local development only. In production gunicorn imports `app` from this
    # module and runs it — debug mode must never reach a public host, since its
    # error pages expose source and offer an interactive console.
    app.run(
        debug=os.environ.get('FLASK_DEBUG', '1') == '1',
        host='0.0.0.0',
        port=int(os.environ.get('PORT', '5000')),
    )
