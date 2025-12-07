const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'salah3139', 
  port: 5433,
});



client.connect()
  .then(() => console.log('Database Connected!'))
  .catch(err => console.error('Connection error', err.stack));





module.exports = client;