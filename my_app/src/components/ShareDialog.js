import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShareDialog.css';
import { useFeatures } from '../hooks/useFeatures';

export default function ShareDialog({ open, url, onClose, altarId }) {
  const [copied, setCopied] = useState(false);
  const [shareType, setShareType] = useState('public'); // 'public' or 'private'
  const [emailInput, setEmailInput] = useState('');
  const [allowedUsers, setAllowedUsers] = useState([]); // [{email, permission}]
  const [permission, setPermission] = useState('view');
  const [privateLink, setPrivateLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { canUseFeature } = useFeatures();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    // Fetch premium status
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/premium/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // eslint-disable-next-line
        const data = await res.json();
        // setIsPremium(!!data.isPremium); // Removed as per new logic
      } catch {
        // setIsPremium(false); // Removed as per new logic
      }
    };
    fetchStatus();
  }, [open]);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareType === 'public' ? url : privateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareType === 'public' ? url : privateLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleInputClick = (e) => {
    e.target.select();
  };

  const handleAddEmail = () => {
    if (emailInput && !allowedUsers.some(u => u.email === emailInput)) {
      setAllowedUsers([...allowedUsers, { email: emailInput, permission }]);
      setEmailInput('');
    }
  };

  const handlePermissionChange = (email, newPerm) => {
    setAllowedUsers(allowedUsers.map(u =>
      u.email === email ? { ...u, permission: newPerm } : u
    ));
  };

  const handleRemoveEmail = (email) => {
    setAllowedUsers(allowedUsers.filter(u => u.email !== email));
  };

  const handleShare = async () => {
    setError('');
    if (shareType === 'public') {
      setPrivateLink(''); // reset
      // existing public share logic (just show the url)
    } else {
      if (allowedUsers.length === 0) {
        setError('Please add at least one email.');
        return;
      }
      setLoading(true);
      try {
        // Call backend API to save allowedUsers for this altar
        const token = localStorage.getItem('token');
        const res = await fetch('/api/wall/share/private', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
           },
          body: JSON.stringify({ altarId, allowedUsers }),
        });
        const data = await res.json();
        if (res.ok && data.privateLink) {
          setPrivateLink(data.privateLink);
        } else {
          setError(data.error || 'Failed to create private share link.');
        }
      } catch (e) {
        setError('Network error.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleShareTypeChange = (type) => {
    if (type === 'private' && !canUseFeature('private_sharing')) {
      setShowUpgrade(true);
      return;
    }
    if (type === 'public' && !canUseFeature('public_sharing')) {
      setError('Public sharing is not available for your plan.');
      return;
    }
    setShareType(type);
  };

  return (
    <div className="share-dialog-backdrop" onClick={onClose}>
      <div className="share-dialog-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-dialog-header">
          <h3>Share Your Altar</h3>
          <button className="share-dialog-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="share-dialog-content">
          <div style={{ marginBottom: 16 }}>
            {canUseFeature('public_sharing') && (
              <label>
                <input
                  type="radio"
                  value="public"
                  checked={shareType === 'public'}
                  onChange={() => handleShareTypeChange('public')}
                />{' '}
                Public (Anyone with the link)
              </label>
            )}
            <label style={{ marginLeft: 16, opacity: canUseFeature('private_sharing') ? 1 : 0.6, cursor: 'pointer' }}>
              <input
                type="radio"
                value="private"
                checked={shareType === 'private'}
                onChange={() => handleShareTypeChange('private')}
                disabled={false} // Always allow click to trigger upgrade
              />{' '}
              Private (Specific People)
              {!canUseFeature('private_sharing') && (
                <span style={{ marginLeft: 6, color: '#bdbdbd', fontSize: 16 }} title="Premium Only">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle' }}>
                    <rect x="3" y="11" width="18" height="10" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
              )}
            </label>
          </div>

          {showUpgrade && (
            <div className="share-upgrade-modal">
              <div className="share-upgrade-modal-content">
                <h4>Private sharing is a premium feature</h4>
                <p>Upgrade to premium to share your altar privately with specific people.</p>
                <button className="get-prime-btn" onClick={() => navigate('/premium')}>Get Prime</button>
                <button className="cancel-btn" onClick={() => setShowUpgrade(false)}>Cancel</button>
              </div>
            </div>
          )}

          {shareType === 'public' && (
            <div className="share-url-container">
              <label className="share-url-label">Share this link with others:</label>
              <div className="share-url-input-group">
                <input
                  type="text"
                  value={url}
                  readOnly
                  onClick={handleInputClick}
                  className="share-url-input"
                  placeholder="Loading share link..."
                />
                <button
                  className={`share-copy-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopy}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
              </div>
              {copied && (
                <div className="share-copied-message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                  <span>Link copied to clipboard!</span>
                </div>
              )}
            </div>
          )}

          {shareType === 'private' && canUseFeature('private_sharing') && (
            <div className="share-private-container">
              <label>Add people (email):</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="Enter email"
                  style={{ flex: 1 }}
                />
                <select
                  value={permission}
                  onChange={e => setPermission(e.target.value)}
                >
                  <option value="view">View</option>
                  <option value="edit">Edit</option>
                </select>
                <button onClick={handleAddEmail} type="button">Add</button>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {allowedUsers.map(user => (
                  <li key={user.email} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span>{user.email}</span>
                    <select
                      value={user.permission}
                      onChange={e => handlePermissionChange(user.email, e.target.value)}
                    >
                      <option value="view">View</option>
                      <option value="edit">Edit</option>
                    </select>
                    <button onClick={() => handleRemoveEmail(user.email)} type="button">Remove</button>
                  </li>
                ))}
              </ul>
              <button onClick={handleShare} disabled={loading} type="button">
                {loading ? 'Generating link...' : 'Share'}
              </button>
              {privateLink && (
                <div className="share-url-container" style={{ marginTop: 16 }}>
                  <label className="share-url-label">Private share link:</label>
                  <div className="share-url-input-group">
                    <input
                      type="text"
                      value={privateLink}
                      readOnly
                      onClick={handleInputClick}
                      className="share-url-input"
                    />
                    <button
                      className={`share-copy-btn ${copied ? 'copied' : ''}`}
                      onClick={handleCopy}
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  {copied && (
                    <div className="share-copied-message">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                      </svg>
                      <span>Link copied to clipboard!</span>
                    </div>
                  )}
                </div>
              )}
              {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
            </div>
          )}

          <div className="share-dialog-footer">
            <div className="share-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>
                {shareType === 'public'
                  ? 'Anyone with this link can view your altar'
                  : 'Only added people can access this altar'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 