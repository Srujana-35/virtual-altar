import React, { useState, useEffect } from 'react';
import TopRightMenu from '../components/TopRightMenu';
import SettingsDialog from './SettingsPage';
import './profilepage.css';
import './pages.css';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaTrashAlt, FaCog, FaUserEdit, FaExclamationTriangle, FaCrown } from 'react-icons/fa';

const SETTINGS_SECTIONS = [
  { key: 'profile', label: 'Edit Profile', icon: '👤' },
  { key: 'security', label: 'Security', icon: '🔒' },
  { key: 'preferences', label: 'Preferences', icon: '⚙️' },
  { key: 'privacy', label: 'Privacy', icon: '🛡️' },
];

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    profile_photo: null,
  });
  const [loading, setLoading] = useState(true);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState('profile');
  const [profileImage, setProfileImage] = useState(null); // for displaying image
  const [uploading, setUploading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // Get user info from localStorage or fetch from API
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsed = JSON.parse(storedUserInfo);
      setUserInfo(parsed);
      if (parsed.profile_photo) {
        setProfileImage(`http://localhost:5000/uploads/${parsed.profile_photo}`);
      }
    }
    // Fetch premium status
    fetch('http://localhost:5000/api/premium/status', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setIsPremium(!!data.isPremium);
      });
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/auth/delete-account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      alert('Account deleted successfully.');
      navigate('/signup');
    } catch (err) {
      alert('Failed to delete account.');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch('http://localhost:5000/api/auth/upload-profile-photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload photo');
      // Update state and localStorage
      setProfileImage(`http://localhost:5000/uploads/${data.filename}`);
      const newUserInfo = { ...userInfo, profile_photo: data.filename };
      setUserInfo(newUserInfo);
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
    } catch (err) {
      alert(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm('Delete your profile photo?')) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/delete-profile-photo', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete photo');
      setProfileImage(null);
      const newUserInfo = { ...userInfo, profile_photo: null };
      setUserInfo(newUserInfo);
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
    } catch (err) {
      alert(err.message || 'Failed to delete photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-bg">
      <header className="profile-header modern-profile-header">
        <div className="profile-header-menu">
      <TopRightMenu />
              </div>
        <div className="profile-header-settings">
          <button
            className="profile-settings-btn"
            onClick={() => setSettingsMenuOpen((open) => !open)}
            aria-haspopup="true"
            aria-expanded={settingsMenuOpen}
            aria-label="Open settings menu"
          >
            <FaCog style={{marginRight: 8}} /> Settings
              </button>
              {settingsMenuOpen && (
            <div className="settings-dropdown-menu">
                  {SETTINGS_SECTIONS.map(section => (
                    <button
                      key={section.key}
                  className="settings-dropdown-item"
                      onClick={() => {
                        setSettingsSection(section.key);
                        setSettingsDialogOpen(true);
                        setSettingsMenuOpen(false);
                      }}
                    >
                  <span>{section.icon}</span> {section.label}
                    </button>
                  ))}
                  {isPremium && (
                    <button
                      className="settings-dropdown-item billing-history-dropdown-item"
                      onClick={() => {
                        navigate('/billing-history');
                        setSettingsMenuOpen(false);
                      }}
                    >
                      <span role="img" aria-label="Billing">💳</span> Billing History
                    </button>
                  )}
                  <button
                    className="settings-dropdown-item get-prime-dropdown-item"
                    onClick={() => {
                      navigate('/premium');
                      setSettingsMenuOpen(false);
                    }}
                  >
                    <span role="img" aria-label="Crown">👑</span> Get Prime
                  </button>
                </div>
              )}
            </div>
      </header>
      <main className="profile-main">
        <div className="profile-content profile-card-modern glassy-profile-card">
          <h1 className="profile-title">My Profile</h1>
          {isPremium && (
            <div className="premium-badge-profile">
              <FaCrown style={{ color: '#FFD700', marginRight: 6, verticalAlign: 'middle' }} />
              <span className="premium-badge-label">Premium Member</span>
            </div>
          )}
          <section className="user-info-section-modern">
            <div className="profile-photo-section modern-profile-photo">
              <div className="profile-photo-wrapper">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-photo-img"
                  />
                ) : (
                  <div className="profile-photo-placeholder">
                    <FaUserEdit size={48} />
                  </div>
                )}
                <label className="profile-photo-upload-overlay" title="Upload Photo">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                  <FaCamera size={22} />
                </label>
              </div>
              {/* Move delete button below photo */}
              {profileImage && (
                <button className="delete-photo-btn modern-delete-photo-btn-below spaced-delete-photo-btn" onClick={handleDeletePhoto} disabled={uploading} title="Delete Photo">
                  <FaTrashAlt style={{marginRight: 6}} /> Delete Photo
                </button>
              )}
              {uploading && <div className="profile-uploading-label">Uploading...</div>}
            </div>
            <div className="user-info-grid-modern modern-user-info-grid single-column-info-grid">
              <div className="info-item modern-info-item">
                <label>Username:</label>
                <span className="info-value">{userInfo.username || 'Not set'}</span>
              </div>
              <div className="info-item modern-info-item">
                <label>Email:</label>
                <span className="info-value">{userInfo.email || 'Not set'}</span>
              </div>
            </div>
            {userInfo.role === 'admin' && (
              <button
                className="admin-dashboard-btn modern-admin-dashboard-btn"
                onClick={() => navigate('/admin')}
              >
                <FaCog style={{marginRight: 8}} /> Go to Admin Dashboard
              </button>
            )}
          </section>
          <button className="delete-account-btn modern-delete-account-btn" onClick={handleDeleteAccount}>
            <FaExclamationTriangle style={{marginRight: 8}} /> Delete Account
          </button>
        </div>
      </main>
      <SettingsDialog
        open={settingsDialogOpen}
        openSection={settingsSection}
        onClose={() => setSettingsDialogOpen(false)}
        setUserInfo={setUserInfo}
      />
      <footer className="footer">
        <p>© 2025 Virtual Wall. All rights reserved.</p>
        <p>Contact: support@virtualwall.com</p>
      </footer>
    </div>
  );
} 