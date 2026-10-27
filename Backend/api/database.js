require('dotenv').config();
const { Pool } = require('pg');

const client = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  max: 10,
  idleTimeoutMillis: 30000,
});

client.query('SELECT 1')
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Database connection error', err));

client.on('error', (err) => console.error('Unexpected PostgreSQL pool error', err));

module.exports = client;
