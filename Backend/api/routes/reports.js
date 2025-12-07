const express = require('express');
const router = express.Router();
const client = require('../database');

// --- PROJECT SUMMARY ---
router.get('/project-summary', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM vw_project_summary');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching project summary:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- DRILLHOLES IN PROJECT ---
router.get('/project/:id/drillholes', async (req, res) => {
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
router.get('/project/:id/samples', async (req, res) => {
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
router.get('/avg-grades', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM vw_avg_grade');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching average grades:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- SAMPLE NEAREST DRILLHOLE (custom query, not in view yet) ---
router.get('/sample/:id/nearest-drillhole', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      `SELECT d.drillhole_id, d.hole_id, ST_Distance(s.geom, d.geom) AS distance_meters
       FROM Samples s
       JOIN Drillholes d ON s.drillhole_id <> d.drillhole_id
       WHERE s.sample_id = $1
       ORDER BY s.geom <-> d.geom
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
