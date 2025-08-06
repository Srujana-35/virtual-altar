// Clear DEBUG_URL immediately to prevent path-to-regexp errors
if (process.env.DEBUG_URL) {
  console.log('⚠️  Found DEBUG_URL, clearing it to prevent path-to-regexp errors');
  delete process.env.DEBUG_URL;
}

// Clear any other problematic environment variables
const envVars = process.env;
for (const [key, value] of Object.entries(envVars)) {
  if (value && (
    value.includes('git.new') ||
    value.includes('pathToRegexpError') ||
    key === 'DEBUG_URL' ||
    key.includes('DEBUG')
  )) {
    console.log(`🗑️  Clearing problematic env var: ${key}`);
    delete process.env[key];
  }
}

const express = require('express');
const cors = require('cors');
const path = require('path');

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
  origin: true, // Allow all origins
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, config.upload.path)));

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

// Function to safely mount routes
function safeMountRoute(path, router, name) {
  try {
    console.log(`Mounting ${path}...`);
    
    // Validate the router before mounting
    if (!router || typeof router !== 'function') {
      throw new Error(`Invalid router for ${name}: ${typeof router}`);
    }
    
    app.use(path, router);
    console.log(`✓ ${path} mounted successfully`);
    return true;
  } catch (error) {
    console.error(`✗ Error mounting ${path}:`, error.message);
    console.error('Full error:', error);
    return false;
  }
}

// Mount routes one by one with validation
const routes = [
  { path: '/api/auth', router: authRoutes.router, name: 'auth' },
  { path: '/api/wall', router: wallRoutes, name: 'wall' },
  { path: '/api/admin', router: adminRoutes, name: 'admin' },
  { path: '/api/premium', router: premiumRoutes, name: 'premium' },
  { path: '/api/features', router: featuresRoutes, name: 'features' }
];

let mountedCount = 0;
for (const route of routes) {
  if (safeMountRoute(route.path, route.router, route.name)) {
    mountedCount++;
  }
}

console.log(`✅ Successfully mounted ${mountedCount}/${routes.length} routes`);

// Simple catch-all route for API only
app.get('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`🚀 Backend API running on port ${config.port}`);
  console.log(`🔧 API: http://localhost:${config.port}/api`);
  console.log(`📝 Test endpoints:`);
  console.log(`   - API Test: http://localhost:${config.port}/api`);
  console.log(`   - Database Test: http://localhost:${config.port}/test-db`);
  console.log(`\n✅ Backend is ready! API only mode.`);
});
