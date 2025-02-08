const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const pool = require('./../db');
const APIFeatures = require('./../utils/apiFeatures');
const { getTourById } = require('../controllers/tourController');

// const { getAllTours } = require('./../controllers/tourController');

// exports.getOverview = catchAsync(async (req, res, next) => {
//   const tours = await getAllTours(req, res, next);
//   if (tours && tours.length > 0) {
//     console.log('Fetched Tours:', tours);
//     res.status(200).render('overview', { title: 'All Tours', tours });
//   } else {
//     return next(new AppError('No tours found', 404));
//   }
// });

exports.getOverview = catchAsync(async (req, res, next) => {
  const baseQuery = `
    SELECT
       t.*,
       sl.description AS start_location_description,
       sl.coordinates AS start_location_coordinates,
       json_agg(DISTINCT jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email,
        'image', u.photo
       )) AS guides,
     json_agg(DISTINCT l.*) AS locations
    FROM
    public."tours" t
    LEFT JOIN
    public."locations" sl ON t.start_location_id = sl.id
    LEFT JOIN
    public."locations" l ON l.tours_id = t.id AND l.id != t.start_location_id
    LEFT JOIN
    public."tour_guides" tg ON tg.tour_id = t.id
    LEFT JOIN
    public."users" u ON tg.guide_id = u.id
`;
  const features = new APIFeatures(baseQuery, req.query)
    .limitFields()
    .filter()
    .groupBy()
    .sort()
    .paginate();

  const result = await pool.query(features.query, features.queryParams);

  res.status(200).render('overview', {
    title: 'All Tours',
    tours: result.rows,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const query = `
  SELECT 
    t.*, 
    sl.description AS start_location_description, 
    ST_X(sl.coordinates::geometry) AS start_location_longitude,
    ST_Y(sl.coordinates::geometry) AS start_location_latitude, 
    COALESCE(
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'image', u.photo
        )
      ) FILTER (WHERE u.id IS NOT NULL), 
      '[]'::jsonb
    ) AS guides, 
    COALESCE(
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'id', l.id,
          'description', l.description,
		  'latitude', ST_Y(l.coordinates::geometry),
		  'longitude', ST_X(l.coordinates::geometry)
        )
      ) FILTER (WHERE l.id IS NOT NULL), 
      '[]'::jsonb
    ) AS locations, 
    COALESCE(
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'id', r.id,
          'review', r.review,
          'rating', r.rating,
          'user', jsonb_build_object(
            'id', ur.id,
            'name', ur.name,
            'email', ur.email,
            'photo',ur.photo
          ),
          'createdAt', r."createdAt"
        )
      ) FILTER (WHERE r.id IS NOT NULL), 
      '[]'::jsonb
    ) AS reviews
  FROM 
    public."tours" t 
  LEFT JOIN 
    public."locations" sl ON t.start_location_id = sl.id 
  LEFT JOIN 
    public."locations" l ON l.tours_id = t.id 
 LEFT JOIN 
    public."tour_guides" tg ON tg.tour_id = t.id
  LEFT JOIN 
    public."users" u ON tg.guide_id = u.id 
  LEFT JOIN 
    public."reviews" r ON r.tour_id = t.id 
  LEFT JOIN 
    public."users" ur ON r.user_id = ur.id 
  WHERE 
    t.slug = $1 
  GROUP BY 
    t.id, sl.description, sl.coordinates;
  `;

  const result = await pool.query(query, [slug]);
  if (result.rowCount === 0) {
    return next(
      new AppError('The tour you are looking for does not exist.', 404)
    );
  }

  const tour = result.rows[0];

  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Fetch all bookings for the logged-in user
  const bookingQuery = `
    SELECT tour_id FROM bookings WHERE user_id = $1;
  `;
  const bookings = await pool.query(bookingQuery, [req.user.id]);

  if (bookings.rows.length === 0) {
    return res.status(200).render('overview', {
      title: 'My Tours',
      tours: [],
    });
  }

  // 2) Extract tour IDs
  const tourIDs = bookings.rows.map((b) => b.tour_id);

  // 3) Fetch tour details using getTourById
  const tours = await Promise.all(
    tourIDs.map(async (id) => {
      return await getTourById(id);
    })
  );

  // 4) Render the overview page with tour data
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.getLogin = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: `Login`,
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // 1.  Basic sanitation: Trim and validate email (basic example)
  let name = req.body.name ? req.body.name.trim() : null;
  let email = req.body.email ? req.body.email.trim() : null;
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new AppError('Invalid email format.', 400));
    }
  }

  // Build the update object only with the values provided in the request
  const updates = {};
  if (name) {
    updates.name = name;
  }
  if (email) {
    updates.email = email;
  }

  if (Object.keys(updates).length === 0) {
    // If no values are provided, then don't run the query
    return next(new AppError('No valid values to update.', 400));
  }
  const columns = Object.keys(updates);
  const values = Object.values(updates);

  const setClause = columns
    .map((field, index) => `"${field}" = $${index + 1}`)
    .join(', ');

  const query = `UPDATE public."users" SET ${setClause} WHERE id = $${
    columns.length + 1
  } RETURNING name,email,id,role,photo;`;
  values.push(userId);

  const updatedUser = await pool.query(query, values);

  if (updatedUser.rows.length === 0) {
    return next(new AppError('User not found.', 404));
  }

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser.rows[0], // render only the first updated user if there are many returned
  });
});
