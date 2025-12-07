const express = require('express');
const router = express.Router();
const client = require('../database');
const checkAuth = require('../middleware/check-auth');

router.post('/', checkAuth,async (req, res) => {
  try {
    const { sample_id, drillhole_id, sample_code, from_depth, to_depth, sample_type, date_collected, geom } = req.body;
if (!sample_id && !sample_code && !drillhole_id && from_depth && !to_depth && !sample_type && !date_collected) {
        return res
          .status(400)
          .json({ error: ' All field are required' });
      }

const result = await client.query(
  `INSERT INTO Samples 
   (sample_id, drillhole_id, sample_code, from_depth, to_depth, sample_type, date_collected, geom)
   VALUES ($1, $2, $3, $4, $5, $6, $7, ST_GeomFromText($8::text, 4326)) RETURNING *`,
  [sample_id, drillhole_id, sample_code, from_depth, to_depth, sample_type, date_collected, geom]
);

   
    res.status(201).json({ message: ' Sample created', sample: result.rows[0] });
  } catch (err) {
    console.error('Error creating sample:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/', checkAuth, async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM samples ORDER BY sample_id');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching samples:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query('SELECT * FROM Samples WHERE sample_id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sample not found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching sample:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

router.patch('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { drillhole_id, sample_code, from_depth, to_depth, sample_type,date_collected,geom} = req.body;
    const result = await client.query(
  `UPDATE Samples
   SET drillhole_id = COALESCE($1, drillhole_id),
       sample_code = COALESCE($2, sample_code),
       from_depth = COALESCE($3, from_depth),
       to_depth = COALESCE($4, to_depth),
       sample_type = COALESCE($5, sample_type),
       date_collected = COALESCE($6, date_collected),
       geom = COALESCE(ST_GeomFromText($7::text, 4326), geom)
   WHERE sample_id = $8 RETURNING *`,
  [drillhole_id, sample_code, from_depth, to_depth, sample_type, date_collected, geom, id]
);

    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sample not found' });
    res.status(200).json({ message: ' Sample updated', sample: result.rows[0] });
  } catch (err) {
    console.error('Error updating sample:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query('DELETE FROM Samples WHERE sample_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sample not found' });
    res.status(200).json({ message: ' Sample deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error('Error deleting sample:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
