const express = require('express');
const router = express.Router();
const client = require('../database');
const checkAuth = require('../middleware/check-auth');

// CREATE Drillhole
router.post('/',checkAuth, async (req, res) => {
  try {
    const {
      project_id,
      hole_id,
      easting,
      northing,
      elevation,
      max_depth,
      contractor_id,
      coordinate_system,
      start_date,
      end_date,
      azimuth,
      dip,
      status,
      geom
    } = req.body;

    if (!project_id || !hole_id || !easting || !northing) {
      return res
        .status(400)
        .json({
          error: 'project_id, hole_id, easting, and northing are required',
        });
    }
const result = await client.query(
  `INSERT INTO Drillholes (
      project_id, hole_id, easting, northing, elevation, max_depth, contractor_id,
      coordinate_system, start_date, end_date, azimuth, dip, status, geom
   )
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, ST_SetSRID(ST_MakePoint($14::text, $15::text), 4326))
   RETURNING *`,
  [
    project_id,
    hole_id,
    easting,
    northing,
    elevation,
    max_depth,
    contractor_id,
    coordinate_system,
    start_date,
    end_date,
    azimuth,
    dip,
    status,
    geom
  ]
);

   
    res
      .status(201)
      .json({ message: ' Drillhole created', drillhole: result.rows[0] });
  } catch (err) {
    console.error('Error creating drillhole:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET all drillholes
router.get('/', checkAuth, async (req, res) => {
  try {
    const result = await client.query(
      'SELECT * FROM Drillholes ORDER BY drillhole_id'
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching drillholes:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET single drillhole by ID
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'SELECT * FROM Drillholes WHERE drillhole_id = $1',
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Drillhole not found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching drillhole:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// UPDATE drillhole
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      project_id,
      hole_id,
      easting,
      northing,
      elevation,
      max_depth,
      contractor_id,
      coordinate_system,
      start_date,
      end_date,
      azimuth,
      dip,
      status,
      geom
    } = req.body;

    const result = await client.query(
  `UPDATE Drillholes
   SET project_id = COALESCE($1, project_id),
       hole_id = COALESCE($2, hole_id),
       easting = COALESCE($3, easting),
       northing = COALESCE($4, northing),
       elevation = COALESCE($5, elevation),
       max_depth = COALESCE($6, max_depth),
       contractor_id = COALESCE($7, contractor_id),
       coordinate_system = COALESCE($8, coordinate_system),
       start_date = COALESCE($9, start_date),
       end_date = COALESCE($10, end_date),
       azimuth = COALESCE($11, azimuth),
       dip = COALESCE($12, dip),
       status = COALESCE($13, status),
       geom = COALESCE(ST_SetSRID(ST_MakePoint($14::text, $15::text), 4326), geom),
       updated_at = CURRENT_TIMESTAMP
   WHERE drillhole_id = $14 RETURNING *`,
  [
    project_id,
    hole_id,
    easting,
    northing,
    elevation,
    max_depth,
    contractor_id,
    coordinate_system,
    start_date,
    end_date,
    azimuth,
    dip,
    status,
    id,
    geom
  ]
);


    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Drillhole not found' });
    res
      .status(200)
      .json({ message: 'Drillhole updated', drillhole: result.rows[0] });
  } catch (err) {
    console.error('Error updating drillhole:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE drillhole
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'DELETE FROM Drillholes WHERE drillhole_id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Drillhole not found' });
    res
      .status(200)
      .json({ message: 'Drillhole deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error('Error deleting drillhole:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
