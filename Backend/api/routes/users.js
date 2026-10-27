const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const client = require('../database');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post('/register', async (req, res) => {
  try {
    let { username, email, password } = req.body;
    username = typeof username === 'string' ? username.trim() : '';
    email = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!username || !email || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    if (username.length > 80 || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Enter a valid username and email address' });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be between 8 and 128 characters' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await client.query(
      `INSERT INTO Users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING user_id, username, email, role, created_at`,
      [username, email, hashedPassword, 'user']
    );

    res.status(201).json({ success: true, message: 'User registered', user: result.rows[0] });
  } catch (err) {
    console.error('Register error:', err.message);
    if (err.code === '23505') return res.status(409).json({ error: 'An account with that email already exists' });
    res.status(500).json({ error: 'Unable to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const result = await client.query(`SELECT * FROM Users WHERE email = $1`, [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      console.error(
        'Login error: missing password_hash for user',
        user.user_id
      );
      return res.status(500).json({ error: 'User has no password set' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Profile (protected)
router.get('/profile', checkAuth, async (req, res) => {
  try {
    const decoded = req.user;
    const result = await client.query(
      `SELECT user_id, username, email, role, created_at FROM Users WHERE user_id = $1`,
      [decoded.user_id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Profile error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update Profile (protected)
router.patch('/profile', checkAuth, async (req, res) => {
  try {
    const decoded = req.user;

    const { username, email, currentPassword, newPassword } = req.body;
    const userId = decoded.user_id;

    // Fetch current user
    const userResult = await client.query(
      `SELECT user_id, username, email, password_hash FROM Users WHERE user_id = $1`,
      [userId]
    );
    if (userResult.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });

    const user = userResult.rows[0];
    const updates = [];
    const values = [];
    let idx = 1;

    // Update username if provided
    if (username) {
      updates.push(`username = $${idx++}`);
      values.push(username);
    }

    // Update email if provided
    if (email) {
      updates.push(`email = $${idx++}`);
      values.push(email.toLowerCase());
    }

    // Update password if current password is provided and matches
    if (newPassword && currentPassword) {
      const validPassword = await bcrypt.compare(
        currentPassword,
        user.password_hash
      );
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password incorrect' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.push(`password_hash = $${idx++}`);
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ error: 'No valid fields provided for update' });
    }

    values.push(userId);
    const query = `UPDATE Users SET ${updates.join(
      ', '
    )} WHERE user_id = $${idx} RETURNING user_id, username, email, role, created_at`;
    const result = await client.query(query, values);

    res.status(200).json({ message: 'Profile updated', user: result.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Logout (protected)
router.post('/logout', checkAuth, async (req, res) => {
  try {
    // Token is valid; client should remove it from localStorage
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
