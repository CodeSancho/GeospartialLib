const express = require('express');
const router = express.Router();
const client = require('../database');
const checkAuth = require('../middleware/check-auth');
const optionalNumber = (value) => value == null || value === '' ? null : Number(value);

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

    const numericEasting = Number(easting);
    const numericNorthing = Number(northing);
    if (!project_id || !hole_id || easting === '' || northing === '' || !Number.isFinite(numericEasting) || !Number.isFinite(numericNorthing)) {
      return res
        .status(400)
        .json({
          error: 'project_id, hole_id, easting, and northing are required',
        });
    }
    if (['WGS84', 'EPSG:4326', '4326'].includes(String(coordinate_system || '').toUpperCase()) &&
        (numericEasting < -180 || numericEasting > 180 || numericNorthing < -90 || numericNorthing > 90)) {
      return res.status(400).json({ error: 'For WGS84, easting must be longitude (-180 to 180) and northing latitude (-90 to 90)' });
    }
    if ((max_depth != null && max_depth !== '' && (!Number.isFinite(Number(max_depth)) || Number(max_depth) <= 0)) ||
        (azimuth != null && azimuth !== '' && (!Number.isFinite(Number(azimuth)) || Number(azimuth) < 0 || Number(azimuth) > 360)) ||
        (dip != null && dip !== '' && (!Number.isFinite(Number(dip)) || Number(dip) < -90 || Number(dip) > 90))) {
      return res.status(400).json({ error: 'Depth must be positive, azimuth must be 0–360, and dip must be -90–90' });
    }
      const geoJson = typeof geom === 'object' && geom !== null ? JSON.stringify(geom) : geom;
      const result = await client.query(
        `INSERT INTO Drillholes (
            project_id, hole_id, easting, northing, elevation, max_depth, contractor_id,
            coordinate_system, start_date, end_date, azimuth, dip, status, geom
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
           CASE
             WHEN $14::text IS NOT NULL THEN ST_SetSRID(ST_GeomFromGeoJSON($14::text), 4326)
             WHEN UPPER(COALESCE($8, '')) IN ('WGS84', 'EPSG:4326', '4326')
               THEN ST_SetSRID(ST_MakePoint($3::float8, $4::float8), 4326)
             ELSE NULL
           END
         )
         RETURNING *, ST_AsGeoJSON(geom) AS geojson`,
        [project_id, hole_id, numericEasting, numericNorthing, optionalNumber(elevation), optionalNumber(max_depth),
          optionalNumber(contractor_id), coordinate_system || null, start_date || null, end_date || null,
          optionalNumber(azimuth), optionalNumber(dip), status || null, geoJson || null]
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
      'SELECT d.*, ST_AsGeoJSON(d.geom) AS geojson FROM Drillholes d ORDER BY drillhole_id'
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
      'SELECT d.*, ST_AsGeoJSON(d.geom) AS geojson FROM Drillholes d WHERE drillhole_id = $1',
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
router.patch('/:id', checkAuth, async (req, res) => {
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

    if ((easting != null && easting !== '' && !Number.isFinite(Number(easting))) ||
        (northing != null && northing !== '' && !Number.isFinite(Number(northing))) ||
        (max_depth != null && max_depth !== '' && (!Number.isFinite(Number(max_depth)) || Number(max_depth) <= 0)) ||
        (azimuth != null && azimuth !== '' && (!Number.isFinite(Number(azimuth)) || Number(azimuth) < 0 || Number(azimuth) > 360)) ||
        (dip != null && dip !== '' && (!Number.isFinite(Number(dip)) || Number(dip) < -90 || Number(dip) > 90))) {
      return res.status(400).json({ error: 'Coordinates and depth values must be numeric; azimuth must be 0–360 and dip -90–90' });
    }
    if (['WGS84', 'EPSG:4326', '4326'].includes(String(coordinate_system || '').toUpperCase()) &&
        ((easting != null && (Number(easting) < -180 || Number(easting) > 180)) ||
         (northing != null && (Number(northing) < -90 || Number(northing) > 90)))) {
      return res.status(400).json({ error: 'For WGS84, easting is longitude (-180 to 180) and northing latitude (-90 to 90)' });
    }

    const geoJson = typeof geom === 'object' && geom !== null ? JSON.stringify(geom) : geom;
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
           geom = CASE
             WHEN $14::text IS NOT NULL THEN ST_SetSRID(ST_GeomFromGeoJSON($14::text), 4326)
             WHEN UPPER(COALESCE($8, coordinate_system, '')) IN ('WGS84', 'EPSG:4326', '4326')
               AND ($3 IS NOT NULL OR $4 IS NOT NULL)
               THEN ST_SetSRID(ST_MakePoint(COALESCE($3, easting), COALESCE($4, northing)), 4326)
             ELSE geom
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE drillhole_id = $15
       RETURNING *, ST_AsGeoJSON(geom) AS geojson`,
      [project_id || null, hole_id || null, optionalNumber(easting), optionalNumber(northing),
        optionalNumber(elevation), optionalNumber(max_depth), optionalNumber(contractor_id),
        coordinate_system || null, start_date || null, end_date || null,
        optionalNumber(azimuth), optionalNumber(dip), status || null, geoJson || null, id]
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
