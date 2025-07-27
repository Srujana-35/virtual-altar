import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './homepage.css';


function Homepage() {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check login state and profile photo on mount and when storage changes
    function updateProfilePhoto() {
      const token = localStorage.getItem('token');
      if (token) {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          if (parsed.profile_photo) {
            setProfilePhoto(`http://localhost:5000/uploads/${parsed.profile_photo}`);
            return;
          }
        }
        setProfilePhoto(''); // logged in, but no photo
      } else {
        setProfilePhoto(null);
      }
    }
    updateProfilePhoto();
    window.addEventListener('storage', updateProfilePhoto);
    return () => window.removeEventListener('storage', updateProfilePhoto);
  }, []);

  return (
    <div className="homepage">
      <header className="header combined-header">
        <span className="site-title">MiAltar</span>
        <nav className="header-nav">
          <Link to="/">Home</Link>
          <button
            className="get-prime-btn get-prime-btn-nav"
            onClick={() => {
              const token = localStorage.getItem('token');
              if (!token) {
                navigate('/signup');
              } else {
                navigate('/premium');
              }
            }}
          >
            Get Prime
          </button>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
          {profilePhoto !== null && (
            <button
              onClick={() => navigate('/profile')}
              className="profile-button-homepage"
              title="Profile"
              aria-label="Profile"
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="profile-photo-homepage"
                />
              ) : (
                <span className="profile-placeholder-homepage">👤</span>
              )}
            </button>
          )}
        </nav>
      </header>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <h2 className="hero-title">Honor departed loved ones with a beautiful virtual altar</h2>
          <p className="hero-subtitle">Create and customize an altar for your departed</p>
          <Link to="/signup" className="cta-button">Create Altar</Link>
        </div>
      </section>

      {/* Main Section with Background */}
      <main className="main main-bg">
      </main>

      {/* Decorative Divider */}
      <div className="wave-divider" aria-hidden="true"></div>

      {/* Features Section */}
      <section className="features-section">
        <h3 className="features-title">How it works</h3>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon" role="img" aria-label="Upload">📸</span>
            <h4>Upload Photos</h4>
            <p>Upload photos of your deceased loved ones and curate a virtual altar</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon" role="img" aria-label="Customize">🕯️</span>
            <h4>Customize Your Altar</h4>
            <p>Adorn your private altar with your favorite ofrendas and personal cherished momentos</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon" role="img" aria-label="Share">⬇️</span>
            <h4>Share with loved ones</h4>
            <p>Share memories and anecdotes privately with family and friends</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>©2025iAltar. All rights reserved.</p>
        <p>Contact: support@mialtar.com</p>
      </footer>
    </div>
  );
}

export default Homepage;
