const AppError = require('../utils/appError');
const pool = require('./../db');
const catchAsync = require('./../utils/catchAsync');

exports.addGuideToTour = catchAsync(async (req, res, next) => {
  const { tourId, guideId } = req.body;
  // console.log(tourId, guideId);

  const query = `
      INSERT INTO public."tour_guides" (tour_id, guide_id) 
      VALUES ($1, $2)
      ON CONFLICT (tour_id, guide_id) DO NOTHING;
    `;

  await pool.query(query, [tourId, guideId]);

  res.status(201).json({
    status: 'success',
    message: 'Guide added to the tour successfully',
  });
});

exports.removeGuideFromTour = catchAsync(async (req, res, next) => {
  const { tourId, guideId } = req.body;

  const query = `
      DELETE FROM public."tour_guides" 
      WHERE tour_id = $1 AND guide_id = $2;
    `;

  await pool.query(query, [tourId, guideId]);

  res.status(200).json({
    status: 'success',
    message: 'Guide removed from the tour successfully',
  });
});
