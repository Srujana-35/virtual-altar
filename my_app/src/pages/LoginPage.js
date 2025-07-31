import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import './pages.css';
import config from '../config/config';

function Login() {
    const [mail, setmail] = useState("");
    const [password, setpassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [profilePhoto, setProfilePhoto] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        function updateProfilePhoto() {
            const token = localStorage.getItem('token');
            if (token) {
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    const parsed = JSON.parse(userInfo);
                    if (parsed.profile_photo) {
                        setProfilePhoto(`${config.apiUrl}/uploads/${parsed.profile_photo}`);
                        return;
                    }
                }
                setProfilePhoto('');
            } else {
                setProfilePhoto(null);
            }
        }
        updateProfilePhoto();
        window.addEventListener('storage', updateProfilePhoto);
        return () => window.removeEventListener('storage', updateProfilePhoto);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: mail,
                    password: password
                })
            });
            const data = await response.json();
            if (response.ok) {
                // Save the token to localStorage
                localStorage.setItem('token', data.token);
                // Save user information (with role) to localStorage
                localStorage.setItem('userInfo', JSON.stringify(data.user));
                
                // Redirect to intended page if present
                const redirectPath = localStorage.getItem('redirectAfterLogin');
                if (redirectPath) {
                    localStorage.removeItem('redirectAfterLogin');
                    navigate(redirectPath);
                } else if (data.user && data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/wall');
                }
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Error connecting to server");
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            {/* Header */}
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo">
                            <span className="logo-text">MiAltar</span>
                            <span className="logo-subtitle">Virtual Memorial</span>
                        </div>
                        <nav className="nav">
                            <Link to="/" className="nav-link">Home</Link>
                            {profilePhoto !== null ? (
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="profile-button"
                                    title="Profile"
                                    aria-label="Profile"
                                >
                                    {profilePhoto ? (
                                        <img
                                            src={profilePhoto}
                                            alt="Profile"
                                            className="profile-photo"
                                        />
                                    ) : (
                                        <span className="profile-placeholder">👤</span>
                                    )}
                                </button>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-primary">Login</Link>
                                    <Link to="/signup" className="btn btn-ghost">Sign Up</Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="login-main">
                <div className="container">
                    <div className="login-card">
                        <div className="login-header">
                            <h1 className="login-title">Welcome Back</h1>
                            <p className="login-subtitle">Sign in to your MiAltar account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input 
                                    type="email"
                                    placeholder="Enter your email"
                                    value={mail}
                                    onChange={(e) => setmail(e.target.value)}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="password-input-container">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setpassword(e.target.value)}
                                        className="form-input"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="password-toggle"
                                    >
                                        {showPassword ? "👁️" : "👁️‍🗨️"}
                                    </button>
                                </div>
                            </div>

                            <div className="login-options">
                                <Link to="/forgot-password" className="forgot-password-link">
                                    Forgot your password?
                                </Link>
                            </div>

                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? "Signing In..." : "Sign In"}
                            </button>

                            {error && <div className="message message-error">{error}</div>}
                        </form>

                        <div className="login-footer">
                            <p>Don't have an account? <Link to="/signup" className="text-primary">Sign up here</Link></p>
                        </div>
                    </div>
                    
                    {/* Visual section for larger screens */}
                    <div className="login-visual">
                        <h2>Create Beautiful Memorials</h2>
                        <p>Design and share meaningful virtual altars to honor your loved ones</p>
                        <div className="altar-preview">
                            <span style={{fontSize: '3rem'}}>🕯️</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;