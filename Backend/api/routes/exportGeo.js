// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const csv = require('csv-parser');
// const fs = require('fs');
// const client = require('../database');
// const checkAuth = require('../middleware/check-auth');


// router.get('/exportGeo/drillholes/:projectId', checkAuth, async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const result = await client.query(
//       `SELECT drillhole_id, hole_id, ST_AsGeoJSON(geom)::json AS geometry 
//        FROM Drillholes WHERE project_id = $1`,
//       [projectId]
//     );

//     const geojson = {
//       type: "FeatureCollection",
//       features: result.rows.map(row => ({
//         type: "Feature",
//         geometry: row.geometry,
//         properties: {
//           drillhole_id: row.drillhole_id,
//           hole_id: row.hole_id
//         }
//       }))
//     };

//     res.setHeader('Content-Type', 'application/json');
//     res.status(200).json(geojson);
//   } catch (err) {
//     console.error('Error exporting GeoJSON:', err.message);
//     res.status(500).json({ error: 'Export failed' });
//   }
// });

// router.get('/export/samples/csv/:projectId', checkAuth, async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const result = await client.query(
//       `SELECT s.sample_id, s.from_depth, s.to_depth, d.hole_id, p.name AS project_name
//        FROM Samples s
//        JOIN Drillholes d ON s.drillhole_id = d.drillhole_id
//        JOIN Projects p ON d.project_id = p.project_id
//        WHERE p.project_id = $1`,
//       [projectId]
//     );

//     let csv = "sample_id,from_depth,to_depth,hole_id,project_name\n";
//     result.rows.forEach(r => {
//       csv += `${r.sample_id},${r.from_depth},${r.to_depth},${r.hole_id},${r.project_name}\n`;
//     });

//     res.setHeader('Content-Type', 'text/csv');
//     res.setHeader('Content-Disposition', 'attachment; filename="samples.csv"');
//     res.status(200).send(csv);
//   } catch (err) {
//     console.error('Error exporting CSV:', err.message);
//     res.status(500).json({ error: 'Export failed' });
//   }
// });

// module.exports = router;