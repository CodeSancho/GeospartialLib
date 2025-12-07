const express = require('express');
const router = express.Router();
const client = require('../database');
const checkAuth = require('../middleware/check-auth');



router.get('/templates/:commodityType', checkAuth, async (req, res) => {
  try {
    const { commodityType } = req.params;
    const result = await client.query(
      `SELECT * FROM PropertyTemplates 
       WHERE commodity_type = $1 
       ORDER BY display_order`, 
      [commodityType]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching property templates:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// CREATE Property Template
router.post('/templates', checkAuth, async (req, res) => {
  try {
    const { commodity_type, property_name, units, property_category, is_required, display_order } = req.body;
    
    if (!commodity_type || !property_name) {
      return res.status(400).json({ error: 'Commodity type and property name are required' });
    }

    const result = await client.query(
      `INSERT INTO PropertyTemplates (commodity_type, property_name, units, property_category, is_required, display_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [commodity_type, property_name, units, property_category, is_required, display_order]
    );

    res.status(201).json({ 
      message: ' Property template created', 
      template: result.rows[0] 
    });
  } catch (err) {
    console.error('Error creating property template:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;