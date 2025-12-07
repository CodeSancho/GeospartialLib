require('dotenv').config({ debug: false });
const app = require('./app');
const JWT_SECRET = process.env.JWT_SECRET;


console.log('Current directory:', __dirname);
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');




const DEFAULT_PORT = process.env.PORT || 5000;


const server = app.listen(DEFAULT_PORT, () => {
  console.log(`Server running on port ${DEFAULT_PORT}`);
});


server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const newPort = Number(DEFAULT_PORT) + 1;
    console.log(` Port ${DEFAULT_PORT} in use. Trying port ${newPort}...`);

    app.listen(newPort, () => {
      console.log(`Server running on port ${newPort}`);
    });
  } else {
    console.error(err);
  }
});


