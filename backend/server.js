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

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test static file serving
app.get('/test-uploads', (req, res) => {
  const fs = require('fs');
  const uploadsDir = path.join(__dirname, 'uploads');
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
app.use('/api/auth', authRoutes.router);
app.use('/api/wall', wallRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/features', featuresRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
