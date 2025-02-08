const fs = require('fs');
const csv = require('csv-parser'); // Install this package using `npm install csv-parser`

// Load tutor data
const tutorTours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));
const tutorUsers = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));

// Read CSV files for your data
const yourTours = [];
const yourUsers = [];

// Helper function to read CSV
const readCSV = (filePath, array) => {
  return new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => array.push(row))
      .on('end', resolve);
  });
};

(async () => {
  await readCSV('./tours.csv', yourTours);
  await readCSV('./users.csv', yourUsers);

  // Map your data by name for easy lookup
  const yourTourMap = yourTours.reduce((map, tour) => {
    map[tour.name] = tour.id; // Assuming 'id' is your tour UUID
    return map;
  }, {});

  const yourUserMap = yourUsers.reduce((map, user) => {
    map[user.name] = user.id; // Assuming 'id' is your user UUID
    return map;
  }, {});

  // Create tour-guides mapping
  const tourGuides = [];

  tutorTours.forEach((tour) => {
    const tourName = tour.name;
    const yourTourId = yourTourMap[tourName];

    tour.guides.forEach((guideId) => {
      const guide = tutorUsers.find((user) => user._id === guideId);
      if (guide) {
        const guideName = guide.name;
        const yourGuideId = yourUserMap[guideName];

        if (yourTourId && yourGuideId) {
          tourGuides.push({
            tour_id: yourTourId,
            guide_id: yourGuideId,
            tour_name: tourName,
            guide_name: guideName,
          });
        }
      }
    });
  });

  // Save the result as JSON
  fs.writeFileSync(
    'mapped_tour_guides.json',
    JSON.stringify(tourGuides, null, 2)
  );
  console.log('Mapped tour-guides JSON file created successfully!');
})();
