const { Client } = require('pg');
require('dotenv').config();

require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME
};


client.connect()
  .then(() => console.log('Database Connected!'))
  .catch(err => console.error('Connection error', err.stack));





module.exports = client;
