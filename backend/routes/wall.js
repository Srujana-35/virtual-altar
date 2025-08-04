const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const crypto = require('crypto');

const router = express.Router();

// JWT Secret (should match auth.js)
const config = require('../config/config');

// Verify Token Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};



// Save Wall (create new wall for user)
router.post('/save', verifyToken, async (req, res) => {
  try {
    const { wallData, wallName } = req.body;
    const userId = req.user.userId;

    if (!wallData) {
      return res.status(400).json({ error: 'Wall data is required' });
    }

    // Use a default name if wallName is null/undefined/empty
    const nameToSave = wallName || 'Untitled Wall';

    // Always create a new wall entry
    const [result] = await db.execute(
      'INSERT INTO walls (user_id, name, wall_data) VALUES (?, ?, ?)',
      [userId, nameToSave, JSON.stringify(wallData)]
    );
    
    res.json({ 
      message: 'Wall saved successfully',
      wallId: result.insertId,
      name: nameToSave
    });
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
      'SELECT id, name, created_at, updated_at FROM walls WHERE user_id = ? ORDER BY updated_at DESC',
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
        name: wall.name,
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

// Update Wall (edit existing wall for user)
router.put('/update/:wallId', verifyToken, async (req, res) => {
  try {
    const { wallId } = req.params;
    const { wallData, wallName } = req.body;
    const userId = req.user.userId;
    const userEmail = req.user.email;

    if (!wallData) {
      return res.status(400).json({ error: 'Wall data is required' });
    }

    // Use a default name if wallName is null/undefined/empty
    const nameToSave = wallName || 'Untitled Wall';

    // 1. Check if wall exists
    const [walls] = await db.execute('SELECT * FROM walls WHERE id = ?', [wallId]);
    if (walls.length === 0) {
      return res.status(404).json({ error: 'Wall not found' });
    }

    // 2. Check if user is owner
    if (walls[0].user_id === userId) {
      // Owner: allow update
    } else {
      // 3. Check if user has edit permission in altar_shares
      const [shares] = await db.execute(
        'SELECT * FROM altar_shares WHERE altar_id = ? AND email = ? AND permission = ?',
        [wallId, userEmail, 'edit']
      );
      if (shares.length === 0) {
        return res.status(403).json({ error: 'Not authorized to edit this wall' });
      }
      // Editor: allow update
    }

    // 4. Update the wall (no user_id check here, since already authorized)
    await db.execute(
      'UPDATE walls SET name = ?, wall_data = ?, updated_at = NOW() WHERE id = ?',
      [nameToSave, JSON.stringify(wallData), wallId]
    );

    res.json({ message: 'Wall updated successfully', wallId, name: nameToSave });
  } catch (error) {
    console.error('Update wall error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// Public: Load Wall by ID (no authentication)
router.get('/public/:wallId', async (req, res) => {
  try {
    const { wallId } = req.params;
    const [walls] = await db.execute(
      'SELECT id, name, wall_data, created_at, updated_at FROM walls WHERE id = ?',
      [wallId]
    );
    if (walls.length === 0) {
      return res.status(404).json({ error: 'Wall not found' });
    }
    const wall = walls[0];
    res.json({
      wall: {
        id: wall.id,
        name: wall.name,
        wallData: JSON.parse(wall.wall_data),
        createdAt: wall.created_at,
        updatedAt: wall.updated_at
      }
    });
  } catch (error) {
    console.error('Public load wall error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update a private share link for an altar
router.post('/share/private', verifyToken, async (req, res) => {
  try {
    const { altarId, allowedUsers } = req.body;
    if (!altarId || !Array.isArray(allowedUsers) || allowedUsers.length === 0) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // 1. Check if a share_token already exists for this altar
    const [existing] = await db.execute(
      'SELECT share_token FROM altar_shares WHERE altar_id = ? LIMIT 1',
      [altarId]
    );
    let shareToken = existing.length > 0 ? existing[0].share_token : crypto.randomBytes(16).toString('hex');

    // 2. Remove old allowed users for this altar/token
    await db.execute(
      'DELETE FROM altar_shares WHERE altar_id = ? AND share_token = ?',
      [altarId, shareToken]
    );

    // 3. Insert new allowed users
    for (const user of allowedUsers) {
      await db.execute(
        'INSERT INTO altar_shares (altar_id, share_token, email, permission) VALUES (?, ?, ?, ?)',
        [altarId, shareToken, user.email, user.permission]
      );
    }

    // 4. Return the share link
    res.json({ privateLink: `${config.frontendUrl}/wall/view/${shareToken}` });
  } catch (error) {
    console.error('Private share error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Access altar via private share link (requires login)
router.get('/view/:share_token', verifyToken, async (req, res) => {
  try {
    const { share_token } = req.params;
    const userEmail = req.user.email;
    // Check if this email is allowed
    const [rows] = await db.execute(
      'SELECT * FROM altar_shares WHERE share_token = ? AND email = ?',
      [share_token, userEmail]
    );
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }
    // Fetch altar data
    const altarId = rows[0].altar_id;
    const [walls] = await db.execute(
      'SELECT id, name, wall_data, created_at, updated_at FROM walls WHERE id = ?',
      [altarId]
    );
    if (walls.length === 0) {
      return res.status(404).json({ error: 'Altar not found' });
    }
    const wall = walls[0];
    res.json({
      wall: {
        id: wall.id,
        name: wall.name,
        wallData: JSON.parse(wall.wall_data),
        createdAt: wall.created_at,
        updatedAt: wall.updated_at
      },
      permission: rows[0].permission
    });
  } catch (error) {
    console.error('View private wall error:', error);
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
