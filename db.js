const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_STRING,
  keepAlive: true, // Enable keep-alive
  idleTimeoutMillis: 10000, // Close idle connections after 10 seconds
});

/*user: process.env.DB_USER,
host: process.env.DB_HOST,
database: process.env.DATABASE,
password: process.env.DB_PASS,
port: process.env.DB_PORT,*/

pool.on('connect', () => {
  console.log('Database pool connected successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Optionally, you can exit the process or attempt to reconnect here
});

module.exports = pool;
