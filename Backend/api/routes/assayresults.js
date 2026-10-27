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
    if (!Number.isInteger(Number(sample_id)) || Number(sample_id) < 1 || typeof element !== 'string' || !element.trim()) {
      return res.status(400).json({ error: 'A valid sample ID and element are required' });
    }
    for (const [field, fieldValue] of [['value', value], ['detection_limit', detection_limit]]) {
      if (fieldValue != null && fieldValue !== '' && !Number.isFinite(Number(fieldValue))) {
        return res.status(400).json({ error: `${field} must be a number` });
      }
    }

    const result = await client.query(
      `INSERT INTO AssayResults (sample_id, element, value, units, detection_limit, lab_name, analysis_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [sample_id, element.trim(), value === '' ? null : value, units, detection_limit === '' ? null : detection_limit, lab_name, analysis_date || null]
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

// Import validated assay rows in one transaction.
router.post('/bulk', checkAuth, async (req, res) => {
  const { results } = req.body;
  if (!Array.isArray(results) || results.length === 0 || results.length > 500) {
    return res.status(400).json({ error: 'Provide between 1 and 500 assay rows' });
  }

  const invalidIndex = results.findIndex((row) => {
    if (!row || typeof row !== 'object') return true;
    const sampleId = Number(row.sample_id);
    const value = row.value === '' || row.value == null ? null : Number(row.value);
    const detectionLimit = row.detection_limit === '' || row.detection_limit == null
      ? null : Number(row.detection_limit);
    return !Number.isInteger(sampleId) || sampleId < 1 ||
      typeof row.element !== 'string' || !row.element.trim() ||
      (value !== null && !Number.isFinite(value)) ||
      (detectionLimit !== null && !Number.isFinite(detectionLimit));
  });
  if (invalidIndex !== -1) {
    return res.status(400).json({ error: `Invalid assay data on CSV row ${invalidIndex + 1}` });
  }

  let transaction;
  try {
    transaction = await client.connect();
    await transaction.query('BEGIN');
    const inserted = [];
    for (const row of results) {
      const result = await transaction.query(
        `INSERT INTO AssayResults
          (sample_id, element, value, units, detection_limit, lab_name, analysis_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [Number(row.sample_id), row.element.trim(),
          row.value === '' || row.value == null ? null : Number(row.value),
          row.units || null,
          row.detection_limit === '' || row.detection_limit == null ? null : Number(row.detection_limit),
          row.lab_name || null, row.analysis_date || null]
      );
      inserted.push(result.rows[0]);
    }
    await transaction.query('COMMIT');
    res.status(201).json({ message: `${inserted.length} assay rows imported`, results: inserted });
  } catch (err) {
    if (transaction) {
      try { await transaction.query('ROLLBACK'); } catch (_) { /* connection may already be closed */ }
    }
    console.error('Bulk assay import error:', err.message);
    if (err.code === '23503') return res.status(400).json({ error: 'A CSV row references a sample ID that does not exist' });
    res.status(500).json({ error: 'Could not import assay rows; no rows were saved' });
  } finally {
    transaction?.release();
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
