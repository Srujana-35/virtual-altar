const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken } = require('./auth');

// Helper function to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET /api/features - Get all features (Admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM features ORDER BY name');
    res.json({ features: rows });
  } catch (err) {
    console.error('Error fetching features:', err);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

// GET /api/features/user - Get features for current user
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Check if user is premium (admin or has premium status)
    let isPremium = false;
    if (userRole === 'admin') {
      isPremium = true;
    } else {
      const [userRows] = await db.query(
        'SELECT isPremium FROM users WHERE id = ?',
        [userId]
      );
      if (userRows.length > 0) {
        isPremium = !!userRows[0].isPremium;
      }
    }
    
    // Get all features
    const [rows] = await db.query('SELECT * FROM features ORDER BY name');
    
    // Process features for this user
    const userFeatures = {};
    rows.forEach(feature => {
      userFeatures[feature.name] = {
        can_use: feature.is_free || (isPremium && feature.is_premium),
        is_premium: feature.is_premium,
        is_free: feature.is_free,
        label: feature.label,
        description: feature.description,
        icon: feature.icon
      };
    });
    
    res.json({ 
      features: userFeatures,
      userInfo: {
        isPremium,
        role: userRole
      }
    });
  } catch (err) {
    console.error('Error fetching user features:', err);
    res.status(500).json({ error: 'Failed to fetch user features' });
  }
});

// PUT /api/features/:id - Update feature settings (Admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const featureId = req.params.id;
    const { is_premium, is_free } = req.body;
    
    console.log('🔄 Updating feature:', { featureId, is_premium, is_free });
    
    // Convert to boolean if needed (MySQL returns 1/0 as numbers)
    const isPremiumBoolean = Boolean(is_premium);
    const isFreeBoolean = Boolean(is_free);
    
    console.log('🔄 Converted values:', { 
      original: { is_premium, is_free },
      converted: { is_premium: isPremiumBoolean, is_free: isFreeBoolean }
    });
    
    // Check if feature exists first
    const [existingRows] = await db.query('SELECT * FROM features WHERE id = ?', [featureId]);
    if (existingRows.length === 0) {
      console.log('❌ Feature not found with ID:', featureId);
      return res.status(404).json({ error: 'Feature not found' });
    }
    
    console.log('✅ Feature found:', existingRows[0].name);
    
    // Update feature
    const [result] = await db.query(
      'UPDATE features SET is_premium = ?, is_free = ? WHERE id = ?',
      [isPremiumBoolean, isFreeBoolean, featureId]
    );
    
    console.log('📝 Update result:', { affectedRows: result.affectedRows });
    
    if (result.affectedRows === 0) {
      console.log('❌ No rows affected');
      return res.status(404).json({ error: 'Feature not found' });
    }
    
    // Get updated feature
    const [updatedRows] = await db.query('SELECT * FROM features WHERE id = ?', [featureId]);
    
    console.log('✅ Feature updated successfully:', updatedRows[0].name);
    
    res.json({ 
      success: true, 
      message: 'Feature updated successfully',
      feature: updatedRows[0]
    });
  } catch (err) {
    console.error('❌ Error updating feature:', err);
    res.status(500).json({ error: `Failed to update feature: ${err.message}` });
  }
});

// GET /api/features/:id - Get specific feature (Admin only)
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const featureId = req.params.id;
    const [rows] = await db.query('SELECT * FROM features WHERE id = ?', [featureId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Feature not found' });
    }
    
    res.json({ feature: rows[0] });
  } catch (err) {
    console.error('Error fetching feature:', err);
    res.status(500).json({ error: 'Failed to fetch feature' });
  }
});

module.exports = router; 