import React, { useState, useEffect, useRef } from 'react';
import './pages.css';
import './settingspage.css';

const SETTINGS_SECTIONS = [
  { key: 'profile', label: ' Edit Profile', icon: '👤' },
  { key: 'security', label: 'Security', icon: '🔒' },
  { key: 'preferences', label: 'Preferences', icon: '⚙️' },
  { key: 'privacy', label: 'Privacy', icon: '🛡️' },
];

function OtpModal({ open, email, onClose, onVerified }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(120); // 2 minutes
  const timerRef = useRef();

  useEffect(() => {
    if (open) {
      setOtp('');
      setError('');
      setTimer(120);
      // Start timer
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
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
        <div className={`otp-modal-timer${timer === 0 ? ' expired' : ''}`}>
          {timer > 0 ? `OTP expires in ${Math.floor(timer/60)}:${(timer%60).toString().padStart(2, '0')}` : 'OTP expired'}
        </div>
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

export default function SettingsDialog({ open, openSection, onClose, setUserInfo }) {
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
      <form className="settings-form">
        <div className="settings-form-row">
          <label>Username</label>
          <input type="text" value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value })} />
        </div>
        <div className="settings-form-row">
          <label>Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={e => setProfile({ ...profile, email: e.target.value })}
          />
        </div>
        <div className="settings-form-actions">
          <button type="button" className="settings-save-btn" onClick={async () => {
            if (profile.email !== originalEmail) {
              // Send OTP and show loading state
              setSendingOtp(true);
              setOtpError('');
              try {
                const res = await fetch('http://localhost:5000/api/auth/request-otp', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: profile.email })
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
              return; // <--- CRITICAL: Prevents premature update
            }
            // No email change, save directly
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
                  username: profile.username,
                  email: profile.email
                })
              });
              const data = await response.json();
              if (response.ok) {
                localStorage.setItem('userInfo', JSON.stringify(data.user));
                if (setUserInfo) setUserInfo(data.user); // Update parent state if provided
                alert('Profile updated!');
                setOriginalEmail(profile.email);
              } else {
                alert(data.error || 'Failed to update profile');
              }
            } catch (err) {
              alert('Error updating profile: ' + err.message);
            } finally {
              setSavingProfile(false);
            }
          }} disabled={savingProfile || sendingOtp}>
            {savingProfile ? 'Saving...' : sendingOtp ? 'Sending OTP...' : 'Save Profile'}
          </button>
        </div>
        {otpError && <div className="otp-modal-error" style={{ marginTop: 8 }}>{otpError}</div>}
      </form>
    );
  } else if (section === 'security') {
    sectionContent = (
      <form className="settings-form">
        <div className="settings-form-row">
          <label>Current Password</label>
          <input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} />
        </div>
        <div className="settings-form-row">
          <label>New Password</label>
          <input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} />
        </div>
        <div className="settings-form-row">
          <label>Confirm New Password</label>
          <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} />
        </div>
        <div className="settings-form-actions">
          <button type="button" className="settings-save-btn" onClick={async () => {
            if (!passwords.current || !passwords.new || !passwords.confirm) {
              alert('Please fill in all password fields.');
              return;
            }
            if (passwords.new !== passwords.confirm) {
              alert('New passwords do not match.');
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
          }} disabled={savingPassword}>
            {savingPassword ? 'Saving...' : 'Change Password'}
          </button>
        </div>
      </form>
    );
  } else if (section === 'preferences') {
    sectionContent = (
      <form className="settings-form">
        <div className="settings-form-row">
          <label>
            <input type="checkbox" checked={preferences.newsletter} onChange={e => setPreferences({ ...preferences, newsletter: e.target.checked })} />
            Subscribe to Newsletter
          </label>
        </div>
        <div className="settings-form-row">
          <label>
            <input type="checkbox" checked={preferences.darkMode} onChange={e => setPreferences({ ...preferences, darkMode: e.target.checked })} />
            Enable Dark Mode
          </label>
        </div>
        <div className="settings-form-actions">
          <button type="button" className="settings-save-btn">Save Preferences</button>
        </div>
      </form>
    );
  } else if (section === 'privacy') {
    sectionContent = (
      <form className="settings-form">
        <div className="settings-form-row">
          <label>
            <input type="checkbox" checked={privacy.profileVisible} onChange={e => setPrivacy({ ...privacy, profileVisible: e.target.checked })} />
            Profile Visible to Others
          </label>
        </div>
        <div className="settings-form-row">
          <label>
            <input type="checkbox" checked={privacy.dataSharing} onChange={e => setPrivacy({ ...privacy, dataSharing: e.target.checked })} />
            Allow Data Sharing
          </label>
        </div>
        <div className="settings-form-actions">
          <button type="button" className="settings-save-btn">Save Privacy Settings</button>
        </div>
      </form>
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
      <div className="settings-dialog-backdrop">
        <div className="settings-dialog-modal modern-modal" style={{ display: 'flex', minWidth: 520, minHeight: 340 }}>
          {/* Sidebar */}
          <nav className="settings-sidebar" style={{ minWidth: 150, borderRight: '1px solid #eee', padding: '24px 0', background: '#fafbfc', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            {SETTINGS_SECTIONS.map(s => (
              <button
                key={s.key}
                className={section === s.key ? 'settings-sidebar-item active' : 'settings-sidebar-item'}
                style={{
                  background: section === s.key ? '#e3e7fa' : 'none',
                  border: 'none',
                  textAlign: 'left',
                  padding: '12px 24px',
                  fontWeight: section === s.key ? 600 : 400,
                  color: section === s.key ? '#3949ab' : '#222',
                  cursor: 'pointer',
                  outline: 'none',
                  fontSize: 16,
                  borderLeft: section === s.key ? '4px solid #3949ab' : '4px solid transparent',
                  transition: 'background 0.18s, border-color 0.18s',
                }}
                onClick={() => setSection(s.key)}
              >
                <span style={{ marginRight: 10 }}>{s.icon}</span> {s.label}
              </button>
            ))}
          </nav>
          {/* Main content */}
          <div style={{ flex: 1, padding: '32px 32px 24px 32px', minWidth: 320, position: 'relative' }}>
            <button className="settings-dialog-close" onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>&times;</button>
            <h3 className="settings-section-title" style={{textTransform:'capitalize', marginBottom: 24}}>{SETTINGS_SECTIONS.find(s => s.key === section)?.label} Settings</h3>
            {sectionContent}
          </div>
        </div>
      </div>
    </>
  );
} 