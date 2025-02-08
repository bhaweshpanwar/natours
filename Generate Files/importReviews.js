const fs = require('fs');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: './../config.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_STRING });

pool.on('connect', () => {
  console.log('DB connection successful!');
});

const importReviews = async () => {
  try {
    const reviews = JSON.parse(
      fs.readFileSync('./mapped_reviews.json', 'utf-8')
    );

    for (const review of reviews) {
      const { user_id, tour_id, review: reviewText, rating } = review; // Corrected to destructure `review`

      const query = `
        INSERT INTO public."reviews" (user_id, tour_id, review, rating)
        VALUES ($1, $2, $3, $4);
      `;

      await pool.query(query, [user_id, tour_id, reviewText, rating]);
      console.log(
        `Inserted review for user_id: ${user_id}, tour_id: ${tour_id}`
      );
    }

    console.log('All reviews imported successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    pool.end();
  }
};

importReviews();
