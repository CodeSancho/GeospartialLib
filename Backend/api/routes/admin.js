const express = require('express');
const router = express.Router();
const client = require('../database');
const checkAuth = require('../middleware/check-auth');
const checkRole = require('../middleware/check-role');

// Get all users (admin only, with pagination + filter)
router.get('/', checkAuth, checkRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT user_id, username, email, role, created_at FROM Users`;
    let params = [];

    if (role) {
      query += ` WHERE role = $1`;
      params.push(role);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await client.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update user role (admin only)
router.patch('/:id/role', checkAuth, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const result = await client.query(
      `UPDATE Users SET role = $1 WHERE user_id = $2 RETURNING user_id, username, email, role, created_at`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: ' Role updated', user: result.rows[0] });
  } catch (err) {
    console.error('Error updating role:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete user (admin only)
router.delete('/:id', checkAuth, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await client.query(
      `DELETE FROM Users WHERE user_id = $1 RETURNING user_id, username, email, role`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
