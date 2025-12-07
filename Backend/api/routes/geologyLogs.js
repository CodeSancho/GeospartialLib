const express = require('express');
const router = express.Router();
const client = require('../database');
const checkAuth = require('../middleware/check-auth');

// CREATE Geology Log
router.post('/', checkAuth, async (req, res) => {
  try {
    const { sample_id, lithology, alteration, structure, notes } = req.body;
    
    if (!sample_id) {
      return res.status(400).json({ error: 'Sample ID is required' });
    }

    const result = await client.query(
      `INSERT INTO GeologyLogs (sample_id, lithology, alteration, structure, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [sample_id, lithology, alteration, structure, notes]
    );

    res.status(201).json({ 
      message: ' Geology log created', 
      log: result.rows[0] 
    });
  } catch (err) {
    console.error('Error creating geology log:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET All Geology Logs
router.get('/', checkAuth, async (req, res) => {
  try {
    const result = await client.query(`
      SELECT gl.*, s.sample_code, s.from_depth, s.to_depth
      FROM GeologyLogs gl
      LEFT JOIN Samples s ON gl.sample_id = s.sample_id
      ORDER BY gl.log_id
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching geology logs:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET Geology Logs by Sample
router.get('/sample/:sampleId', checkAuth, async (req, res) => {
  try {
    const { sampleId } = req.params;
    const result = await client.query(
      'SELECT * FROM GeologyLogs WHERE sample_id = $1', 
      [sampleId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching geology logs:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET Geology Logs by Drillhole
router.get('/drillhole/:drillholeId', checkAuth, async (req, res) => {
  try {
    const { drillholeId } = req.params;
    const result = await client.query(`
      SELECT gl.*, s.from_depth, s.to_depth, s.sample_code
      FROM GeologyLogs gl
      INNER JOIN Samples s ON gl.sample_id = s.sample_id
      WHERE s.drillhole_id = $1
      ORDER BY s.from_depth
    `, [drillholeId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching geology logs:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET Single Geology Log
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'SELECT * FROM GeologyLogs WHERE log_id = $1', 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Geology log not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching geology log:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// UPDATE Geology Log
router.patch('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { sample_id, lithology, alteration, structure, notes } = req.body;
    
    const result = await client.query(
      `UPDATE GeologyLogs
       SET sample_id = COALESCE($1, sample_id),
           lithology = COALESCE($2, lithology),
           alteration = COALESCE($3, alteration),
           structure = COALESCE($4, structure),
           notes = COALESCE($5, notes)
       WHERE log_id = $6 RETURNING *`,
      [sample_id, lithology, alteration, structure, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Geology log not found' });
    }
    
    res.status(200).json({ 
      message: ' Geology log updated', 
      log: result.rows[0] 
    });
  } catch (err) {
    console.error('Error updating geology log:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE Geology Log
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'DELETE FROM GeologyLogs WHERE log_id = $1 RETURNING *', 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Geology log not found' });
    }
    
    res.status(200).json({ 
      message: 'Geology log deleted', 
      deleted: result.rows[0] 
    });
  } catch (err) {
    console.error('Error deleting geology log:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
