const fs = require('fs');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: './../../config.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_STRING });

pool.on('connect', () => {
  console.log('DB connection successful!');
});

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// Helper function to insert data into the locations table
const insertLocation = async (location, toursId = null) => {
  const query = `
    INSERT INTO public."locations" 
    ("type", "coordinates", "description", "address", "tours_id")
    VALUES 
    ($1, ST_SetSRID(ST_GeomFromText($2), 4326), $3, $4, $5)
    RETURNING id;
  `;
  const values = [
    location.type || 'Point',
    `SRID=4326;POINT(${location.coordinates[0]} ${location.coordinates[1]})`,
    location.description,
    location.address || null,
    toursId,
  ];

  try {
    const result = await pool.query(query, values);
    const locationId = result.rows[0].id;
    if (location && toursId) {
      const updateTourQuery = ` UPDATE public."tours" SET start_location_id = $1 WHERE id = $2; `;
      await pool.query(updateTourQuery, [locationId, toursId]);
    }
    return locationId;
  } catch (err) {
    console.error(`Error inserting location: ${err.message}`);
    throw err;
  }
};

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    for (let tour of tours) {
      // Insert tour without specifying ID
      const tourQuery = `
        INSERT INTO public."tours" 
        ("name", "duration", "maxGroupSize", "difficulty", "price", "summary", "description", 
         "imageCover", "images", "ratingsAverage", "ratingsQuantity", "startDates", "guides")
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id;
      `;
      const tourValues = [
        tour.name,
        tour.duration,
        tour.maxGroupSize,
        tour.difficulty,
        tour.price,
        tour.summary,
        tour.description,
        tour.imageCover,
        tour.images, // Add images array
        tour.ratingsAverage,
        tour.ratingsQuantity,
        tour.startDates,
        tour.guides,
      ];
      const tourResult = await pool.query(tourQuery, tourValues);
      const tourId = tourResult.rows[0].id;

      // Insert `startLocation`
      if (tour.startLocation) {
        await insertLocation(tour.startLocation, tourId);
      }

      // Insert `locations` array
      if (tour.locations && Array.isArray(tour.locations)) {
        for (let location of tour.locations) {
          await insertLocation(location, tourId);
        }
      }
    }
    console.log('Data successfully loaded!');
  } catch (err) {
    console.error(`Error importing data: ${err.message}`);
  } finally {
    process.exit();
  }
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await pool.query('DELETE FROM public."locations"');
    await pool.query('DELETE FROM public."tours"');
    console.log('Data successfully deleted!');
  } catch (err) {
    console.error(`Error deleting data: ${err.message}`);
  } finally {
    process.exit();
  }
};

// Command-line arguments
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// console.log(process.argv);
