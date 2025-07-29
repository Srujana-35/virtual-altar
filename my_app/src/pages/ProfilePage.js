import React, { useState, useEffect, useRef } from 'react';
import SettingsDialog from './SettingsPage';
import './profilepage.css';
import './pages.css';
import { useNavigate, Link } from 'react-router-dom';
import { FaCamera, FaTrashAlt, FaCog, FaUserEdit, FaExclamationTriangle, FaCrown } from 'react-icons/fa';

const SETTINGS_SECTIONS = [
  { key: 'profile', label: 'Edit Profile', icon: '👤' },
  { key: 'security', label: 'Security', icon: '🔒' },
  { key: 'preferences', label: 'Preferences', icon: '⚙️' },
  { key: 'privacy', label: 'Privacy', icon: '🛡️' },
  { key: 'altars', label: 'My Saved Altars', icon: '🕯️' },
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
  const settingsDropdownRef = useRef(null);
  const settingsButtonRef = useRef(null);

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

  // Handle clicking outside the settings dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsMenuOpen && 
          settingsDropdownRef.current && 
          !settingsDropdownRef.current.contains(event.target) &&
          settingsButtonRef.current && 
          !settingsButtonRef.current.contains(event.target)) {
        setSettingsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsMenuOpen]);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    alert('Logged out!');
    navigate('/login');
  };

  return (
    <div className="profile-page">
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
              <button
                className="profile-settings-btn"
                onClick={() => setSettingsMenuOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={settingsMenuOpen}
                aria-label="Open settings menu"
                ref={settingsButtonRef}
              >
                <FaCog style={{marginRight: 8}} /> Settings
              </button>
              {settingsMenuOpen && (
                <div className="settings-dropdown-menu" ref={settingsDropdownRef}>
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
                  <button
                    className="settings-dropdown-item create-altar-dropdown-item"
                    onClick={() => {
                      navigate('/wall');
                      setSettingsMenuOpen(false);
                    }}
                  >
                    <span role="img" aria-label="Create Altar">✨</span> Create Altar
                  </button>
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
                  <div className="settings-dropdown-divider"></div>
                  <button
                    className="settings-dropdown-item logout-dropdown-item"
                    onClick={() => {
                      handleLogout();
                      setSettingsMenuOpen(false);
                    }}
                  >
                    <span role="img" aria-label="Logout">🚪</span> Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="profile-main">
        <div className="container">
          <div className="profile-card">
            <div className="profile-header">
              <h1 className="profile-title">My Profile</h1>
              {isPremium && (
                <div className="premium-badge">
                  <FaCrown className="premium-icon" />
                  <span className="premium-label">Premium Member</span>
                </div>
              )}
            </div>

            <div className="profile-content">
              {/* Profile Photo Section */}
              <div className="profile-photo-section">
                <div className="profile-photo-container">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="profile-photo"
                    />
                  ) : (
                    <div className="profile-photo-placeholder">
                      <FaUserEdit size={48} />
                    </div>
                  )}
                  <label className="profile-photo-upload" title="Upload Photo">
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                    />
                    <FaCamera size={20} />
                  </label>
                </div>
                
                {profileImage && (
                  <button 
                    className="btn btn-danger btn-sm delete-photo-btn" 
                    onClick={handleDeletePhoto} 
                    disabled={uploading} 
                    title="Delete Photo"
                  >
                    <FaTrashAlt style={{marginRight: 6}} /> Delete Photo
                  </button>
                )}
                
                {uploading && (
                  <div className="upload-status">
                    <div className="loading-spinner"></div>
                    <span>Uploading...</span>
                  </div>
                )}
              </div>

              {/* User Information */}
              <div className="user-info-section">
                <div className="info-grid">
                  <div className="info-item">
                    <label className="info-label">Username</label>
                    <span className="info-value">{userInfo.username || 'Not set'}</span>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Email</label>
                    <span className="info-value">{userInfo.email || 'Not set'}</span>
                  </div>
                </div>

                {/* Admin Dashboard Button */}
                {userInfo.role === 'admin' && (
                  <button
                    className="btn btn-primary admin-dashboard-btn"
                    onClick={() => navigate('/admin')}
                  >
                    <FaCog style={{marginRight: 8}} /> Go to Admin Dashboard
                  </button>
                )}
              </div>

              {/* Delete Account Button */}
              <div className="danger-zone">
                <button 
                  className="btn btn-danger delete-account-btn" 
                  onClick={handleDeleteAccount}
                >
                  <FaExclamationTriangle style={{marginRight: 8}} /> Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsDialogOpen}
        openSection={settingsSection}
        onClose={() => setSettingsDialogOpen(false)}
        setUserInfo={setUserInfo}
        userInfo={userInfo}
      />
    </div>
  );
} 