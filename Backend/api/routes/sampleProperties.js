const express = require('express');
const router = express.Router();
const client = require('../database');
const checkAuth = require('../middleware/check-auth');

// ============================================
// SAMPLE PROPERTIES - Works for ALL minerals
// ============================================

// CREATE Sample Property
router.post('/', checkAuth, async (req, res) => {
  try {
    const {
      sample_id,
      property_name,
      property_value,
      units,
      property_category,
      notes,
    } = req.body;

    if (!sample_id || !property_name) {
      return res
        .status(400)
        .json({ error: 'Sample ID and property name are required' });
    }

    const result = await client.query(
      `INSERT INTO SampleProperties (sample_id, property_name, property_value, units, property_category, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        sample_id,
        property_name,
        property_value,
        units,
        property_category,
        notes,
      ]
    );

    res.status(201).json({
      message: ' Sample property created',
      property: result.rows[0],
    });
  } catch (err) {
    console.error('Error creating sample property:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// CREATE Multiple Properties at once (batch insert)
router.post('/batch', checkAuth, async (req, res) => {
  try {
    const { sample_id, properties } = req.body;

    if (!sample_id || !properties || !Array.isArray(properties)) {
      return res
        .status(400)
        .json({ error: 'Sample ID and properties array are required' });
    }

    const insertPromises = properties.map((prop) =>
      client.query(
        `INSERT INTO SampleProperties (sample_id, property_name, property_value, units, property_category, notes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          sample_id,
          prop.property_name,
          prop.property_value,
          prop.units,
          prop.property_category,
          prop.notes,
        ]
      )
    );

    const results = await Promise.all(insertPromises);
    const insertedProperties = results.map((r) => r.rows[0]);

    res.status(201).json({
      message: ` ${insertedProperties.length} properties created`,
      properties: insertedProperties,
    });
  } catch (err) {
    console.error('Error creating batch properties:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET All Sample Properties
router.get('/', checkAuth, async (req, res) => {
  try {
    const result = await client.query(`
      SELECT sp.*, s.sample_code
      FROM SampleProperties sp
      LEFT JOIN Samples s ON sp.sample_id = s.sample_id
      ORDER BY sp.property_id
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching sample properties:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET Properties by Sample
router.get('/sample/:sampleId', checkAuth, async (req, res) => {
  try {
    const { sampleId } = req.params;
    const result = await client.query(
      'SELECT * FROM SampleProperties WHERE sample_id = $1 ORDER BY property_category, property_name',
      [sampleId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching sample properties:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET Properties by Category (e.g., 'physical', 'chemical')
router.get('/category/:category', checkAuth, async (req, res) => {
  try {
    const { category } = req.params;
    const result = await client.query(
      'SELECT * FROM SampleProperties WHERE property_category = $1 ORDER BY sample_id',
      [category]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching properties by category:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET Single Sample Property
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'SELECT * FROM SampleProperties WHERE property_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sample property not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching sample property:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// UPDATE Sample Property
router.patch('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sample_id,
      property_name,
      property_value,
      units,
      property_category,
      notes,
    } = req.body;

    const result = await client.query(
      `UPDATE SampleProperties
       SET sample_id = COALESCE($1, sample_id),
           property_name = COALESCE($2, property_name),
           property_value = COALESCE($3, property_value),
           units = COALESCE($4, units),
           property_category = COALESCE($5, property_category),
           notes = COALESCE($6, notes)
       WHERE property_id = $7 RETURNING *`,
      [
        sample_id,
        property_name,
        property_value,
        units,
        property_category,
        notes,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sample property not found' });
    }

    res.status(200).json({
      message: '✅ Sample property updated',
      property: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating sample property:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE Sample Property
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'DELETE FROM SampleProperties WHERE property_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sample property not found' });
    }

    res.status(200).json({
      message: ' Sample property deleted',
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error('Error deleting sample property:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
