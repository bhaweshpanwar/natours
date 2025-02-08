const dotenv = require('dotenv');
const app = require('./app');
const pool = require('./db'); // Import the pool instance

dotenv.config({ path: './config.env' });

const port = process.env.APP_PORT;

app.listen(port, async () => {
  try {
    await pool.connect(); // Test the database connection
    console.log('Database connected successfully.');
    console.log(`🚀 Server started on port ${port}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
});
