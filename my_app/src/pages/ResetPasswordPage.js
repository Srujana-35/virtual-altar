import React, { useState } from 'react'
import config from '../config/config';
import { useLocation, useNavigate } from 'react-router-dom';
import './pages.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Password strength checker function (same as signup)
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

const ResetPasswordPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const token = query.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(checkPasswordStrength(''));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // Check if password is strong enough
    const passwordCheck = checkPasswordStrength(password);
    if (passwordCheck.strength !== "Strong") {
      setError("Please create a strong password that meets all requirements.");
      return;
    }
    if (!token) {
      setError('Invalid or missing token.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-main">
        <div className="container">
          <div className="reset-password-card">
            <div className="reset-password-header">
              <h2 className="reset-password-title">Reset Your Password</h2>
              <p className="reset-password-subtitle">Enter your new password below</p>
            </div>
            
            {success ? (
              <div className="reset-password-success">
                <div className="success-icon">✅</div>
                <h3>Password Reset Successful!</h3>
                <p>Redirecting to login page...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="reset-password-form">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        setPasswordStrength(checkPasswordStrength(e.target.value));
                      }}
                      className="form-input"
                      placeholder="Enter new password"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? "👁️" : "🙈"}
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
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="form-input"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>

                {error && <div className="message message-error">{error}</div>}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 