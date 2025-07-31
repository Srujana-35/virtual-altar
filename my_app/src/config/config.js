const config = {
  // API Configuration
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  
  // Frontend Configuration
  frontendUrl: process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000',
  
  // Feature Flags
  enablePremium: process.env.REACT_APP_ENABLE_PREMIUM !== 'false',
  enableSharing: process.env.REACT_APP_ENABLE_SHARING !== 'false',
  enableUploads: process.env.REACT_APP_ENABLE_UPLOADS !== 'false',
  
  // Default Values
  defaultWallHeight: parseInt(process.env.REACT_APP_DEFAULT_WALL_HEIGHT) || 600,
  defaultWallWidth: parseInt(process.env.REACT_APP_DEFAULT_WALL_WIDTH) || 900,
  defaultWallColor: process.env.REACT_APP_DEFAULT_WALL_COLOR || '#f4f4f4',
  defaultBorderStyle: process.env.REACT_APP_DEFAULT_BORDER_STYLE || 'solid',
  
  // Premium Plan Configuration
  premium: {
    monthlyPrice: parseInt(process.env.REACT_APP_MONTHLY_PRICE) || 20,
    sixMonthsPrice: parseInt(process.env.REACT_APP_SIX_MONTHS_PRICE) || 100,
    annualPrice: parseInt(process.env.REACT_APP_ANNUAL_PRICE) || 180
  },
  
  // API Endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      signup: '/auth/signup',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
      requestOtp: '/auth/request-otp',
      verifyOtp: '/auth/verify-otp',
      updateProfile: '/auth/update-profile',
      uploadProfilePhoto: '/auth/upload-profile-photo',
      deleteProfilePhoto: '/auth/delete-profile-photo',
      deleteAccount: '/auth/delete-account'
    },
    wall: {
      list: '/wall/list',
      save: '/wall/save',
      load: '/wall/load',
      update: '/wall/update',
      delete: '/wall/delete',
      uploadImage: '/wall/upload-image',
      view: '/wall/view',
      public: '/wall/public',
      share: '/wall/share'
    },
    premium: {
      status: '/premium/status',
      upgrade: '/premium/upgrade',
      history: '/premium/history'
    },
    features: {
      user: '/features/user',
      list: '/features',
      update: '/features'
    },
    admin: {
      dashboard: '/admin/dashboard-stats',
      users: '/admin/users',
      usersAltars: '/admin/users-altars',
      premiumUsers: '/admin/premium-users',
      givePremium: '/admin/give-premium',
      reauth: '/admin/reauth'
    }
  }
};

export default config; 