const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models/db');
const authRoutes = require('./routes/auth');
const wallRoutes = require('./routes/wall');
const adminRoutes = require('./routes/admin');
const premiumRoutes = require('./routes/premium');
const featuresRoutes = require('./routes/features');

const app = express();

const config = require('./config/config');

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:3000', // Keep for backward compatibility
    config.frontendUrl
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, config.upload.path)));

// Serve React build files
app.use(express.static(path.join(__dirname, '../my_app/build'), {
  setHeaders: (res, path) => {
    // Disable caching for all files to prevent browser cache issues
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Test static file serving
app.get('/test-uploads', (req, res) => {
  const fs = require('fs');
  const uploadsDir = path.join(__dirname, config.upload.path);
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({ 
      message: 'Uploads directory accessible',
      files: files,
      uploadsPath: uploadsDir
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Cannot access uploads directory',
      message: error.message 
    });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Virtual Wall Backend is running!' });
});

// Test database route
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT 1 as test');
    res.json({ 
      message: 'Database connection successful!',
      test: rows[0].test 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message 
    });
  }
});

// API Routes with error handling
try {
  app.use('/api/auth', authRoutes.router);
  app.use('/api/wall', wallRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/premium', premiumRoutes);
  app.use('/api/features', featuresRoutes);
} catch (error) {
  console.error('Error mounting routes:', error);
}

// Serve React app for all other routes (SPA routing)
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../my_app/build/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📱 Frontend: http://localhost:${config.port}/`);
  console.log(`🔧 API: http://localhost:${config.port}/api`);
  console.log(`📝 Test endpoints:`);
  console.log(`   - Homepage: http://localhost:${config.port}/`);
  console.log(`   - Login: http://localhost:${config.port}/login`);
  console.log(`   - Signup: http://localhost:${config.port}/signup`);
  console.log(`   - Wall: http://localhost:${config.port}/wall`);
  console.log(`   - API Test: http://localhost:${config.port}/api`);
  console.log(`\n✅ Virtual Altar is ready! Open http://localhost:${config.port}/ in your browser`);
});
