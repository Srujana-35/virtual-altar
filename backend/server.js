const express = require('express');
const cors = require('cors');
const path = require('path');

// Check for problematic environment variables BEFORE loading any modules
console.log('=== Checking Environment Variables ===');
const envVars = process.env;
let clearedVars = [];

for (const [key, value] of Object.entries(envVars)) {
  if (value && (
    value.includes('http://') || 
    value.includes('https://') || 
    value.includes('git.new') ||
    value.includes('://') ||
    value.includes('pathToRegexpError')
  )) {
    console.log(`⚠️  WARNING: Environment variable ${key} contains URL: ${value}`);
    // Clear problematic environment variables
    delete process.env[key];
    clearedVars.push(key);
    console.log(`🗑️  Cleared environment variable: ${key}`);
  }
}

if (clearedVars.length > 0) {
  console.log(`✅ Cleared ${clearedVars.length} problematic environment variables:`, clearedVars);
} else {
  console.log('✅ No problematic environment variables found');
}

// Now load other modules
const db = require('./models/db');
const authRoutes = require('./routes/auth');
const wallRoutes = require('./routes/wall');
const adminRoutes = require('./routes/admin');
const premiumRoutes = require('./routes/premium');
const featuresRoutes = require('./routes/features');

const app = express();

const config = require('./config/config');

// Log environment variables for debugging
console.log('Environment variables loaded:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

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

// API Routes with detailed error handling
console.log('Mounting API routes...');

try {
  console.log('Mounting /api/auth...');
  app.use('/api/auth', authRoutes.router);
  console.log('✓ /api/auth mounted successfully');
} catch (error) {
  console.error('✗ Error mounting /api/auth:', error);
}

try {
  console.log('Mounting /api/wall...');
  app.use('/api/wall', wallRoutes);
  console.log('✓ /api/wall mounted successfully');
} catch (error) {
  console.error('✗ Error mounting /api/wall:', error);
}

try {
  console.log('Mounting /api/admin...');
  app.use('/api/admin', adminRoutes);
  console.log('✓ /api/admin mounted successfully');
} catch (error) {
  console.error('✗ Error mounting /api/admin:', error);
}

try {
  console.log('Mounting /api/premium...');
  app.use('/api/premium', premiumRoutes);
  console.log('✓ /api/premium mounted successfully');
} catch (error) {
  console.error('✗ Error mounting /api/premium:', error);
}

try {
  console.log('Mounting /api/features...');
  app.use('/api/features', featuresRoutes);
  console.log('✓ /api/features mounted successfully');
} catch (error) {
  console.error('✗ Error mounting /api/features:', error);
}

console.log('All API routes mounted successfully');

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
