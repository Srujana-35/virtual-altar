const express = require('express');
const db = require('../models/db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// JWT Secret (should match auth.js)
const JWT_SECRET = 'your-secret-key';

// Middleware to verify token and admin role
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

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
};

// GET /api/admin/users - List all users (admin only)
router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, username, email, role FROM users');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// DELETE /api/admin/users/:id - Delete a user (admin only)
router.delete('/users/:id', verifyToken, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  try {
    // Fetch user email before deletion
    const [users] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
    let userEmail = users.length > 0 ? users[0].email : null;
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Send email notification if email exists
    if (userEmail) {
      let transporter = require('nodemailer').createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      await transporter.sendMail({
        from: 'Virtual Altar <no-reply@virtualaltar.com>',
        to: userEmail,
        subject: 'Your Virtual Altar Account Has Been Deleted by Admin',
        html: `<p>Hello,</p><p>Your Virtual Altar account has been deleted by an administrator. If you believe this is a mistake, please contact support.</p>`
      });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// PUT /api/admin/users/:id - Update a user (admin only)
router.put('/users/:id', verifyToken, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  const { username, email, role } = req.body;
  try {
    if (!username || !email || !role) {
      return res.status(400).json({ error: 'Username, email, and role are required.' });
    }
    let updateQuery = 'UPDATE users SET username = ?, email = ?, role = ?';
    let params = [username, email, role];
    if (role === 'admin') {
      updateQuery += ', isPremium = 1, premiumPlan = ?, premiumExpiry = NULL';
      params.push('admin');
    } else if (role === 'user') {
      updateQuery += ', isPremium = 0, premiumPlan = NULL, premiumExpiry = NULL';
    }
    updateQuery += ' WHERE id = ?';
    params.push(userId);
    const [result] = await db.execute(updateQuery, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Fetch updated user info
    const [users2] = await db.execute('SELECT username, email FROM users WHERE id = ?', [userId]);
    if (users2.length > 0) {
      let transporter = require('nodemailer').createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      await transporter.sendMail({
        from: 'Virtual Altar <no-reply@virtualaltar.com>',
        to: users2[0].email,
        subject: 'Your Virtual Altar Account Has Been Updated by Admin',
        html: `<p>Hello ${users2[0].username},</p><p>Your Virtual Altar account has been updated by an administrator. Your new role is: ${role}</p>`
      });
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// GET /api/admin/users-altars - List all users with their altars (admin only)
router.get('/users-altars', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, username, email FROM users');
    const [walls] = await db.execute('SELECT id, user_id, name, wall_data, created_at, updated_at FROM walls');
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = { user_id: user.id, username: user.username, email: user.email, altars: [] };
    });
    walls.forEach(wall => {
      if (userMap[wall.user_id]) {
        userMap[wall.user_id].altars.push({
          id: wall.id,
          name: wall.name,
          wall_data: JSON.parse(wall.wall_data),
          created_at: wall.created_at,
          updated_at: wall.updated_at
        });
      }
    });
    const result = Object.values(userMap);
    res.json({ users: result });
  } catch (error) {
    console.error('Admin get all altars error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/test-db - Test database queries (admin only)
router.get('/test-db', verifyToken, requireAdmin, async (req, res) => {
  try {
    // Test users table
    const [usersResult] = await db.execute('SELECT COUNT(*) as count FROM users');
    const totalUsers = usersResult[0].count;
    
    // Test walls table
    const [wallsResult] = await db.execute('SELECT COUNT(*) as count FROM walls');
    const totalWalls = wallsResult[0].count;
    
    // Test premium users
    const [premiumResult] = await db.execute('SELECT COUNT(*) as count FROM users WHERE isPremium = 1');
    const premiumUsers = premiumResult[0].count;
    
    // Test profile photos
    const [photosResult] = await db.execute('SELECT COUNT(*) as count FROM users WHERE profile_photo IS NOT NULL');
    const profilePhotos = photosResult[0].count;
    
    res.json({
      message: 'Database test successful',
      totalUsers,
      totalWalls,
      premiumUsers,
      profilePhotos,
      tables: {
        users: totalUsers,
        walls: totalWalls
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database test failed', message: error.message });
  }
});

// GET /api/admin/dashboard-stats - Get dashboard statistics (admin only)
router.get('/dashboard-stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    // Get total users (excluding admins)
    const [totalUsersResult] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const totalUsers = totalUsersResult[0].count;

    // Get total altars (using walls table)
    const [totalAltarsResult] = await db.execute('SELECT COUNT(*) as count FROM walls');
    const totalAltars = totalAltarsResult[0].count;

    // Get premium users
    const [premiumUsersResult] = await db.execute('SELECT COUNT(*) as count FROM users WHERE isPremium = 1');
    const premiumUsers = premiumUsersResult[0].count;

    // Get total photos (count files in uploads directory or use a different approach)
    // For now, we'll count profile photos and estimate total photos
    const [profilePhotosResult] = await db.execute('SELECT COUNT(*) as count FROM users WHERE profile_photo IS NOT NULL');
    const profilePhotos = profilePhotosResult[0].count;
    // Estimate total photos as 3x profile photos (assuming users upload multiple photos per altar)
    const totalPhotos = profilePhotos * 3;

    // Get recent activity (last 10 user registrations and altar creations)
    const [recentUsers] = await db.execute(`
      SELECT username, created_at 
      FROM users 
      WHERE role = 'user' 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    const [recentAltars] = await db.execute(`
      SELECT w.name, u.username, w.created_at 
      FROM walls w
      JOIN users u ON w.user_id = u.id 
      ORDER BY w.created_at DESC 
      LIMIT 5
    `);

    // Format recent activity
    const recentActivity = [];
    
    // Add recent user registrations
    recentUsers.forEach(user => {
      recentActivity.push({
        icon: '👤',
        text: `New user registered: ${user.username}`,
        time: new Date(user.created_at).toLocaleDateString()
      });
    });

    // Add recent altar creations
    recentAltars.forEach(altar => {
      recentActivity.push({
        icon: '🕯️',
        text: `New altar created: ${altar.name} by ${altar.username}`,
        time: new Date(altar.created_at).toLocaleDateString()
      });
    });

    // Sort by date (most recent first) and limit to 10 items
    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
    recentActivity.splice(10);

    res.json({
      totalUsers,
      totalAltars,
      premiumUsers,
      totalPhotos,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Re-authenticate admin for sensitive actions
router.post('/reauth', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = users[0];
    const isValidPassword = await require('bcryptjs').compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List all users with premium info
router.get('/premium-users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, username, email, isPremium, premiumPlan, premiumExpiry FROM users');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch premium users' });
  }
});

// Give premium to a user for a selected plan
router.post('/give-premium', verifyToken, requireAdmin, async (req, res) => {
  const { user_id, plan_type } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });
  const plan = plan_type || 'admin';
  let months = 1;
  if (plan === '6months') months = 6;
  if (plan === 'annual') months = 12;
  // Default: monthly, admin = 1 month
  const now = new Date();
  const expiry = new Date(now);
  expiry.setMonth(expiry.getMonth() + months);
  try {
    const [result] = await db.execute(
      'UPDATE users SET isPremium = 1, premiumPlan = ?, premiumExpiry = ? WHERE id = ?',
      [plan, expiry, user_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Insert billing history record for admin grant
    console.log('About to insert billing history for admin grant', { user_id, plan, now, expiry });
    await db.execute(
      'INSERT INTO billing_history (user_id, plan_type, amount, start_date, end_date, source) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, plan, '$0', now, expiry, 'admin']
    );
    console.log('Inserted billing history for admin grant');
    res.json({ success: true, premiumExpiry: expiry, premiumPlan: plan });
  } catch (error) {
    res.status(500).json({ error: 'Failed to give premium' });
  }
});

module.exports = router; 