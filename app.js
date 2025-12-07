const express = require('express');
const app = express();
require('dotenv').config({ debug: false });
const morgan = require('morgan');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const projectsRoutes = require('./api/routes/projects');
const samplesRoutes = require('./api/routes/samples');
const drillholesRoutes = require('./api/routes/drillholes');
//const importRoutes = require('./api/routes/import');
//const reportsRoutes = require('./api/routes/reports');
//const exportGeoRoutes = require('./api/routes/exportGeo');
const usersRoutes = require('./api/routes/users');
const adminRoutes = require('./api/routes/admin');
const assayresultsRoutes = require('./api/routes/assayresults');
const geotechnicalhydroRoutes = require('./api/routes/geotechnicalhydro');
const geologyLogsRoutes = require('./api/routes/geologyLogs');
const geophysicsRoutes = require('./api/routes/geophysics');
const propertyTemplatesRoutes = require('./api/routes/propertyTemplates');
const samplePropertiesRoutes = require('./api/routes/sampleProperties');


app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//  app.use((req, res, next) => {

//  res.header('Acess-Control-Allow-Orders', '*');
//  res.header('Acess-Control-Allow-Headers',
//    "Origin ,X-Requested-With ,Content-Type, Accept,Authorization"
//  )

//  })

app.use('/projects', projectsRoutes);
app.use('/samples', samplesRoutes);
app.use('/drillholes', drillholesRoutes);
//app.use('/import', importRoutes);
//app.use('/reports', reportsRoutes);
//app.use('/export', exportGeoRoutes);
app.use('/users', usersRoutes);
app.use('/admin', adminRoutes);
app.use('/assayresults', assayresultsRoutes);
// app.use('/coal-quality', coalQualityRoutes);
app.use('/geologyLogs', geologyLogsRoutes);
app.use('/geotechnicalhydro', geotechnicalhydroRoutes);
app.use('/geophysics', geophysicsRoutes);
app.use('/propertyTemplates', propertyTemplatesRoutes);
app.use('/sampleProperties', samplePropertiesRoutes);

app.use((req, res, next) => {
  const error = new Error('not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
