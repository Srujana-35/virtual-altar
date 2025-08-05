import { useState, useEffect, createContext, useContext } from 'react';
import config from '../config/config';

// Create context for features
const FeaturesContext = createContext();

// Custom hook to use features
export const useFeatures = () => {
  const context = useContext(FeaturesContext);
  if (!context) {
    throw new Error('useFeatures must be used within a FeaturesProvider');
  }
  return context;
};

// Features Provider Component
export const FeaturesProvider = ({ children }) => {
  const [features, setFeatures] = useState({});
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch features for current user
  const fetchFeatures = async () => {
    try {
      console.log('🔄 Fetching features...');
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        console.log('❌ No token found, setting empty features');
        setFeatures({});
        setUserInfo({});
        setLoading(false);
        return;
      }

      console.log('📡 Making API call to /api/features/user');
      const response = await fetch(`${config.apiBaseUrl}/features/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch features: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Features data received:', data);
      setFeatures(data.features || {});
      setUserInfo(data.userInfo || {});
    } catch (err) {
      console.error('❌ Error fetching features:', err);
      setError(err.message);
      setFeatures({});
      setUserInfo({});
    } finally {
      setLoading(false);
      console.log('🏁 Features fetch completed');
    }
  };

  // Check if user can use a specific feature
  const canUseFeature = (featureName) => {
    if (!features[featureName]) {
      return false;
    }
    return features[featureName].can_use;
  };

  // Get feature info
  const getFeatureInfo = (featureName) => {
    return features[featureName] || null;
  };

  // Refresh features (useful after admin changes)
  const refreshFeatures = () => {
    fetchFeatures();
  };

  // Check if user is premium
  const isPremium = userInfo.isPremium || false;

  // Check if user is admin
  const isAdmin = userInfo.role === 'admin';

  // Initial fetch on mount
  useEffect(() => {
    fetchFeatures();
  }, []);

  // Refresh features when token changes or user logs in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchFeatures();
    }
    
    // Listen for login events
    const handleUserLogin = () => {
      fetchFeatures();
    };
    
    window.addEventListener('userLoggedIn', handleUserLogin);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
    };
  }, []);

  const value = {
    features,
    userInfo,
    loading,
    error,
    canUseFeature,
    getFeatureInfo,
    refreshFeatures,
    isPremium,
    isAdmin,
    fetchFeatures
  };

  return (
    <FeaturesContext.Provider value={value}>
      {children}
    </FeaturesContext.Provider>
  );
};

// Standalone hook for components that don't need the provider
export const useFeaturesStandalone = () => {
  const [features, setFeatures] = useState({});
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setFeatures({});
        setUserInfo({});
        setLoading(false);
        return;
      }

      const response = await fetch(`${config.apiBaseUrl}/features/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch features');
      }

      const data = await response.json();
      setFeatures(data.features || {});
      setUserInfo(data.userInfo || {});
    } catch (err) {
      console.error('Error fetching features:', err);
      setError(err.message);
      setFeatures({});
      setUserInfo({});
    } finally {
      setLoading(false);
    }
  };

  const canUseFeature = (featureName) => {
    if (!features[featureName]) {
      return false;
    }
    return features[featureName].can_use;
  };

  const isPremium = userInfo.isPremium || false;
  const isAdmin = userInfo.role === 'admin';

  useEffect(() => {
    fetchFeatures();
  }, []);

  return {
    features,
    userInfo,
    loading,
    error,
    canUseFeature,
    isPremium,
    isAdmin,
    fetchFeatures
  };
}; 