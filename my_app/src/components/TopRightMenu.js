import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TopRightMenu.css';


export default function TopRightMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    alert('Logged out!');
    navigate('/login');
  };

  return (
    <div ref={menuRef} className="topright-menu-root">
      <button
        className={`topright-menu-btn${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Open menu"
        title="Open menu"
      >
        <span className="topright-menu-hamburger">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect y="6" width="28" height="3.5" rx="1.5" fill="#3949ab" />
            <rect y="12.25" width="28" height="3.5" rx="1.5" fill="#3949ab" />
            <rect y="18.5" width="28" height="3.5" rx="1.5" fill="#3949ab" />
          </svg>
        </span>
      </button>
      {menuOpen && (
        <div className="topright-menu-dropdown">
          <button className={`topright-dropdown-item${location.pathname === '/' ? ' active' : ''}`} onClick={() => { setMenuOpen(false); navigate('/'); }}>
            <span role="img" aria-label="home" className="topright-dropdown-icon">🏠</span> Home
          </button>
          <button className={`topright-dropdown-item${location.pathname === '/profile' ? ' active' : ''}`} onClick={() => { setMenuOpen(false); navigate('/profile'); }}>
            <span role="img" aria-label="profile" className="topright-dropdown-icon">👤</span> Profile
          </button>
          <button className={`topright-dropdown-item${location.pathname === '/myaltars' ? ' active' : ''}`} onClick={() => { setMenuOpen(false); navigate('/myaltars'); }}>
            <span role="img" aria-label="altars" className="topright-dropdown-icon">🖼️</span> My Altars
          </button>
          <button className="topright-dropdown-item" onClick={() => { setMenuOpen(false); handleLogout(); }}>
            <span role="img" aria-label="logout" className="topright-dropdown-icon">🚪</span> Logout
          </button>
        </div>
      )}
    </div>
  );
} 