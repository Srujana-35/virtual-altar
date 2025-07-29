const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = 'your-secret-key';

// Configure multer for profile photo uploads
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
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// User Registration
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email, and password are required' 
      });
    }

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, username, email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: result.insertId, username, email }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token (include role)
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, profile_photo: user.profile_photo }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

// Update user profile (username, email, password)
router.put('/update-profile', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { username, email, password, currentPassword, newPassword } = req.body;
  try {
    let didUpdate = false;
    // If changing password, require currentPassword and newPassword
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password are required.' });
      }
      // Fetch current password hash from DB
      const [users] = await db.execute('SELECT password, email, username FROM users WHERE id = ?', [userId]);
      if (!users.length) return res.status(404).json({ error: 'User not found' });
      const isValid = await bcrypt.compare(currentPassword, users[0].password);
      if (!isValid) return res.status(400).json({ error: 'Current password is incorrect.' });
      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
      didUpdate = true;
      // Send password changed notification
      await sendPasswordChangedEmail(users[0].email, users[0].username);
    }
    // Update username/email if provided
    let query = 'UPDATE users SET ';
    const params = [];
    if (username) {
      query += 'username = ?, ';
      params.push(username);
    }
    if (email) {
      query += 'email = ?, ';
      params.push(email);
    }
    if (params.length > 0) {
      query = query.slice(0, -2);
      query += ' WHERE id = ?';
      params.push(userId);
      await db.execute(query, params);
      didUpdate = true;
    }
    if (!didUpdate) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    // Fetch and return updated user info
    const [users2] = await db.execute('SELECT id, username, email, profile_photo FROM users WHERE id = ?', [userId]);
    // Send email notification
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
        subject: 'Your Virtual Altar Account Details Updated',
        html: `<p>Hello ${users2[0].username},</p><p>Your Virtual Altar account details were updated. If this wasn’t you, please contact support immediately.</p>`
      });
    }
    res.json({ message: 'Profile updated', user: users2[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Edit username with password verification
router.put('/edit-username', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { username, currentPassword } = req.body;
  if (!username || !currentPassword) {
    return res.status(400).json({ error: 'Username and current password are required.' });
  }
  try {
    // Fetch current password hash from DB
    const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [userId]);
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    const isValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValid) return res.status(400).json({ error: 'Current password is incorrect.' });
    // Update username
    await db.execute('UPDATE users SET username = ? WHERE id = ?', [username, userId]);
    // Fetch and return updated user info
    const [users2] = await db.execute('SELECT id, username, email, profile_photo FROM users WHERE id = ?', [userId]);
    res.json({ message: 'Username updated', user: users2[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update username' });
  }
});

// Upload profile photo
router.post('/upload-profile-photo', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const userId = req.user.userId;
    // Remove old photo if exists
    const [users] = await db.execute('SELECT profile_photo FROM users WHERE id = ?', [userId]);
    if (users.length && users[0].profile_photo) {
      const oldPath = path.join('uploads', users[0].profile_photo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    // Save new filename
    await db.execute('UPDATE users SET profile_photo = ? WHERE id = ?', [req.file.filename, userId]);
    res.json({ message: 'Profile photo uploaded', filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload profile photo' });
  }
});

// Delete profile photo
router.delete('/delete-profile-photo', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [users] = await db.execute('SELECT profile_photo FROM users WHERE id = ?', [userId]);
    if (users.length && users[0].profile_photo) {
      const filePath = path.join('uploads', users[0].profile_photo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await db.execute('UPDATE users SET profile_photo = NULL WHERE id = ?', [userId]);
      res.json({ message: 'Profile photo deleted' });
    } else {
      res.status(404).json({ error: 'No profile photo to delete' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete profile photo' });
  }
});

// Delete user account
router.delete('/delete-account', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    // Fetch user email before deletion
    const [users] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
    let userEmail = users.length > 0 ? users[0].email : null;
    // Delete user from users table
    await db.execute('DELETE FROM users WHERE id = ?', [userId]);
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
        subject: 'Your Virtual Altar Account Has Been Deleted',
        html: `<p>Hello,</p><p>Your Virtual Altar account has been deleted as per your request. If this was not you, please contact support immediately.</p>`
      });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Forgot Password Endpoint
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    // Find user by email
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      const user = users[0];
      // Generate reset token (expires in 1 hour)
      const resetToken = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      // Create reset link
      const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
      // Send email using nodemailer (Gmail SMTP)
      let transporter = nodemailer.createTransport({
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
        to: email,
        subject: 'Password Reset Request',
        html: `<p>Hello,</p><p>You requested a password reset for your Virtual Altar account.</p><p><a href="${resetLink}">Click here to reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`
      });
      console.log('Password reset email sent to:', email);
    }
    // Always respond with generic message
    res.json({ message: 'If an account with that email exists, you will receive a password reset link.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password Endpoint
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Update password in DB
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    // Fetch user email and username
    const [users] = await db.execute('SELECT email, username FROM users WHERE id = ?', [userId]);
    if (users.length > 0) {
      await sendPasswordChangedEmail(users[0].email, users[0].username);
    }
    res.json({ message: 'Password reset successful.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid reset token.' });
    }
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// In-memory OTP store (for development/demo)
const otpStore = {};

// Helper: Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: Send OTP email for signup
async function sendOtpEmail(email, otp) {
  let transporter = nodemailer.createTransport({
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
    to: email,
    subject: 'Your OTP for Virtual Altar Signup',
    html: `<p>Your OTP for Virtual Altar signup is: <b>${otp}</b></p><p>This code will expire in 3 minutes.</p>`
  });
}

// Helper: Send OTP email for email change
async function sendOtpEmailForEdit(email, otp) {
  let transporter = nodemailer.createTransport({
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
    to: email,
    subject: 'Your OTP for Email Change - Virtual Altar',
    html: `<p>Your OTP for changing your email address is: <b>${otp}</b></p><p>This code will expire in 3 minutes.</p><p>If you did not request this change, please ignore this email.</p>`
  });
}

// Request OTP for signup or email change
router.post('/request-otp', async (req, res) => {
  const { email, context = 'signup' } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    if (context === 'edit') {
      // For email change, don't check if user exists (they are already logged in)
      const otp = generateOTP();
      otpStore[email] = {
        otp,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      };
      await sendOtpEmailForEdit(email, otp);
      res.json({ message: 'OTP sent to email' });
    } else {
      // For signup, check if user already exists
      const [existingUsers] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      // Generate OTP and store with expiry
      const otp = generateOTP();
      otpStore[email] = {
        otp,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      };
      await sendOtpEmail(email, otp);
      res.json({ message: 'OTP sent to email' });
    }
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP and complete signup
router.post('/verify-otp', async (req, res) => {
  const { email, otp, username, password } = req.body;
  if (!email || !otp || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    // Check OTP
    const record = otpStore[email];
    if (!record || record.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (Date.now() > record.expires) {
      delete otpStore[email];
      return res.status(400).json({ error: 'OTP expired' });
    }
    // Check if user already exists (race condition check)
    const [existingUsers] = await db.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existingUsers.length > 0) {
      delete otpStore[email];
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert new user
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    delete otpStore[email];
    // Send welcome email
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
      to: email,
      subject: 'Welcome to Virtual Altar!',
      html: `<p>Hello ${username},</p><p>Your Virtual Altar account was created successfully! You can now log in and start using the platform.</p>`
    });
    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, username, email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: result.insertId, username, email }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP or create user' });
  }
});
// Request OTP for profile/email edit (does NOT check if user exists)
router.post('/request-otp-edit', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    // Generate OTP and store with expiry (3 minutes for consistency with frontend)
    const otp = generateOTP();
    otpStore[email] = {
      otp,
      expires: Date.now() + 3 * 60 * 1000 // 3 minutes
    };
    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Request OTP (edit) error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP for email edit (no user existence check)
router.post('/verify-otp-edit', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }
  try {
    const record = otpStore[email];
    if (!record || record.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (Date.now() > record.expires) {
      delete otpStore[email];
      return res.status(400).json({ error: 'OTP expired' });
    }
    delete otpStore[email];
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Removed /me route from auth.js


// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

// Helper: Send password changed notification
async function sendPasswordChangedEmail(email, username) {
  let transporter = nodemailer.createTransport({
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
    to: email,
    subject: 'Your Virtual Altar Password Has Been Changed',
    html: `<p>Hello ${username || ''},</p><p>Your Virtual Altar account password has been changed. If this wasn’t you, please reset your password or contact support immediately.</p>`
  });
}

module.exports = { router, verifyToken };
