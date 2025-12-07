// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const csv = require('csv-parser');
// const fs = require('fs');
// const client = require('../database');
// const checkAuth = require('../middleware/check-auth');

// const upload = multer({ dest: 'uploads/' });

// // Upload Drillholes CSV
// router.post('/drillholes', upload.single('file'), checkAuth, async (req, res) => {
//   try {
//     const results = [];
//     fs.createReadStream(req.file.path)
//       .pipe(csv())
//       .on('data', (row) => results.push(row))
//       .on('end', async () => {
//         for (let row of results) {
//           await client.query(
//             `INSERT INTO Drillholes (hole_id, project_id, geom)
//              VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326))`,
//             [row.hole_id, row.project_id, row.longitude, row.latitude]
//           );
//         }
//         res.status(201).json({ message: ' Drillholes imported', count: results.length });
//       });
//   } catch (err) {
//     console.error('Error importing CSV:', err.message);
//     res.status(500).json({ error: 'Import failed' });
//   }
// });

// module.exports = router;
