const express = require('express');
const router = express.Router();
const client = require('../database');
const checkAuth = require('../middleware/check-auth');

// CREATE Geotechnical/Hydro Record
router.post('/', checkAuth, async (req, res) => {
  try {
    const {
      sample_id,
      rqd_percent,
      recovery_percent,
      groundwater_obs,
      strength_test,
      notes,
    } = req.body;

    if (!sample_id) {
      return res.status(400).json({ error: 'Sample ID is required' });
    }

    const result = await client.query(
      `INSERT INTO GeotechnicalHydro (sample_id, rqd_percent, recovery_percent, groundwater_obs, strength_test, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        sample_id,
        rqd_percent,
        recovery_percent,
        groundwater_obs,
        strength_test,
        notes,
      ]
    );

    res.status(201).json({
      message: '✅ Geotechnical/Hydro record created',
      record: result.rows[0],
    });
  } catch (err) {
    console.error('Error creating geotechnical/hydro record:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET All Geotechnical/Hydro Records
router.get('/', checkAuth, async (req, res) => {
  try {
    const result = await client.query(`
      SELECT gh.*, s.sample_code, s.from_depth, s.to_depth
      FROM GeotechnicalHydro gh
      LEFT JOIN Samples s ON gh.sample_id = s.sample_id
      ORDER BY gh.geo_id
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching geotechnical/hydro records:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET Geotechnical/Hydro by Sample
router.get('/sample/:sampleId', checkAuth, async (req, res) => {
  try {
    const { sampleId } = req.params;
    const result = await client.query(
      'SELECT * FROM GeotechnicalHydro WHERE sample_id = $1',
      [sampleId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching geotechnical/hydro records:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET Single Geotechnical/Hydro Record
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'SELECT * FROM GeotechnicalHydro WHERE geo_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Geotechnical/Hydro record not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching geotechnical/hydro record:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// UPDATE Geotechnical/Hydro Record
router.patch('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sample_id,
      rqd_percent,
      recovery_percent,
      groundwater_obs,
      strength_test,
      notes,
    } = req.body;

    const result = await client.query(
      `UPDATE GeotechnicalHydro
       SET sample_id = COALESCE($1, sample_id),
           rqd_percent = COALESCE($2, rqd_percent),
           recovery_percent = COALESCE($3, recovery_percent),
           groundwater_obs = COALESCE($4, groundwater_obs),
           strength_test = COALESCE($5, strength_test),
           notes = COALESCE($6, notes)
       WHERE geo_id = $7 RETURNING *`,
      [
        sample_id,
        rqd_percent,
        recovery_percent,
        groundwater_obs,
        strength_test,
        notes,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Geotechnical/Hydro record not found' });
    }

    res.status(200).json({
      message: ' Geotechnical/Hydro record updated',
      record: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating geotechnical/hydro record:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE Geotechnical/Hydro Record
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'DELETE FROM GeotechnicalHydro WHERE geo_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Geotechnical/Hydro record not found' });
    }

    res.status(200).json({
      message: ' Geotechnical/Hydro record deleted',
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error('Error deleting geotechnical/hydro record:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
