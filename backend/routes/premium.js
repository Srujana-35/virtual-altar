const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken } = require('./auth');

// POST /api/premium/upgrade
router.post('/upgrade', verifyToken, async (req, res) => {
  try {
    console.log('req.user:', req.user); // Debug: log the user object
    const userId = req.user.userId; // Use userId from JWT
    if (!userId) return res.status(400).json({ error: 'User ID missing in token' });
    const { plan } = req.body; // 'monthly', '6months', 'annual'
    let months = 1;
    if (plan === '6months') months = 6;
    if (plan === 'annual') months = 12;
    if (!['monthly', '6months', 'annual'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + months);

    // Determine amount for each plan (as string with $)
    let amount = '$20';
    if (plan === '6months') amount = '$100';
    if (plan === 'annual') amount = '$180';

    // Update user premium status
    const [result] = await db.query(
      'UPDATE users SET isPremium = 1, premiumPlan = ?, premiumExpiry = ? WHERE id = ?',
      [plan, expiry, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or not updated' });
    }

    // Insert billing history record for user purchase
    const startDate = new Date();
    await db.query(
      'INSERT INTO billing_history (user_id, plan_type, amount, start_date, end_date, source) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, plan, amount, startDate, expiry, 'user']
    );

    res.json({ success: true, premiumExpiry: expiry, premiumPlan: plan });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upgrade to premium' });
  }
});

// Get current user's premium status
router.get('/status', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  if (userRole === 'admin') {
    // Admins are always premium
    return res.json({ isPremium: true, premiumPlan: 'admin', premiumExpiry: null });
  }
  try {
    const [rows] = await db.query(
      'SELECT isPremium, premiumPlan, premiumExpiry FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get billing history for current user
router.get('/history', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const [rows] = await db.query(
      'SELECT id, plan_type, amount, start_date, end_date, source FROM billing_history WHERE user_id = ? ORDER BY start_date DESC',
      [userId]
    );
    res.json({ history: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch billing history' });
  }
});

module.exports = router; 