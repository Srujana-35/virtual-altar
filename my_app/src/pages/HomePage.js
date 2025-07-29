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
                className="btn btn-primary"
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    navigate('/signup');
                  } else {
                    navigate('/premium');
                  }
                }}
              >
                <span className="crown-icon">👑</span>
                Get Premium
              </button>
              {profilePhoto !== null ? (
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
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost">Login</Link>
                  <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Honor Your Loved Ones with a
                <span className="highlight"> Beautiful Virtual Altar</span>
              </h1>
              <p className="hero-description">
                Create a meaningful digital memorial to celebrate and remember those who have passed. 
                Upload photos, add personal touches, and share memories with family and friends.
              </p>
              <div className="hero-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    if (token) {
                      navigate('/wall');
                    } else {
                      navigate('/signup');
                    }
                  }}
                >
                  Create Your Altar
                </button>
              </div>
            </div>
            <div className="hero-visual">
              <div className="altar-preview">
                <div className="altar-frame">
                  <div className="altar-photos">
                    <div className="photo-item photo-1"></div>
                    <div className="photo-item photo-2"></div>
                    <div className="photo-item photo-3"></div>
                  </div>
                  <div className="altar-decorations">
                    <div className="candle"></div>
                    <div className="flower"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-header">
            <h2 className="features-title">How It Works</h2>
            <p className="features-subtitle">
              Create a beautiful memorial in just a few simple steps
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📸</div>
              <h3 className="feature-title">Upload Photos</h3>
              <p className="feature-description">
                Upload photos of your deceased loved ones and curate a virtual altar
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🕯️</div>
              <h3 className="feature-title">Customize & Decorate</h3>
              <p className="feature-description">
                Add candles, flowers, and other meaningful decorations to personalize your memorial
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💝</div>
              <h3 className="feature-title">Share & Remember</h3>
              <p className="feature-description">
                Share your virtual altar with family and friends to keep memories alive
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="wave-divider wave-top">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#f9fafb" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="container">
          <div className="testimonials-header">
            <h2 className="testimonials-title">What Our Users Say</h2>
            <p className="testimonials-subtitle">
              Real stories from families who have created meaningful memorials
            </p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-icon">💖</div>
              <p className="testimonial-text">
                "MiAltar helped me create a beautiful tribute to my grandmother. The virtual altar brings comfort to our entire family."
              </p>
              <div className="testimonial-author">
                <span className="author-name">Sarah M.</span>
                <span className="author-location">New York</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-icon">🕊️</div>
              <p className="testimonial-text">
                "Being able to share memories with family across the world has brought us closer together during difficult times."
              </p>
              <div className="testimonial-author">
                <span className="author-name">Michael R.</span>
                <span className="author-location">California</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-icon">🌸</div>
              <p className="testimonial-text">
                "The customization options are amazing. I can add my father's favorite flowers and candles. It feels so personal."
              </p>
              <div className="testimonial-author">
                <span className="author-name">Lisa K.</span>
                <span className="author-location">Texas</span>
              </div>
            </div>
          </div>
        </div>
        <div className="wave-divider wave-bottom">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Create Your Memorial?</h2>
            <p className="cta-description">
              Join thousands of families who have created beautiful virtual memorials to honor their loved ones.
            </p>
            <div className="cta-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">
                Already have an account?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="logo">
                <span className="logo-text">MiAltar</span>
                <span className="logo-subtitle">Virtual Memorial</span>
              </div>
              <p className="footer-description">
                Honoring memories, one altar at a time.
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Quick Links</h4>
              <nav className="footer-nav">
                <Link to="/">Home</Link>
                <Link to="/wall">Create Altar</Link>
                <Link to="/premium">Premium</Link>
                <Link to="/login">Login</Link>
              </nav>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Support</h4>
              <nav className="footer-nav">
                <Link to="/contact">Contact Us</Link>
                <Link to="/help">Help Center</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
              </nav>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 MiAltar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;
