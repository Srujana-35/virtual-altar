import React, { useEffect, useState } from 'react'
import config from '../config/config';

import { useNavigate } from 'react-router-dom';
import './admindashboard.css';
import UserManagement from './UserManagement';
import AltarManagement from './AltarManagement';
import PremiumManagement from './PremiumManagement';

 function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalAltars: 0,
    premiumUsers: 0,
    totalPhotos: 0,
    recentActivity: []
  });

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/wall');
    }
    if (userInfo && userInfo.profile_photo) {
      setProfilePhoto(`${config.apiUrl}/uploads/${userInfo.profile_photo}`);
    }
    
    // Fetch dashboard statistics
    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching dashboard stats with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`${config.apiBaseUrl}/admin/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard stats received:', data);
        setDashboardStats(data);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const DashboardOverview = () => (
    <div className="dashboard-overview">
      <h2 className="dashboard-overview-title">Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardStats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🕯️</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardStats.totalAltars}</div>
            <div className="stat-label">Total Altars</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardStats.premiumUsers}</div>
            <div className="stat-label">Premium Users</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-content">
            <div className="stat-number">{dashboardStats.totalPhotos}</div>
            <div className="stat-label">Total Photos</div>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3 className="recent-activity-title">Recent Activity</h3>
        <div className="activity-list">
          {dashboardStats.recentActivity.length > 0 ? (
            dashboardStats.recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-text">{activity.text}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-activity">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard-flex">
      {/* Header */}
      <header className="admin-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <span className="logo-text">MiAltar</span>
              <span className="logo-subtitle">Virtual Memorial</span>
            </div>
          </div>
        </div>
        <button
          className="admin-profile-icon-btn"
          title="Go to Profile"
          onClick={() => navigate('/profile')}
        >
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)', boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)' }} />
          ) : (
            <span role="img" aria-label="profile">👤</span>
          )}
        </button>
      </header>
      
      <div className="admin-dashboard-content">
        <aside className="admin-dashboard-sidebar">
          <h1 className="admin-dashboard-title">Admin Dashboard</h1>
          <div className="admin-dashboard-btn-group-vertical">
            <button
              className={`admin-dashboard-btn dashboard-btn${activeSection === 'dashboard' ? ' active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              📊 Dashboard
            </button>
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
          {activeSection === 'dashboard' && <DashboardOverview />}
          {activeSection === 'users' && <UserManagement />}
          {activeSection === 'altars' && <AltarManagement />}
          {activeSection === 'premium' && <PremiumManagement />}
        </main>
      </div>
    </div>
  );
} 
export default AdminDashboard;