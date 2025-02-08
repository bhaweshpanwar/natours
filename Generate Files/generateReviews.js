const fs = require('fs');
const csv = require('csv-parser');

// Load tutor data
const tutorTours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));
const tutorUsers = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
const tutorReviews = JSON.parse(fs.readFileSync('./reviews.json', 'utf-8'));

// Arrays for your data
const yourTours = [];
const yourUsers = [];

// Helper function to read CSV
const readCSV = (filePath, array) => {
  return new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => array.push(data))
      .on('end', resolve);
  });
};

(async () => {
  await readCSV('./tours.csv', yourTours);
  await readCSV('./users.csv', yourUsers);

  // Create mappings from names to UUIDs
  const yourTourMap = yourTours.reduce((map, tour) => {
    map[tour.name] = tour.id; // Assuming 'id' is the UUID
    return map;
  }, {});

  const yourUserMap = yourUsers.reduce((map, user) => {
    map[user.name] = user.id; // Assuming 'id' is the UUID
    return map;
  }, {});

  // Map reviews with your UUIDs
  const changedReviews = tutorReviews
    .map((review) => {
      // Find user and tour details
      const userDetails = tutorUsers.find((user) => user._id === review.user);
      const tourDetails = tutorTours.find((tour) => tour._id === review.tour);

      const yourUserId = userDetails ? yourUserMap[userDetails.name] : null;
      const yourTourId = tourDetails ? yourTourMap[tourDetails.name] : null;

      // Include only if both UUIDs are found
      if (yourUserId && yourTourId) {
        return {
          user_id: yourUserId,
          tour_id: yourTourId,
          review: review.review,
          rating: review.rating,
        };
      }
      return null;
    })
    .filter(Boolean); // Remove null entries

  // Write to JSON
  fs.writeFileSync(
    'mapped_reviews.json',
    JSON.stringify(changedReviews, null, 2)
  );
  console.log('Mapped reviews JSON file created successfully!');
})();
