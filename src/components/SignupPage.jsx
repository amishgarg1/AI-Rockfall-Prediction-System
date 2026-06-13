import React, { useState } from 'react';
import './SignupPage.css';
// import { auth } from '../firebase'; // Removed
// import { createUserWithEmailAndPassword } from 'firebase/auth'; // Removed

const SignupPage = ({ onSignupSuccess, onClose }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userRole, setUserRole] = useState('');
    const [mineLocation, setMineLocation] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState(''); // Renamed from error to message
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); // New state for success message
    
    // State to store the location data if fetched
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);

    const [idProof, setIdProof] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSuccess(false); // Clear success state on new submission
        setIsLoading(true);

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            setIsLoading(false);
            return;
        }

        let success = false;
        let successMessage = '';
        let apiError = '';

        try {
            const response = await fetch('http://127.0.0.1:5000/api/signup-excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    password,
                    userRole,
                    mineLocation,
                    phoneNumber,
                    latitude,
                    longitude,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                success = true;
                successMessage = data.message || 'Signup successful! You can now log in.';
            } else {
                apiError = data.error || 'Signup failed. Please try again.';
            }
        } catch (err) {
            console.error('Error during signup:', err);
            apiError = 'Cannot connect to authentication service. Please make sure the server is running.';
        } finally {
            setIsLoading(false);
        }

        if (success) {
            setMessage(successMessage);
            setIsSuccess(true);
            setTimeout(() => {
                onSignupSuccess();
            }, 1500);
        } else if (apiError) {
            setMessage(apiError);
            setIsSuccess(false);
        }
    };
    
    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setLatitude(lat);
                    setLongitude(lon);
                    setMineLocation(`Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
                    console.log(`Location fetched: Lat=${lat}, Lon=${lon}`);
                },
                (error) => {
                    console.error('Error fetching location:', error);
                    setMessage('Could not fetch location. Please enter manually.');
                    setIsSuccess(false); // Ensure success is false on error
                }
            );
        } else {
            setMessage('Geolocation is not supported by your browser.');
            setIsSuccess(false); // Ensure success is false on error
        }
    };

    return (
        <div className="signup-page-overlay">
            <div className="signup-page-container">
                <button className="close-button" onClick={onClose}>&times;</button>
                <div className='header'>
                    <div className="logo-graphic">
                        <div className="mountain"></div>
                        <div className="letter-r">M</div>
                        <div className="signal"></div>
                        <div className="hexagons">
                            <div className="hexagon"></div>
                            <div className="hexagon small"></div>
                            <div className="hexagon"></div>
                            <div className="hexagon small"></div>
                        </div>
                    </div>
                    <div className="app-brand">
                        <h1>MineSafe</h1>
                        <p>AI & Geo-Data Platform</p>
                    </div>
                </div>
                <h2>Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <div className="input-with-icon">
                            
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-with-icon">
                            
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-with-icon">
                            
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="input-with-icon">
                            
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {/* User Role dropdown */}
                    <div className="form-group">
                        <label htmlFor="userRole">User Role</label>
                        <div className="select-with-icon">
                            <select
                                id="userRole"
                                name="userRole"
                                value={userRole}
                                onChange={(e) => setUserRole(e.target.value)}
                                required
                            >
                                <option value="">Select your role</option>
                                <option value="safety_manager">Safety Manager</option>
                                <option value="geotech_engineer">Geotechnical Specialist</option>
                                <option value="site_engineer">Site Engineer</option>
                                <option value="mine_surveyor">Mine Surveyor</option>
                                <option value="mine_manager">Mine Manager</option>
                            </select>
                            <i className="fas fa-chevron-down"></i>
                        </div>
                    </div>
                    {/* Mine/Site Location input with button */}
                    <div className="form-group">
                        <label htmlFor="mineLocation">Mine/Site Location</label>
                        <div className="input-with-button">
                            <input
                                type="text"
                                id="mineLocation"
                                name="mineLocation"
                                placeholder="Jharia Coalfield, Section A"
                                value={mineLocation}
                                onChange={(e) => setMineLocation(e.target.value)}
                                required
                            />
                            <button type="button" className="get-location-button" onClick={handleGetLocation}>Get Location</button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <div className="input-with-icon">
                            
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                placeholder="Enter your phone number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="idProof">Safety Manager ID Proof</label>
                        <div className="custom-upload-wrapper">
                            <label className="custom-upload-btn">
                                <input
                                    type="file"
                                    id="idProof"
                                    name="idProof"
                                    accept="image/*,application/pdf"
                                    onChange={e => setIdProof(e.target.files[0])}
                                    style={{ display: 'none' }}
                                />
                                <span>{idProof ? 'Change File' : 'Choose File'}</span>
                            </label>
                            <span className="id-proof-filename">{idProof ? idProof.name : 'No file chosen'}</span>
                        </div>
                    </div>
                    {message && <p className={isSuccess ? "success-message" : "error-message"}>{message}</p>}
                    <button type="submit" className="signup-submit-button" disabled={isLoading}>
                        {isLoading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
