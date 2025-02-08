const fs = require('fs');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: './../config.env' }); // Load database connection string from .env file

const pool = new Pool({ connectionString: process.env.DATABASE_STRING });

pool.on('connect', () => {
  console.log('DB connection successful!');
});

const importTourGuides = async () => {
  try {
    // Read the mapped JSON data
    const tourGuides = JSON.parse(
      fs.readFileSync('./mapped_tour_guides.json', 'utf-8')
    );

    // Insert each mapping into the database
    for (const entry of tourGuides) {
      const { tour_id, guide_id } = entry;

      const query = `
        INSERT INTO public."tour_guides" (tour_id, guide_id)
        VALUES ($1, $2);
      `;

      await pool.query(query, [tour_id, guide_id]);
      console.log(`Inserted: ${tour_id} - ${guide_id}`);
    }

    console.log('All data imported successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    pool.end();
  }
};

// Run the import function
importTourGuides();
