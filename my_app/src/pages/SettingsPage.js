import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './pages.css';
import './settingspage.css';

const SETTINGS_SECTIONS = [
  { key: 'profile', label: ' Edit Profile', icon: '👤' },
  { key: 'security', label: 'Security', icon: '🔒' },
  { key: 'preferences', label: 'Preferences', icon: '⚙️' },
  { key: 'privacy', label: 'Privacy', icon: '🛡️' },
  { key: 'altars', label: 'My Saved Altars', icon: '🕯️' },
];

function OtpModal({ open, email, onClose, onVerified }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(180); // 3 minutes
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef();

  useEffect(() => {
    if (open) {
      setOtp('');
      setError('');
      setTimer(180);
      setCanResend(false);
      // Start timer
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setCanResend(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [open]);

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
      onVerified();
    } catch (err) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          context: 'edit'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
      setTimer(180);
      setCanResend(false);
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setCanResend(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="otp-modal-backdrop">
      <div className="otp-modal-box">
        <div className="otp-modal-title">Enter OTP</div>
        <div className="otp-modal-desc">An OTP has been sent to <b>{email}</b>.<br />Please enter it below.</div>
        <input
          type="text"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="otp-modal-input"
          maxLength={6}
        />
        <div className={`otp-modal-timer${timer === 0 ? ' expired' : ''}`}
          style={{ marginBottom: 8 }}>
          {!canResend
            ? `Expires in: ${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`
            : 'OTP expired. You can request a new one.'}
        </div>
        {canResend && (
          <button
            type="button"
            className="otp-modal-btn"
            onClick={handleResendOtp}
            disabled={loading}
            style={{ marginBottom: 8 }}
          >
            {loading ? 'Resending...' : 'Resend OTP'}
          </button>
        )}
        {error && <div className="otp-modal-error">{error}</div>}
        <div className="otp-modal-actions">
          <button
            className="otp-modal-btn"
            onClick={handleVerify}
            disabled={loading || !otp || timer === 0}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            className="otp-modal-btn cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordModal({ open, onClose, onSubmit }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await onSubmit(password, setError, setLoading);
    } catch (err) {
      setError(err.message || 'Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="otp-modal-backdrop">
      <div className="otp-modal-box">
        <div className="otp-modal-title">Enter Password</div>
        <div className="otp-modal-desc">Please enter your current password to confirm username change.</div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Current Password"
          className="otp-modal-input"
        />
        {error && <div className="otp-modal-error">{error}</div>}
        <div className="otp-modal-actions">
          <button
            className="otp-modal-btn"
            onClick={handleSubmit}
            disabled={loading || !password}
          >
            {loading ? 'Saving...' : 'Confirm'}
          </button>
          <button
            className="otp-modal-btn cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
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

export default function SettingsDialog({ open, openSection, onClose, setUserInfo, userInfo: userInfoProp }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
  });
  const [originalEmail, setOriginalEmail] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingProfile, setPendingProfile] = useState(null);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [preferences, setPreferences] = useState({
    newsletter: false,
    darkMode: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    dataSharing: false,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  // Add sendingOtp and otpError state
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  // Sidebar section state
  const [section, setSection] = useState(openSection || 'profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingUsername, setPendingUsername] = useState(null);
  const [passwordStrengthSecurity, setPasswordStrengthSecurity] = useState(checkPasswordStrength(''));

  // Use userInfo from prop, fallback to localStorage if not provided
  const userInfo = userInfoProp || JSON.parse(localStorage.getItem('userInfo') || '{}');

  // If openSection prop changes (e.g. dialog opened with a different section), update local state
  useEffect(() => {
    if (openSection) setSection(openSection);
  }, [openSection]);
  // We only want to set originalEmail when the dialog opens, not when profile.email changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open) {
      // When dialog opens, set originalEmail
      setOriginalEmail(profile.email);
      setShowOtpModal(false);
      setPendingProfile(null);
    } // eslint-disable-next-line
  }, [open]);

  if (!open) return null;

  let sectionContent = null;
  if (section === 'profile') {
    sectionContent = (
      <>
        {/* Edit Username Form */}
        <form className="settings-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-input"
              value={profile.username} 
              onChange={e => setProfile({ ...profile, username: e.target.value })} 
            />
          </div>
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={async () => {
                if (profile.username !== userInfo.username) {
                  setPendingUsername(profile.username);
                  setShowPasswordModal(true);
                }
              }} 
              disabled={savingProfile}
            >
              {savingProfile ? 'Saving...' : 'Edit Username'}
            </button>
          </div>
        </form>
        
        {/* Edit Email Form */}
        <form className="settings-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={async () => {
                if (profile.email !== originalEmail) {
                  setSendingOtp(true);
                  setOtpError('');
                  try {
                    const res = await fetch('http://localhost:5000/api/auth/request-otp', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        email: profile.email,
                        context: 'edit'
                      })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
                    setPendingProfile({ ...profile });
                    setShowOtpModal(true);
                  } catch (err) {
                    setOtpError(err.message || 'Failed to send OTP');
                  } finally {
                    setSendingOtp(false);
                  }
                }
              }} 
              disabled={sendingOtp}
            >
              {sendingOtp ? 'Sending OTP...' : 'Edit Email'}
            </button>
          </div>
          {otpError && <div className="form-error">{otpError}</div>}
        </form>
      </>
    );
  } else if (section === 'security') {
    sectionContent = (
      <form className="settings-form">
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input 
            type="password" 
            className="form-input"
            value={passwords.current} 
            onChange={e => setPasswords({ ...passwords, current: e.target.value })} 
          />
        </div>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input 
            type="password" 
            className="form-input"
            value={passwords.new} 
            onChange={e => {
              setPasswords({ ...passwords, new: e.target.value });
              setPasswordStrengthSecurity(checkPasswordStrength(e.target.value));
            }} 
          />
          {passwords.new && (
            <div className="password-requirements">
              <div className={`password-strength ${passwordStrengthSecurity.strength?.toLowerCase()}`}>
                Password Strength: {passwordStrengthSecurity.strength || "Enter password"}
              </div>
              <div className="validation-checks">
                <div className={`validation-check ${passwordStrengthSecurity.validations?.length ? 'passed' : 'failed'}`}>
                  {passwordStrengthSecurity.validations?.length ? '✅' : '❌'} At least 8 characters
                </div>
                <div className={`validation-check ${passwordStrengthSecurity.validations?.uppercase ? 'passed' : 'failed'}`}>
                  {passwordStrengthSecurity.validations?.uppercase ? '✅' : '❌'} One uppercase letter (A-Z)
                </div>
                <div className={`validation-check ${passwordStrengthSecurity.validations?.lowercase ? 'passed' : 'failed'}`}>
                  {passwordStrengthSecurity.validations?.lowercase ? '✅' : '❌'} One lowercase letter (a-z)
                </div>
                <div className={`validation-check ${passwordStrengthSecurity.validations?.number ? 'passed' : 'failed'}`}>
                  {passwordStrengthSecurity.validations?.number ? '✅' : '❌'} One number (0-9)
                </div>
                <div className={`validation-check ${passwordStrengthSecurity.validations?.special ? 'passed' : 'failed'}`}>
                  {passwordStrengthSecurity.validations?.special ? '✅' : '❌'} One special character (!@#$%^&*)
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input 
            type="password" 
            className="form-input"
            value={passwords.confirm} 
            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} 
          />
        </div>
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={async () => {
              if (!passwords.current || !passwords.new || !passwords.confirm) {
                alert('Please fill in all password fields.');
                return;
              }
              if (passwords.new !== passwords.confirm) {
                alert('New passwords do not match.');
                return;
              }
              // Check if new password is strong enough
              const passwordCheck = checkPasswordStrength(passwords.new);
              if (passwordCheck.strength !== "Strong") {
                alert("Please create a strong password that meets all requirements.");
                return;
              }
              setSavingPassword(true);
              const token = localStorage.getItem('token');
              try {
                const response = await fetch('http://localhost:5000/api/auth/update-profile', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                  })
                });
                const data = await response.json();
                if (response.ok) {
                  alert('Password updated!');
                  setPasswords({ current: '', new: '', confirm: '' });
                } else {
                  alert(data.error || 'Failed to update password');
                }
              } catch (err) {
                alert('Error updating password: ' + err.message);
              } finally {
                setSavingPassword(false);
              }
            }} 
            disabled={savingPassword}
          >
            {savingPassword ? 'Saving...' : 'Change Password'}
          </button>
        </div>
      </form>
    );
  } else if (section === 'preferences') {
    sectionContent = (
      <form className="settings-form">
        <div className="form-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              className="checkbox-input"
              checked={preferences.newsletter} 
              onChange={e => setPreferences({ ...preferences, newsletter: e.target.checked })} 
            />
            <span className="checkbox-text">Subscribe to Newsletter</span>
          </label>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              className="checkbox-input"
              checked={preferences.darkMode} 
              onChange={e => setPreferences({ ...preferences, darkMode: e.target.checked })} 
            />
            <span className="checkbox-text">Enable Dark Mode</span>
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-primary">Save Preferences</button>
        </div>
      </form>
    );
  } else if (section === 'privacy') {
    sectionContent = (
      <form className="settings-form">
        <div className="form-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              className="checkbox-input"
              checked={privacy.profileVisible} 
              onChange={e => setPrivacy({ ...privacy, profileVisible: e.target.checked })} 
            />
            <span className="checkbox-text">Profile Visible to Others</span>
          </label>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              className="checkbox-input"
              checked={privacy.dataSharing} 
              onChange={e => setPrivacy({ ...privacy, dataSharing: e.target.checked })} 
            />
            <span className="checkbox-text">Allow Data Sharing</span>
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-primary">Save Privacy Settings</button>
        </div>
      </form>
    );
  } else if (section === 'altars') {
    sectionContent = (
      <div className="altars-section">
        <div className="altars-header">
          <h3>My Saved Altars</h3>
          <p>View and manage all your saved altar designs</p>
        </div>
        <div className="altars-content">
          <div className="altars-info">
            <div className="altars-icon">🕯️</div>
            <div className="altars-text">
              <h4>Access Your Altars</h4>
              <p>Browse through all your saved altar designs, edit them, or create new ones.</p>
            </div>
          </div>
          <div className="altars-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                onClose();
                navigate('/myaltars');
              }}
            >
              View My Altars
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => {
                onClose();
                navigate('/wall');
              }}
            >
              Create New Altar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <OtpModal
        open={showOtpModal}
        email={pendingProfile?.email}
        onClose={() => setShowOtpModal(false)}
        onVerified={async () => {
          setShowOtpModal(false);
          setSavingProfile(true);
          const token = localStorage.getItem('token');
          try {
            const response = await fetch('http://localhost:5000/api/auth/update-profile', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                username: pendingProfile.username,
                email: pendingProfile.email
              })
            });
            const data = await response.json();
            if (response.ok) {
              localStorage.setItem('userInfo', JSON.stringify(data.user));
              if (setUserInfo) setUserInfo(data.user); // Update parent state if provided
              alert('Profile updated!');
              setOriginalEmail(pendingProfile.email);
            } else {
              alert(data.error || 'Failed to update profile');
            }
          } catch (err) {
            alert('Error updating profile: ' + err.message);
          } finally {
            setSavingProfile(false);
          }
        }}
      />
      <PasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={async (password, setError, setLoading) => {
          setLoading(true);
          setError('');
          const token = localStorage.getItem('token');
          try {
            const response = await fetch('http://localhost:5000/api/auth/edit-username', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                username: pendingUsername,
                currentPassword: password
              })
            });
            const data = await response.json();
            if (response.ok) {
              localStorage.setItem('userInfo', JSON.stringify(data.user));
              if (setUserInfo) setUserInfo(data.user);
              alert('Username updated!');
              setProfile(p => ({ ...p, username: pendingUsername }));
              setShowPasswordModal(false);
            } else {
              setError(data.error || 'Failed to update username');
            }
          } catch (err) {
            setError('Error updating username: ' + err.message);
          } finally {
            setLoading(false);
            setSavingProfile(false);
          }
        }}
      />
      <div className="settings-dialog-backdrop">
        <div className="settings-dialog-modal">
          {/* Sidebar */}
          <nav className="settings-sidebar">
            {SETTINGS_SECTIONS.map(s => (
              <button
                key={s.key}
                className={`settings-sidebar-item ${section === s.key ? 'active' : ''}`}
                onClick={() => setSection(s.key)}
              >
                <span className="sidebar-icon">{s.icon}</span>
                <span className="sidebar-label">{s.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Main content */}
          <div className="settings-main-content">
            <button className="settings-dialog-close" onClick={onClose}>
              <span>&times;</span>
            </button>
            <div className="settings-content">
              <h3 className="settings-section-title">
                {SETTINGS_SECTIONS.find(s => s.key === section)?.label} Settings
              </h3>
              {sectionContent}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 