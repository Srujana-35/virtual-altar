import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './pages.css';

function ProfilePage() {
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: ''
  });
  
  const [savedWalls, setSavedWalls] = useState([]); // New state for all saved walls
  const [loading, setLoading] = useState(true);
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
      setUserInfo(JSON.parse(storedUserInfo));
    }

    // Get downloaded images from localStorage
    

    // Fetch all saved walls for the user
    const fetchWalls = async () => {
      try {
        const listRes = await fetch('http://localhost:5000/api/wall/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();
        if (!listRes.ok || !listData.walls) {
          setSavedWalls([]);
          setLoading(false);
          return;
        }
        // Fetch each wall's data
        const wallPromises = listData.walls.map(async (wall) => {
          const wallRes = await fetch(`http://localhost:5000/api/wall/load/${wall.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const wallData = await wallRes.json();
          if (wallRes.ok && wallData.wall) {
            console.log('Loaded wall:', wallData.wall); // Debug log
            return wallData.wall;
          }
          return null;
        });
        const allWalls = (await Promise.all(wallPromises)).filter(Boolean);
        setSavedWalls(allWalls);
      } catch (err) {
        setSavedWalls([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWalls();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  
  const handleRestoreWall = (wall) => {
    // Save wall data to localStorage and redirect to /wall
    localStorage.setItem('restoreWallData', JSON.stringify(wall.wallData));
    // Show confirmation with wall name
    const wallName = wall.name || 'Untitled Wall';
    alert(`Restoring wall: ${wallName}`);
    navigate('/wall');
  };

  const handleDeleteWall = async (wallId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this wall?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/wall/delete/${wallId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSavedWalls(walls => walls.filter(w => w.id !== wallId));
      } else {
        alert('Failed to delete wall.');
      }
    } catch (err) {
      alert('Error deleting wall: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="header combined-header">
        <span className="site-title">Virtual Wall Decorator</span>
        <nav className="header-nav">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
          <Link to="/profile" className="active">Profile</Link>
        </nav>
      </header>

      <main className="profile-main">
        <div className="profile-content">
          <h1>My Profile</h1>
          
          {/* User Information Section */}
          <section className="user-info-section">
            <h2>Account Information</h2>
            <div className="user-info-grid">
              <div className="info-item">
                <label>Username:</label>
                <span>{userInfo.username || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{userInfo.email || 'Not set'}</span>
              </div>
            </div>
          </section>

          {/* Create a New Wall Button */}
          <div className="profile-actions" style={{ marginBottom: '2rem' }}>
            <button className="create-wall-btn" onClick={() => navigate('/wall')}>
              ➕ Create a New Wall
            </button>
          </div>

          {/* Saved Walls Section */}
          <section className="images-section">
            <h2>My Saved Walls</h2>
            {savedWalls.length === 0 ? (
              <div className="no-images">
                <p>No saved walls yet.</p>
                <Link to="/wall" className="create-wall-btn">Create Your First Wall</Link>
              </div>
            ) : (
              <div className="images-grid">
                {savedWalls.map((wall) => {
                  // Try wallpaper, then first image, then fallback
                  const makeImageUrl = (src) => {
                    if (!src) return null;
                    if (src.startsWith('blob:') || src.startsWith('/') || src.startsWith('data:')) return src;
                    return `http://localhost:5000/uploads/${src}`;
                  };
                  let preview = null;
                  if (wall.wallData.wallpaper) preview = makeImageUrl(wall.wallData.wallpaper);
                  else if (wall.wallData.images && wall.wallData.images.length > 0) preview = makeImageUrl(wall.wallData.images[0].src);
                  return (
                    <div key={wall.id} className="wall-card">
                      <div className="wall-preview">
                        {preview ? (
                          <img src={preview} alt="Saved wall preview" />
                        ) : (
                          <div className="no-preview">No Preview</div>
                        )}
                      </div>
                      <div className="wall-info">
                        <h3 className="wall-name">{wall.name || 'Untitled Wall'}</h3>
                        <span className="wall-date">{new Date(wall.updatedAt || wall.createdAt).toLocaleDateString()}</span>
                        <div className="wall-actions">
                          <button className="restore-btn" onClick={() => handleRestoreWall(wall)}>
                            ♻️ Restore
                          </button>
                          <button className="delete-btn" onClick={() => handleDeleteWall(wall.id)}>
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Logout Button */}
          <div className="profile-actions">
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 Virtual Wall. All rights reserved.</p>
        <p>Contact: support@virtualwall.com</p>
      </footer>
    </div>
  );
}

export default ProfilePage; 