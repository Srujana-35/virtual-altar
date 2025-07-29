import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WallPreview from '../components/WallPreview';
import ShareDialog from '../components/ShareDialog';
import './myaltarspage.css';
import './pages.css';
import { useFeatures } from '../hooks/useFeatures';

export default function MyAltarsPage() {
  const [savedWalls, setSavedWalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewWall, setPreviewWall] = useState(null); // For modal preview
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [selectedAltarId, setSelectedAltarId] = useState(null); // <-- Add this line
  const [profilePhoto, setProfilePhoto] = useState(null);
  // eslint-disable-next-line
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const navigate = useNavigate();
  const { canUseFeature } = useFeatures();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // Fetch profile photo from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      if (parsed.profile_photo) {
        setProfilePhoto(`http://localhost:5000/uploads/${parsed.profile_photo}`);
      }
    }
    // Fetch premium status
    fetch('http://localhost:5000/api/premium/status', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setIsPremium(!!data.isPremium));
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

  const handleRestoreWall = (wall) => {
    localStorage.setItem('restoreWallData', JSON.stringify(wall.wallData));
    localStorage.setItem('restoreWallId', wall.id); // Store wall id for update
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

  const handleShare = (wallId) => {
    setShareUrl(`${window.location.origin}/wall/public/${wallId}`);
    setSelectedAltarId(wallId); // <-- Add this line
    setShareDialogOpen(true);
  };

  const handleCreateAltar = () => {
    if (!canUseFeature('unlimited_drafts') && canUseFeature('draft_limit_free') && savedWalls.length >= 3) {
      setShowUpgradeDialog(true);
      return;
    }
    navigate('/wall');
  };

  const closeModal = () => setPreviewWall(null);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Profile photo icon top right */}
      <button
        className="admin-profile-icon-btn"
        title="Go to Profile"
        onClick={() => navigate('/profile')}
      >
        {profilePhoto ? (
          <img src={profilePhoto} alt="Profile" />
        ) : (
          <span role="img" aria-label="profile">👤</span>
        )}
      </button>
      <main className="profile-main">
        <div className="profile-content">
          <h1>My Altars</h1>
          {/* Create a New Wall Button */}
          <div className="profile-actions">
            <button className="myaltars-create-altar-btn" onClick={handleCreateAltar}>
              ➕ Create a New Altar
            </button>
          </div>
          {/* Saved Walls Section */}
          <section className="images-section">
            <h2>My Saved Altars</h2>
            {savedWalls.length === 0 ? (
              <div className="no-images">
                <p>No saved altars yet.</p>
                <Link to="/wall" className="myaltars-create-altar-btn">Create Altar</Link>
              </div>
            ) : (
              <div className="images-grid">
                {savedWalls.map((wall) => {
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
                      <div className="wall-preview" onClick={() => setPreviewWall(wall)}>
                        {preview ? (
                          <img src={preview} alt="Saved wall preview" />
                        ) : (
                          <div className="no-preview">No Preview</div>
                        )}
                      </div>
                      <div className="wall-info">
                        <h3 className="wall-name">{wall.name || 'Untitled Wall'}</h3>
                        <span className="wall-date">{new Date(wall.updatedAt || wall.createdAt).toLocaleDateString()}</span>
                        {/* Removed public link display here */}
                        <div className="wall-actions">
                          <button className="restore-btn" onClick={() => handleRestoreWall(wall)}>
                            ♻️ Restore
                          </button>
                          <button className="delete-btn" onClick={() => handleDeleteWall(wall.id)}>
                            🗑️ Delete
                          </button>
                          <button className="share-btn" onClick={() => handleShare(wall.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                              <path d="M12 5V19M12 5L5 12M12 5l7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      {/* Modal for previewing wall */}
      {previewWall && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <h2 style={{ textAlign: 'center' }}>{previewWall.name || 'Untitled Wall'}</h2>
            <WallPreview wallData={previewWall.wallData} style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: '0 auto' }} />
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <span>Created: {new Date(previewWall.createdAt).toLocaleString()}</span>
              <br />
              <span>Last Updated: {new Date(previewWall.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
      {/* Upgrade Dialog for free users hitting the limit */}
      {showUpgradeDialog && (
        <div className="premium-confirm-dialog-overlay">
          <div className="premium-confirm-dialog">
            <h3>Upgrade to Premium</h3>
            <p>You have reached the limit of 3 saved altars for free users.<br />
              Upgrade to MiAltar Prime to save unlimited altars and unlock more features!</p>
            <div className="premium-confirm-actions">
              <button
                className="premium-buy-btn"
                onClick={() => navigate('/premium')}
              >
                Get Prime
              </button>
              <button
                className="premium-current-btn"
                onClick={() => setShowUpgradeDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ShareDialog
        open={shareDialogOpen}
        url={shareUrl}
        onClose={() => setShareDialogOpen(false)}
        altarId={selectedAltarId}
      />
      <footer className="footer">
        <p>© 2025 Virtual Wall. All rights reserved.</p>
        <p>Contact: support@virtualwall.com</p>
      </footer>
    </div>
  );
} 