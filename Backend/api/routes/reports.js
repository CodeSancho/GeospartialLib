const express = require('express');
const router = express.Router();
const client = require('../database');
const checkAuth = require('../middleware/check-auth');

// --- PROJECT SUMMARY ---
router.get('/project-summary', checkAuth, async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM vw_project_summary');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching project summary:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- DRILLHOLES IN PROJECT ---
router.get('/project/:id/drillholes', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'SELECT * FROM vw_project_drillholes WHERE project_id = $1',
      [id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching drillholes:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- SAMPLES IN PROJECT ---
router.get('/project/:id/samples', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'SELECT * FROM vw_samples_in_project WHERE project_id = $1',
      [id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching samples in project:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- AVERAGE GRADES PER DRILLHOLE OR ELEMENT ---
router.get('/avg-grades', checkAuth, async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM vw_avg_grade');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching average grades:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- SAMPLE NEAREST DRILLHOLE (custom query, not in view yet) ---
router.get('/sample/:id/nearest-drillhole', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      `SELECT d.drillhole_id, d.hole_id,
              ST_Distance(s.geom::geography, d.geom::geography) AS distance_meters
       FROM Samples s
       JOIN Drillholes d ON s.drillhole_id <> d.drillhole_id AND d.geom IS NOT NULL
       WHERE s.sample_id = $1 AND s.geom IS NOT NULL
       ORDER BY s.geom::geography <-> d.geom::geography
       LIMIT 1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No nearest drillhole found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching nearest drillhole:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
