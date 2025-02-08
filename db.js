const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DATABASE,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('Database pool connected successfully.');
});

module.exports = pool;
