const fs = require('fs');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config({ path: './../../config.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_STRING });

pool.on('connect', () => {
  console.log('DB connection successful!');
});

const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const importData = async () => {
  try {
    for (const user of users) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 12);

      // Insert data into the database
      const query = `
        INSERT INTO public."users"
        (name, email, photo, password, "passwordConfirm", role, active)
        VALUES ($1, $2, $3, $4, $4, $5, $6);`;

      await pool.query(query, [
        user.name,
        user.email,
        user.photo,
        hashedPassword,
        user.role,
        user.active,
      ]);

      console.log(`${user.role} ${user.name} inserted successfully.`);
    }

    console.log('All data imported successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await pool.query('DELETE FROM public."users";');
    console.log('Data deleted successfully!');
    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

// Command-line arguments
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
