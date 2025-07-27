import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admindashboard.css';
import UserManagement from './UserManagement';
import AltarManagement from './AltarManagement';
import PremiumManagement from './PremiumManagement';

 function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('users');
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/wall');
    }
    if (userInfo && userInfo.profile_photo) {
      setProfilePhoto(`http://localhost:5000/uploads/${userInfo.profile_photo}`);
    }
  }, [navigate]);

  return (
    <div className="admin-dashboard-flex">
      <aside className="admin-dashboard-sidebar">
        <h1 className="admin-dashboard-title">Admin Dashboard</h1>
        <div className="admin-dashboard-btn-group-vertical">
          <button
            className={`admin-dashboard-btn user-btn${activeSection === 'users' ? ' active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            User Management
          </button>
          <button
            className={`admin-dashboard-btn altar-btn${activeSection === 'altars' ? ' active' : ''}`}
            onClick={() => setActiveSection('altars')}
          >
            Altar Management
          </button>
          <button
            className={`admin-dashboard-btn premium-btn${activeSection === 'premium' ? ' active' : ''}`}
            onClick={() => setActiveSection('premium')}
          >
            Premium Status Management
          </button>
          <button
            className="admin-dashboard-btn feature-btn"
            onClick={() => navigate('/admin/features')}
          >
            🎛️ Feature Management
          </button>
        </div>
      </aside>
      <main className="admin-dashboard-main">
        <button
          className="admin-profile-icon-btn"
          title="Go to Profile"
          onClick={() => navigate('/profile')}
          style={{ position: 'absolute', top: 24, right: 36, background: 'none', border: 'none', cursor: 'pointer', fontSize: 32, padding: 0 }}
        >
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1976d2', boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)' }} />
          ) : (
            <span role="img" aria-label="profile">👤</span>
          )}
        </button>
        {activeSection === 'users' && <UserManagement />}
        {activeSection === 'altars' && <AltarManagement />}
        {activeSection === 'premium' && <PremiumManagement />}
      </main>
    </div>
  );
} 
export default AdminDashboard;