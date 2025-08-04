import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import config from '../config/config';
import './BillingHistoryPage.css';
import mylogo from '../assets/mylogo.jpg';

export default function BillingHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Get profile photo from localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const profilePhoto = userInfo.profile_photo || null;

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${config.apiBaseUrl}/premium/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
        setHistory(data.history || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="billing-history-page">
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
            <div className="nav-section">
              <nav className="nav">
                <Link to="/" className="nav-link">Home</Link>
                
              </nav>
              <button
                className="profile-icon-btn"
                title="Go to Profile"
                onClick={() => navigate('/profile')}
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" />
                ) : (
                  <span role="img" aria-label="profile">👤</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="billing-main">
        <div className="billing-page-container">
          <section className="billing-hero">
            <h1 className="billing-hero-title">Billing <span className="highlight">History</span></h1>
            <p className="billing-hero-subtitle">View your premium subscription history and payment details</p>
          </section>
          
          <div className="billing-content-card">
            {loading ? (
              <div className="billing-loading">Loading...</div>
            ) : error ? (
              <div className="billing-error">{error}</div>
            ) : history.length === 0 ? (
              <div className="billing-empty">No billing history found.</div>
            ) : (
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Source</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id}>
                      <td>{row.plan_type}</td>
                      <td>{row.amount}</td>
                      <td>
                        {row.source === 'user' ? 'Purchased by User' : row.source === 'admin' ? 'Granted by Admin' : row.source}
                      </td>
                      <td>{new Date(row.start_date).toLocaleString()}</td>
                      <td>{new Date(row.end_date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 