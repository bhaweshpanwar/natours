const pool = require('./../db');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const {
  deleteOne,
  updateOne,
  getOne,
} = require('./../controllers/handleFactory');

exports.createReview = catchAsync(async (req, res, next) => {
  // Ensure `tour` and `user` fields are set from URL params and request user
  const {
    tour: tourId = req.params.tourId || req.body.tourId,
    user: userId = req.user.id,
    review,
    rating,
  } = req.body;

  // console.log({ tourId, userId, review, rating });

  // Validate required fields and rating range
  if (!review || !rating || !tourId || !userId) {
    return next(
      new AppError(
        'Missing required fields: review, rating, tourId, or userId.',
        400
      )
    );
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return next(new AppError('Rating must be a number between 1 and 5.', 400));
  }

  // Insert review into database.
  const query = `
    INSERT INTO public."reviews" (review, rating, tour_id, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [review, rating, tourId, userId];
  const result = await pool.query(query, values);

  // Respond to client with created review
  res.status(201).json({
    status: 'success',
    data: result.rows[0],
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;

  // Base query
  let query = `
    SELECT 
      r.id AS review_id, 
      r.review, 
      r.rating, 
      jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'durationWeeks', t.duration,
        'guides', COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', u.id,
              'name', u.name
            )
          ) FILTER (WHERE u.id IS NOT NULL), '[]'::jsonb
        )
      ) AS tour,
      jsonb_build_object(
        'id', user_t.id,
        'name', user_t.name,
        'photo', user_t.photo
      ) AS user
    FROM 
      public."reviews" r
    LEFT JOIN 
      public."tours" t ON r.tour_id = t.id
    LEFT JOIN 
      public."tour_guides" tg ON tg.tour_id = t.id
    LEFT JOIN 
      public."users" u ON tg.guide_id = u.id
    LEFT JOIN 
      public."users" user_t ON r.user_id = user_t.id
  `;

  // Add WHERE clause if tourId is provided
  if (tourId) {
    query += ` WHERE r.tour_id = $1 `;
  }

  // Add GROUP BY and ORDER BY clauses
  query += `
    GROUP BY 
      r.id, t.id, user_t.id
    ORDER BY 
      r."createdAt" DESC;
  `;

  // Execute the query with or without tourId as a parameter
  const result = tourId
    ? await pool.query(query, [tourId]) // Pass tourId as a parameter
    : await pool.query(query); // No parameters needed

  // Send the response
  res.status(200).json({
    status: 'success',
    data: result.rows,
  });
});

//////////////////////
// Using factory functions
exports.deleteReview = deleteOne('reviews');
exports.updateReview = updateOne('reviews');
exports.getReview = getOne('reviews');
