import React, { useState } from 'react';
import './pages.css';
import { Link ,useNavigate} from "react-router-dom";
function Signup() {
    const navigate = useNavigate();
    const [username, setusername] = useState("");
    const [mail, setmail] = useState("");
    const [password, setpassword] = useState("");
    const [repassword, setrepassword] = useState("");
    const [passwordStrength, setPasswordStrength] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    // OTP-related state
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [loading, setLoading] = useState(false);
    const [infoMsg, setInfoMsg] = useState("");
    const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds
    const [otpExpired, setOtpExpired] = useState(false);

    // Password strength checker function
    function checkPasswordStrength(pw) {
      let strength = 0;
      if (pw.length >= 8) strength++;
      if (/[A-Z]/.test(pw)) strength++;
      if (/[a-z]/.test(pw)) strength++;
      if (/[0-9]/.test(pw)) strength++;
      if (/[^A-Za-z0-9]/.test(pw)) strength++;
      if (pw.length === 0) return "";
      if (strength <= 2) return "Weak password";
      if (strength === 3 || strength === 4) return "Medium password";
      if (strength === 5) return "Strong password";
      return "Weak password";
    }
    const handlesubmit = async (e) => {
        e.preventDefault();
        if (password !== repassword) {
            alert("passwords do not match");
            return;
        }
        setLoading(true);
        setOtpError("");
        setInfoMsg("");
        try {
            // Step 1: Request OTP
            const response = await fetch('http://localhost:5000/api/auth/request-otp', {
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
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
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

    // Resend OTP handler
    const handleResendOtp = async () => {
      setLoading(true);
      setOtpError("");
      setInfoMsg("");
      try {
        const response = await fetch('http://localhost:5000/api/auth/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: mail })
        });
        const data = await response.json();
        if (response.ok) {
          setOtpTimer(300);
          setOtpExpired(false);
          setInfoMsg('OTP resent to your email.');
        } else {
          setOtpError(data.error || 'Failed to resend OTP');
        }
      } catch (err) {
        setOtpError('Error connecting to server');
        }
      setLoading(false);
    };

    // Start OTP timer when otpStep becomes true
    React.useEffect(() => {
      let interval;
      if (otpStep) {
        setOtpTimer(300);
        setOtpExpired(false);
        interval = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setOtpExpired(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [otpStep]);

    return (
        <div className="signup-container">
            <header className="header combined-header">
              <span className="site-title">MiAltar</span>
              <nav className="header-nav">
                <Link to="/">Home</Link>
                <Link to="/login">Login</Link>
                <Link to="/signup" className="active">Sign Up</Link>
              </nav>
            </header>
        <div className="signup-content">
            <h2>Sign Up</h2>
            <p>Create your account</p>
                {!otpStep ? (
            <form onSubmit={handlesubmit}>
              <div className="form-group">
                <label>Username:</label>
                <input 
                    type="text"
                    value={username}
                                onChange={(e) => setusername(e.target.value)}
                    placeholder="Username"
                    required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                    type="email"
                    value={mail}
                                onChange={(e) => setmail(e.target.value)}
                    placeholder="Email"
                    required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                                onChange={(e) => {
                      setpassword(e.target.value);
                      setPasswordStrength(checkPasswordStrength(e.target.value));
                    }}
                    placeholder="Password"
                    required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{ marginLeft: "8px", padding: "2px 8px", fontSize: "0.9em" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
                {password && (
                  <div style={{
                    color: passwordStrength === "Strong password" ? "green" : passwordStrength === "Medium password" ? "orange" : "red",
                    fontWeight: "bold",
                    marginTop: "4px"
                  }}>
                    {passwordStrength}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Confirm Password:</label>
                <input 
                    type={showRePassword ? "text" : "password"}
                    value={repassword}
                                onChange={(e) => setrepassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                />
                <button
                  type="button"
                  onClick={() => setShowRePassword((prev) => !prev)}
                  style={{ marginLeft: "8px", padding: "2px 8px", fontSize: "0.9em" }}
                >
                  {showRePassword ? "Hide" : "Show"}
                </button>
              </div>
                        <button type="submit" disabled={loading}>{loading ? "Sending OTP..." : "Sign Up"}</button>
                        {otpError && <div style={{ color: 'red', marginTop: '8px' }}>{otpError}</div>}
                        {infoMsg && <div style={{ color: 'green', marginTop: '8px' }}>{infoMsg}</div>}
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit}>
                        <div className="form-group">
                            <label>Enter OTP sent to your email:</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                                required
                                maxLength={6}
                                disabled={otpExpired}
                            />
                        </div>
                        <div style={{ marginBottom: '10px', color: otpExpired ? 'red' : '#1976d2', fontWeight: 500 }}>
                          {otpExpired
                            ? 'OTP expired. Please request a new one.'
                            : `Expires in: ${String(Math.floor(otpTimer / 60)).padStart(2, '0')}:${String(otpTimer % 60).padStart(2, '0')}`}
                        </div>
                        <button type="submit" disabled={loading || otpExpired}>{loading ? "Verifying..." : "Verify OTP & Complete Signup"}</button>
                        {otpExpired && (
                          <button type="button" onClick={handleResendOtp} disabled={loading} style={{ marginTop: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>
                            {loading ? 'Resending...' : 'Resend OTP'}
                          </button>
                        )}
                        {otpError && <div style={{ color: 'red', marginTop: '8px' }}>{otpError}</div>}
                        {infoMsg && <div style={{ color: 'green', marginTop: '8px' }}>{infoMsg}</div>}
            </form>
                )}
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
        </div>
    );
}
export default Signup;