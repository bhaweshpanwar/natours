const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  keepAlive: true,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
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
});

module.exports = pool;
