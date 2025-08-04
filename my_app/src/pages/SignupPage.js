import React, { useState, useEffect } from 'react'
import config from '../config/config';

import './pages.css';
import { Link, useNavigate } from "react-router-dom";
import mylogo from '../assets/mylogo.jpg';

function Signup() {
    const navigate = useNavigate();
    const [username, setusername] = useState("");
    const [mail, setmail] = useState("");
    const [password, setpassword] = useState("");
    const [repassword, setrepassword] = useState("");
    const [passwordStrength, setPasswordStrength] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    // OTP-related state
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [loading, setLoading] = useState(false);
    const [infoMsg, setInfoMsg] = useState("");
    const [otpTimer, setOtpTimer] = useState(180); // 3 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const [otpExpired, setOtpExpired] = useState(false);

    useEffect(() => {
        function updateProfilePhoto() {
            const token = localStorage.getItem('token');
            if (token) {
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    const parsed = JSON.parse(userInfo);
                    if (parsed.profile_photo) {
                        setProfilePhoto(parsed.profile_photo);
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

    // Password strength checker function
    function checkPasswordStrength(pw) {
      const validations = {
        length: pw.length >= 8,
        uppercase: /[A-Z]/.test(pw),
        lowercase: /[a-z]/.test(pw),
        number: /[0-9]/.test(pw),
        special: /[^A-Za-z0-9]/.test(pw)
      };
      
      const passedValidations = Object.values(validations).filter(Boolean).length;
      
      if (pw.length === 0) return { strength: "", validations, passedValidations };
      if (passedValidations <= 2) return { strength: "Weak", validations, passedValidations };
      if (passedValidations === 3 || passedValidations === 4) return { strength: "Medium", validations, passedValidations };
      if (passedValidations === 5) return { strength: "Strong", validations, passedValidations };
      return { strength: "Weak", validations, passedValidations };
    }

    const handlesubmit = async (e) => {
        e.preventDefault();
        if (password !== repassword) {
            alert("passwords do not match");
            return;
        }
        
        // Check if password is strong enough
        const passwordCheck = checkPasswordStrength(password);
        if (passwordCheck.strength !== "Strong") {
            alert("Please create a strong password that meets all requirements.");
            return;
        }
        
        setLoading(true);
        setOtpError("");
        setInfoMsg("");
        try {
            // Step 1: Request OTP
            const response = await fetch(`${config.apiBaseUrl}/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: mail
                })
            });
            const data = await response.json();
            if (response.ok) {
                setOtpStep(true);
                setInfoMsg("An OTP has been sent to your email. Please enter it below to verify.");
            } else {
                setOtpError(data.error || "Failed to send OTP");
            }
        } catch (err) {
            setOtpError("Error connecting to server");
        }
        setLoading(false);
    };

    // Step 2: Handle OTP verification and signup
    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setOtpError("");
        setInfoMsg("");
        try {
            const response = await fetch(`${config.apiBaseUrl}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: mail,
                    otp: otp,
                    username: username,
                    password: password
                })
            });
            const data = await response.json();
            if (response.ok) {
                // Save user information to localStorage for immediate access
                const userInfo = {
                    username: username,
                    email: mail
                };
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                alert("Signup successful!");
                navigate("/login");
            } else {
                setOtpError(data.error || "OTP verification failed");
            }
        } catch (err) {
            setOtpError("Error connecting to server");
        }
        setLoading(false);
    };

    // Start OTP timer when otpStep becomes true
    React.useEffect(() => {
      let interval;
      if (otpStep) {
        setOtpTimer(180);
        setCanResend(false);
        setOtpExpired(false);
        interval = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setCanResend(true);
              setOtpExpired(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [otpStep]);

    // Resend OTP handler
    const handleResendOtp = async () => {
      setLoading(true);
      setOtpError("");
      setInfoMsg("");
      try {
        const response = await fetch(`${config.apiBaseUrl}/auth/request-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: mail })
        });
        const data = await response.json();
        if (response.ok) {
          setOtpTimer(180);
          setCanResend(false);
          setOtpExpired(false);
          setInfoMsg('OTP resent to your email.');
          // Restart timer
          let interval = setInterval(() => {
            setOtpTimer((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                setCanResend(true);
                setOtpExpired(true);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setOtpError(data.error || 'Failed to resend OTP');
        }
      } catch (err) {
        setOtpError('Error connecting to server');
      }
      setLoading(false);
    };

    return (
        <div className="signup-page">
            {/* Header */}
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo">
                            <img src={mylogo} alt="MiAltar Logo" className="logo-image" />
                            <div className="logo-text-container">
                                <span className="logo-text">MiAltar</span>
                                <span className="logo-subtitle">Virtual Memorial</span>
                            </div>
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
                                    <Link to="/login" className="btn btn-ghost">Login</Link>
                                    <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="signup-main">
                <div className="container">
                    <div className="signup-card">
                        <div className="signup-header">
                            <h1 className="signup-title">Create Your Account</h1>
                            <p className="signup-subtitle">Join MiAltar to create beautiful virtual memorials</p>
                        </div>

                        {!otpStep ? (
                            <form onSubmit={handlesubmit} className="signup-form">
                                <div className="form-group">
                                    <label className="form-label">Username</label>
                                    <input 
                                        type="text"
                                        value={username}
                                        onChange={(e) => setusername(e.target.value)}
                                        placeholder="Enter your username"
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input 
                                        type="email"
                                        value={mail}
                                        onChange={(e) => setmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <div className="password-input-container">
                                        <input 
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => {
                                                setpassword(e.target.value);
                                                setPasswordStrength(checkPasswordStrength(e.target.value));
                                            }}
                                            placeholder="Create a strong password"
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
                                    {password && (
                                        <div className="password-requirements">
                                            <div className={`password-strength ${passwordStrength.strength?.toLowerCase()}`}>
                                                Password Strength: {passwordStrength.strength || "Enter password"}
                                            </div>
                                            <div className="validation-checks">
                                                <div className={`validation-check ${passwordStrength.validations?.length ? 'passed' : 'failed'}`}>
                                                    {passwordStrength.validations?.length ? '✅' : '❌'} At least 8 characters
                                                </div>
                                                <div className={`validation-check ${passwordStrength.validations?.uppercase ? 'passed' : 'failed'}`}>
                                                    {passwordStrength.validations?.uppercase ? '✅' : '❌'} One uppercase letter (A-Z)
                                                </div>
                                                <div className={`validation-check ${passwordStrength.validations?.lowercase ? 'passed' : 'failed'}`}>
                                                    {passwordStrength.validations?.lowercase ? '✅' : '❌'} One lowercase letter (a-z)
                                                </div>
                                                <div className={`validation-check ${passwordStrength.validations?.number ? 'passed' : 'failed'}`}>
                                                    {passwordStrength.validations?.number ? '✅' : '❌'} One number (0-9)
                                                </div>
                                                <div className={`validation-check ${passwordStrength.validations?.special ? 'passed' : 'failed'}`}>
                                                    {passwordStrength.validations?.special ? '✅' : '❌'} One special character (!@#$%^&*)
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Confirm Password</label>
                                    <div className="password-input-container">
                                        <input 
                                            type={showRePassword ? "text" : "password"}
                                            value={repassword}
                                            onChange={(e) => setrepassword(e.target.value)}
                                            placeholder="Confirm your password"
                                            className="form-input"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowRePassword((prev) => !prev)}
                                            className="password-toggle"
                                        >
                                            {showRePassword ? "👁️" : "👁️‍🗨️"}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                    {loading ? "Sending OTP..." : "Create Account"}
                                </button>

                                {otpError && <div className="message message-error">{otpError}</div>}
                                {infoMsg && <div className="message message-success">{infoMsg}</div>}
                            </form>
                        ) : (
                            <form onSubmit={handleOtpSubmit} className="signup-form">
                                <div className="form-group">
                                    <label className="form-label">Enter OTP</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter 6-digit OTP"
                                        className="form-input"
                                        required
                                        maxLength={6}
                                        disabled={otpExpired}
                                    />
                                    <div className={`otp-timer ${otpExpired ? 'expired' : ''}`}>
                                        {!canResend
                                            ? `Expires in: ${String(Math.floor(otpTimer / 60)).padStart(2, '0')}:${String(otpTimer % 60).padStart(2, '0')}`
                                            : 'OTP expired. You can request a new one.'}
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary btn-full" disabled={loading || otpExpired}>
                                    {loading ? "Verifying..." : "Verify OTP & Complete Signup"}
                                </button>

                                {canResend && (
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                        className="btn btn-secondary btn-full"
                                    >
                                        {loading ? 'Resending...' : 'Resend OTP'}
                                    </button>
                                )}

                                {otpError && <div className="message message-error">{otpError}</div>}
                                {infoMsg && <div className="message message-success">{infoMsg}</div>}
                            </form>
                        )}

                        <div className="signup-footer">
                            <p>Already have an account? <Link to="/login" className="text-primary">Login here</Link></p>
                        </div>
                    </div>
                    
                    {/* Visual section for larger screens */}
                    <div className="signup-visual">
                        <h2>Start Your Memorial Journey</h2>
                        <p>Create meaningful virtual altars to honor and remember your loved ones with beautiful designs and heartfelt tributes</p>
                        <div className="altar-preview">
                            <span className="candle-symbol" style={{fontSize: '3rem'}}>🕯️</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;