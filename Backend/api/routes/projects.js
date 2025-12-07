const express = require('express');
const router = express.Router();
const client = require('../database');
const checkAuth = require('../middleware/check-auth');

// CREATE a project with optional polygon geometry
router.post('/', checkAuth, async (req, res) => {
  try {
    const { project_id, name, description, location, start_date, end_date, geom } = req.body;

    if (!name || !description || !location) {
      return res.status(400).json({
        error: 'Project name, description, and location are required',
      });
    }

    // Insert with or without geom
    const result = await client.query(
  `INSERT INTO Projects (project_id, name, description, location, start_date, end_date, geom)
   VALUES ($1, $2, $3, $4, $5, $6,
     CASE 
       WHEN $7::text IS NOT NULL 
       THEN ST_SetSRID(ST_GeomFromGeoJSON($7::text), 4326)
       ELSE NULL
     END
   )
   RETURNING project_id, name, description, location, start_date, end_date,
             ST_AsGeoJSON(geom) AS geom`,
  [project_id, name, description, location, start_date, end_date, geom]
);

    res.status(201).json({
      message: ' Project created',
      project: result.rows[0],
    });
  } catch (err) {
    console.error('Error creating project:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// READ ALL projects (return geom as GeoJSON)
router.get('/', checkAuth, async (req, res) => {
  try {
    const result = await client.query(
      `SELECT project_id, name, description, location, start_date, end_date,
              ST_AsGeoJSON(geom) AS geom
       FROM Projects
       ORDER BY project_id`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// READ ONE project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      `SELECT project_id, name, description, location, start_date, end_date,
              ST_AsGeoJSON(geom) AS geom
       FROM Projects
       WHERE project_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching project:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// UPDATE project (can update geometry)
router.patch('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, start_date, end_date, geom } = req.body;

   
   const result = await client.query(
  `UPDATE Projects
   SET name = COALESCE($1, name),
       description = COALESCE($2, description),
       location = COALESCE($3, location),
       start_date = COALESCE($4, start_date),
       end_date = COALESCE($5, end_date),
       geom = CASE 
                WHEN $6::text IS NOT NULL 
                THEN ST_SetSRID(ST_GeomFromGeoJSON($6::text), 4326)
                ELSE geom
              END
   WHERE project_id = $7
   RETURNING project_id, name, description, location, start_date, end_date,
             ST_AsGeoJSON(geom) AS geom`,
  [name, description, location, start_date, end_date, geom, id]
);

    

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '❌ Project not found' });
    }

    res.status(200).json({
      message: ' Project updated successfully',
      project: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating project:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE project
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'DELETE FROM Projects WHERE project_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({
      message: ' Project deleted',
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error('Error deleting project:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
