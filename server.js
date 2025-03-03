const dotenv = require('dotenv');
const app = require('./app');
const pool = require('./db'); // Import the pool instance

dotenv.config({ path: './config.env' });

const port = process.env.APP_PORT;

app.listen(port, async () => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully.');
    client.release();
    console.log(`🚀 Server started on port ${port}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully...');
  pool.end(() => {
    console.log('Database pool closed.');
    process.exit(0);
  });
});
