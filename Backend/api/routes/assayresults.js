const express = require('express');
const router = express.Router();
const client = require('../database');
const checkAuth = require('../middleware/check-auth');

// CREATE Assay Result
router.post('/', checkAuth, async (req, res) => {
  try {
    const { sample_id, element, value, units, detection_limit, lab_name, analysis_date } = req.body;
    
    if (!sample_id || !element) {
      return res.status(400).json({ error: 'Sample ID and Element are required' });
    }

    const result = await client.query(
      `INSERT INTO AssayResults (sample_id, element, value, units, detection_limit, lab_name, analysis_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [sample_id, element, value, units, detection_limit, lab_name, analysis_date]
    );

    res.status(201).json({ 
      message: 'Assay result created', 
      result: result.rows[0] 
    });
  } catch (err) {
    console.error('Error creating assay result:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET All Assay Results
router.get('/', checkAuth, async (req, res) => {
  try {
    const result = await client.query(`
      SELECT ar.*, s.sample_code
      FROM AssayResults ar
      LEFT JOIN Samples s ON ar.sample_id = s.sample_id
      ORDER BY ar.result_id
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching assay results:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET Assay Results by Sample
router.get('/sample/:sampleId', checkAuth, async (req, res) => {
  try {
    const { sampleId } = req.params;
    const result = await client.query(
      'SELECT * FROM AssayResults WHERE sample_id = $1 ORDER BY element', 
      [sampleId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching assay results:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET Single Assay Result
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'SELECT * FROM AssayResults WHERE result_id = $1', 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assay result not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching assay result:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// UPDATE Assay Result
router.patch('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { sample_id, element, value, units, detection_limit, lab_name, analysis_date } = req.body;
    
    const result = await client.query(
      `UPDATE AssayResults
       SET sample_id = COALESCE($1, sample_id),
           element = COALESCE($2, element),
           value = COALESCE($3, value),
           units = COALESCE($4, units),
           detection_limit = COALESCE($5, detection_limit),
           lab_name = COALESCE($6, lab_name),
           analysis_date = COALESCE($7, analysis_date)
       WHERE result_id = $8 RETURNING *`,
      [sample_id, element, value, units, detection_limit, lab_name, analysis_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assay result not found' });
    }
    
    res.status(200).json({ 
      message: ' Assay result updated', 
      result: result.rows[0] 
    });
  } catch (err) {
    console.error('Error updating assay result:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE Assay Result
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'DELETE FROM AssayResults WHERE result_id = $1 RETURNING *', 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assay result not found' });
    }
    
    res.status(200).json({ 
      message: ' Assay result deleted', 
      deleted: result.rows[0] 
    });
  } catch (err) {
    console.error('Error deleting assay result:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
