const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

const router = express.Router();

// JWT Secret (should match auth.js)
const JWT_SECRET = 'your-secret-key';

// Verify Token Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Save Wall (create or update latest for user)
router.post('/save', verifyToken, async (req, res) => {
  try {
    const { wallData } = req.body;
    const userId = req.user.userId;

    if (!wallData) {
      return res.status(400).json({ error: 'Wall data is required' });
    }

    // Check if a wall exists for this user
    const [existingWalls] = await db.execute(
      'SELECT * FROM walls WHERE user_id = ?',
      [userId]
    );

    if (existingWalls.length > 0) {
      // Update the latest wall for this user
      await db.execute(
        'UPDATE walls SET wall_data = ?, updated_at = NOW() WHERE user_id = ?',
        [JSON.stringify(wallData), userId]
      );
      res.json({ message: 'Wall updated successfully' });
    } else {
      // Create new wall
      await db.execute(
        'INSERT INTO walls (user_id, wall_data) VALUES (?, ?)',
        [userId, JSON.stringify(wallData)]
      );
      res.json({ message: 'Wall saved successfully' });
    }
  } catch (error) {
    console.error('Save wall error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get User's Walls
router.get('/list', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [walls] = await db.execute(
      'SELECT id, created_at, updated_at FROM walls WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    res.json({ walls });
  } catch (error) {
    console.error('Get walls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Load Specific Wall
router.get('/load/:wallId', verifyToken, async (req, res) => {
  try {
    const { wallId } = req.params;
    const userId = req.user.userId;

    const [walls] = await db.execute(
      'SELECT * FROM walls WHERE id = ? AND user_id = ?',
      [wallId, userId]
    );

    if (walls.length === 0) {
      return res.status(404).json({ error: 'Wall not found' });
    }

    const wall = walls[0];
    res.json({
      wall: {
        id: wall.id,
        wallData: JSON.parse(wall.wall_data),
        createdAt: wall.created_at,
        updatedAt: wall.updated_at
      }
    });
  } catch (error) {
    console.error('Load wall error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Wall
router.delete('/delete/:wallId', verifyToken, async (req, res) => {
  try {
    const { wallId } = req.params;
    const userId = req.user.userId;

    const [result] = await db.execute(
      'DELETE FROM walls WHERE id = ? AND user_id = ?',
      [wallId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Wall not found' });
    }

    res.json({ message: 'Wall deleted successfully' });
  } catch (error) {
    console.error('Delete wall error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload Image
router.post('/upload-image', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test route
router.get('/test', verifyToken, (req, res) => {
  res.json({ 
    message: 'Wall routes are working!',
    user: req.user 
  });
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  res.status(400).json({ error: error.message });
});

module.exports = router;
