const express = require('express');
const router = express.Router();
const client = require('../database');
const checkAuth = require('../middleware/check-auth');

// CREATE Geophysics Log
router.post('/', checkAuth, async (req, res) => {
  try {
    const { drillhole_id, depth, log_type, log_value, units } = req.body;
    
    if (!drillhole_id || !depth || !log_type) {
      return res.status(400).json({ error: 'Drillhole ID, depth, and log type are required' });
    }

    const result = await client.query(
      `INSERT INTO GeophysicsLogs (drillhole_id, depth, log_type, log_value, units)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [drillhole_id, depth, log_type, log_value, units]
    );

    res.status(201).json({ 
      message: ' Geophysics log created', 
      log: result.rows[0] 
    });
  } catch (err) {
    console.error('Error creating geophysics log:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET All Geophysics Logs
router.get('/', checkAuth, async (req, res) => {
  try {
    const result = await client.query(`
      SELECT gl.*, d.hole_id
      FROM GeophysicsLogs gl
      LEFT JOIN Drillholes d ON gl.drillhole_id = d.drillhole_id
      ORDER BY gl.geophys_id
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching geophysics logs:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET Geophysics Logs by Drillhole
router.get('/drillhole/:drillholeId', checkAuth, async (req, res) => {
  try {
    const { drillholeId } = req.params;
    const result = await client.query(
      'SELECT * FROM GeophysicsLogs WHERE drillhole_id = $1 ORDER BY depth, log_type', 
      [drillholeId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching geophysics logs:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET Geophysics Logs by Type
router.get('/type/:logType', checkAuth, async (req, res) => {
  try {
    const { logType } = req.params;
    const result = await client.query(
      'SELECT * FROM GeophysicsLogs WHERE log_type = $1 ORDER BY drillhole_id, depth', 
      [logType]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching geophysics logs:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET Single Geophysics Log
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'SELECT * FROM GeophysicsLogs WHERE geophys_id = $1', 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Geophysics log not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching geophysics log:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// UPDATE Geophysics Log
router.patch('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { drillhole_id, depth, log_type, log_value, units } = req.body;
    
    const result = await client.query(
      `UPDATE GeophysicsLogs
       SET drillhole_id = COALESCE($1, drillhole_id),
           depth = COALESCE($2, depth),
           log_type = COALESCE($3, log_type),
           log_value = COALESCE($4, log_value),
           units = COALESCE($5, units)
       WHERE geophys_id = $6 RETURNING *`,
      [drillhole_id, depth, log_type, log_value, units, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Geophysics log not found' });
    }
    
    res.status(200).json({ 
      message: ' Geophysics log updated', 
      log: result.rows[0] 
    });
  } catch (err) {
    console.error('Error updating geophysics log:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE Geophysics Log
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'DELETE FROM GeophysicsLogs WHERE geophys_id = $1 RETURNING *', 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Geophysics log not found' });
    }
    
    res.status(200).json({ 
      message: ' Geophysics log deleted', 
      deleted: result.rows[0] 
    });
  } catch (err) {
    console.error('Error deleting geophysics log:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;