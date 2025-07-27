import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './admindashboard.css';

function FeatureManagement() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [originalFeatures, setOriginalFeatures] = useState([]);
  const navigate = useNavigate();

  // Fetch all features (admin only)
  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/features', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          alert('Admin access required');
          navigate('/admin');
          return;
        }
        throw new Error('Failed to fetch features');
      }

      const data = await response.json();
      
      // Convert MySQL boolean values (1/0) to JavaScript booleans
      const convertedFeatures = (data.features || []).map(feature => ({
        ...feature,
        is_premium: Boolean(feature.is_premium),
        is_free: Boolean(feature.is_free)
      }));
      
      setFeatures(convertedFeatures);
      setOriginalFeatures(convertedFeatures);
    } catch (error) {
      console.error('Error fetching features:', error);
      setMessage('Error loading features');
    } finally {
      setLoading(false);
    }
  };

  // Update feature settings
  const updateFeature = (featureId, field, value) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? { ...feature, [field]: value }
        : feature
    ));
  };

  // Save all changes
  const saveChanges = async () => {
    try {
      setSaving(true);
      setMessage('');

      const token = localStorage.getItem('token');
      const changedFeatures = features.filter(feature => {
        const original = originalFeatures.find(f => f.id === feature.id);
        return original && (
          original.is_premium !== feature.is_premium ||
          original.is_free !== feature.is_free
        );
      });

      if (changedFeatures.length === 0) {
        setMessage('No changes to save');
        return;
      }

      // Update each changed feature
      for (const feature of changedFeatures) {
        console.log('🔄 Updating feature:', { 
          id: feature.id, 
          name: feature.name, 
          label: feature.label,
          is_premium: feature.is_premium,
          is_free: feature.is_free 
        });
        
        const response = await fetch(`http://localhost:5000/api/features/${feature.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            is_premium: feature.is_premium,
            is_free: feature.is_free
          })
        });

        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Update failed:', errorData);
          throw new Error(`Failed to update ${feature.label}: ${errorData.error || 'Unknown error'}`);
        }
        
        console.log('✅ Feature updated successfully:', feature.label);
      }

      setMessage(`✅ Successfully updated ${changedFeatures.length} feature(s)!`);
      setOriginalFeatures([...features]);
      
      // Show preview of changes
      setTimeout(() => {
        setMessage('🔄 Changes will take effect immediately for all users');
      }, 2000);
    } catch (error) {
      console.error('Error saving features:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Reset to original values
  const resetChanges = () => {
    setFeatures([...originalFeatures]);
    setMessage('🔄 Changes reset to original values');
  };

  // Check if there are unsaved changes
  const hasChanges = () => {
    return features.some(feature => {
      const original = originalFeatures.find(f => f.id === feature.id);
      return original && (
        original.is_premium !== feature.is_premium ||
        original.is_free !== feature.is_free
      );
    });
  };

  // Group features by category
  const groupedFeatures = features.reduce((groups, feature) => {
    const category = getFeatureCategory(feature.name);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(feature);
    return groups;
  }, {});

  function getFeatureCategory(featureName) {
    if (featureName.includes('decoration')) return 'Decorations';
    if (featureName.includes('background')) return 'Backgrounds';
    if (featureName.includes('image') || featureName.includes('border')) return 'Images';
    if (featureName.includes('wall')) return 'Wall Customization';
    if (featureName.includes('save') || featureName.includes('load')) return 'Save/Load';
    if (featureName.includes('download') || featureName.includes('clear') || featureName.includes('remove')) return 'Actions';
    if (featureName.includes('drag') || featureName.includes('resize') || featureName.includes('context')) return 'Interactions';
    if (featureName.includes('sharing')) return 'Sharing';
    if (featureName.includes('draft') || featureName.includes('unlimited')) return 'Draft Limits';
    return 'Other';
  }

  useEffect(() => {
    fetchFeatures();  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Feature Management</h1>
          <button onClick={() => navigate('/admin')} className="back-button">← Back to Admin</button>
        </div>
        <div className="loading-message">Loading features...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🎛️ Feature Management</h1>
        <button onClick={() => navigate('/admin')} className="back-button">← Back to Admin</button>
      </div>

      <div className="feature-management-container">
        <div className="feature-management-header">
          <p className="feature-description">
            Control which features are available to free and premium users. 
            Changes take effect immediately for all users.
          </p>
          
          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info'}`}>
              {message}
            </div>
          )}

          <div className="feature-actions">
            <button 
              onClick={saveChanges} 
              disabled={saving || !hasChanges()}
              className="save-button"
            >
              {saving ? '💾 Saving...' : '💾 Save Changes'}
            </button>
            <button 
              onClick={resetChanges} 
              disabled={!hasChanges()}
              className="reset-button"
            >
              🔄 Reset Changes
            </button>
          </div>
        </div>

        <div className="feature-categories">
          {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
            <div key={category} className="feature-category">
              <h3 className="category-title">{category}</h3>
              <div className="features-grid">
                {categoryFeatures.map(feature => (
                  <div key={feature.id} className="feature-card">
                    <div className="feature-header">
                      <span className="feature-icon">{feature.icon}</span>
                      <div className="feature-info">
                        <h4 className="feature-label">{feature.label}</h4>
                        <p className="feature-description">{feature.description}</p>
                      </div>
                    </div>
                    
                    <div className="feature-toggles">
                      <div className="toggle-group">
                        <label className="toggle-label">
                          <span className="toggle-text">Free Users</span>
                          <input
                            type="checkbox"
                            checked={feature.is_free}
                            onChange={(e) => updateFeature(feature.id, 'is_free', e.target.checked)}
                            className="toggle-checkbox"
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      
                      <div className="toggle-group">
                        <label className="toggle-label">
                          <span className="toggle-text">Premium Users</span>
                          <input
                            type="checkbox"
                            checked={feature.is_premium}
                            onChange={(e) => updateFeature(feature.id, 'is_premium', e.target.checked)}
                            className="toggle-checkbox"
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>

                    <div className="feature-status">
                      <span className={`status-badge ${feature.is_free ? 'free' : ''} ${feature.is_premium ? 'premium' : ''}`}>
                        {feature.is_free && feature.is_premium ? 'Both' : 
                         feature.is_free ? 'Free Only' : 
                         feature.is_premium ? 'Premium Only' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeatureManagement; 