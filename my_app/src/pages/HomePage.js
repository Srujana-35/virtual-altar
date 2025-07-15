import React from "react";

import { Link } from "react-router-dom";
import './pages.css';

function Homepage() {
  return (
    <div className="homepage">
      <header className="header combined-header">
        <span className="site-title">Virtual Wall Decorator</span>
        <nav className="header-nav">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </header>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <h2 className="hero-title">Design Your Own Virtual Wall</h2>
          <p className="hero-subtitle">Upload, decorate, and personalize your space with ease.</p>
          <Link to="/signup" className="cta-button">Get Started</Link>
        </div>
      </section>

      {/* Main Section with Background */}
      <main className="main main-bg">
      
      </main>

      {/* Decorative Divider */}
      <div className="wave-divider" aria-hidden="true"></div>

      {/* Features Section */}
      <section className="features-section">
        <h3 className="features-title">Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon" role="img" aria-label="Upload">📤</span>
            <h4>Upload Images</h4>
            <p>Choose your favorite photos and add them to your virtual wall.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon" role="img" aria-label="Decorate">🎨</span>
            <h4>Decorate</h4>
            <p>Drag, resize, and style with backgrounds, frames, and decorations.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon" role="img" aria-label="Download">⬇️</span>
            <h4>Download</h4>
            <p>Save your masterpiece as an image and share it with friends.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 Virtual Wall. All rights reserved.</p>
        <p>Contact: support@virtualwall.com</p>
      </footer>
    </div>
  )
}

export default Homepage;
