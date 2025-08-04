import React, { useEffect, useState } from "react"
import config from '../config/config';
import { Link, useNavigate } from "react-router-dom";
import './homepage.css';
import bg2img from '../assets/bg2img.jpg';
import mylogo from '../assets/mylogo.jpg';


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
            setProfilePhoto(parsed.profile_photo);
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
              <img src={mylogo} alt="MiAltar Logo" className="logo-image" />
              <div className="logo-text-container">
                <span className="logo-text">MiAltar</span>
                <span className="logo-subtitle">Virtual Memorial</span>
              </div>
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

      {/* Main Content with Background Image */}
      <div 
        className="main-content-background"
      >
                {/* Combined Hero and Background Section */}
        <section className="background-section">
          <div className="container">
            <div className="background-content">
              <div className="background-text">
                
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
              <div className="background-visual">
                <div className="altar-image-container">
                  <img 
                    src={bg2img} 
                    alt="Memorial Background" 
                    className="background-image"
                  />
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

      {/* Contact Form Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-text">
              <h2 className="contact-title">GET IN TOUCH</h2>
              <p className="contact-subtitle">Let us know how we can improve the experience for you!</p>
            </div>
            <div className="contact-form-container">
              <form className="contact-form">
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder="Your name here" 
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="email" 
                    placeholder="Your email here" 
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <textarea 
                    placeholder="Type here..." 
                    className="form-textarea"
                    rows="4"
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-lg form-submit">
                  Send us a message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      </div>

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
            <div className="footer-section">
              <h4 className="footer-title">Follow Us</h4>
              <div className="social-media">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">📘</span>
                  <span className="social-text">Facebook</span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">📷</span>
                  <span className="social-text">Instagram</span>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">🐦</span>
                  <span className="social-text">Twitter</span>
                </a>
              </div>
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
