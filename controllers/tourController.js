const validator = require('validator');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const pool = require('./../db');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

// upload.single('image') req.file
// upload.array('images', 5) req.files

// const { deleteOne } = require('./../controllers/handleFactory');
/*const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

exports.checkCreateTourCredentials = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(500).json({
      status: 'fail',
      message: 'Invalid Credentials:Name or Price Missing ',
    });
  }
  next();
};*/

/*exports.getAllTours = async (req, res) => {
  const conditionsObject = { ...req.query };


  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete conditionsObject[el]);


  let query = `SELECT * FROM public."tours"`;
  let queryParams = [];
  if (Object.keys(conditionsObject).length > 0) {
    const whereClauses = Object.keys(conditionsObject).map((key, index) => {
      queryParams.push(conditionsObject[key]);
      return `${key} = $${index + 1}`;
    });

    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  try {
    const result = await pool.query(query, queryParams);
    res.status(201).json({
      status: 'success',
      result: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error');
    res.status(404).json({ error: error.detail });
  }
};*/

exports.aliasTopFields = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  /*const conditionsObject = { ...req.query };

  // Exclude non-filtering fields
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete conditionsObject[el]);

  let query = `SELECT * FROM public."tours"`;
  let queryParams = [];

  // Filtering
  if (Object.keys(conditionsObject).length > 0) {
    const operators = ['>', '>=', '<', '<='];
    const whereClauses = [];

    Object.keys(conditionsObject).forEach((key, index) => {
      let value = conditionsObject[key];
      let operator = '=';
      let field = key;

      // Check if the value contains an operator
      for (let op of operators) {
        if (value.startsWith(op)) {
          operator = op;
          value = value.slice(op.length).trim(); // Extract the numeric part
          break;
        }
      }

      // Add the clause and parameter
      whereClauses.push(`${field} ${operator} $${index + 1}`);
      queryParams.push(value);
    });

    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').map((field) => {
      if (field.startsWith('-')) {
        return `"${field.slice(1)}" DESC`; // Sort descending
      }
      return `"${field}" ASC`; // Sort ascending
    });
    query += ` ORDER BY ${sortBy.join(', ')}`;
  }

  // Field Limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').map((field) => field.trim());
    const selectFields = fields
      .filter((field) => !field.startsWith('-'))
      .map((field) => `"${field}"`)
      .join(', ');
    const excludeFields = fields
      .filter((field) => field.startsWith('-'))
      .map((field) => field.slice(1).trim());
    const allFields = [
      'id',
      'name',
      'rating',
      'price',
      'maxGroupSize',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'priceDiscount',
      'summary',
      'description',
      'imageCover',
      'images',
      'duration',
    ].map((field) => `"${field}"`);
    const includedFields = allFields.filter(
      (field) => !excludeFields.includes(field.replace(/"/g, ''))
    );
    const selectClause = selectFields || includedFields.join(', ');
    query = query.replace('*', selectClause);
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const offset = (page - 1) * limit;*/

  //   const query = `
  //   SELECT
  //     t.*,
  //     sl.description AS start_location_description,
  //     sl.coordinates AS start_location_coordinates,
  //     json_agg(l.*) AS locations
  //   FROM
  //     public."tours" t
  //   LEFT JOIN
  //     public."locations" sl ON t.start_location_id = sl.id
  //   LEFT JOIN
  //     public."locations" l ON l.tours_id = t.id AND l.id != t.start_location_id
  //   GROUP BY
  //     t.id, sl.description, sl.coordinates
  // `;

  /*const query = 'SELECT * FROM public."tours"';
  const features = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  console.log(features.query, features.queryParams);

  const result = await pool.query(features.query, features.queryParams);*/

  //   const baseQuery = `
  //   SELECT
  //     t.*,
  //     sl.description AS start_location_description,
  //     sl.coordinates AS start_location_coordinates,
  //     json_agg(l.*) AS locations
  //   FROM
  //     public."tours" t
  //   LEFT JOIN
  //     public."locations" sl ON t.start_location_id = sl.id
  //   LEFT JOIN
  //     public."locations" l ON l.tours_id = t.id AND l.id != t.start_location_id
  //   LEFT JOIN
  //     public."tour_guides" tg ON tg.tour_id = t.id
  // `;
  ////////////////////////////////////////////////////////////////

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
  // console.log('Req Query', req.query);
  const features = new APIFeatures(baseQuery, req.query)
    .limitFields()
    .filter()
    .groupBy()
    .sort()
    .paginate();

  console.log(features.query, features.queryParams);

  const result = await pool.query(features.query, features.queryParams);

  ////////////////////////////////////////////////////////////////
  // try {
  // const countQuery = `SELECT COUNT(*) FROM public."tours"`;
  // const countResult = await pool.query(countQuery);
  // const totalRecords = parseInt(countResult.rows[0].count, 10);
  // const totalPages = Math.ceil(totalRecords / (req.query.limit || 100));

  // // Validate if the requested page exceeds total pages
  // if (page > totalPages) {
  //   return res.status(400).json({
  //     status: 'fail',
  //     message: 'Page number exceeds total number of pages',
  //   });
  // }
  // console.log('Constructed Query:', features.query);
  // console.log('Query Parameters:', features.queryParams);
  // const result = await pool.query(features.query, features.queryParams);
  // const result = await pool.query(query);

  // // Apply LIMIT and OFFSET to the filtered query
  // query += ` LIMIT $${queryParams.length + 1} OFFSET $${
  //   queryParams.length + 2
  // }`;
  // queryParams.push(limit, offset);

  // const result = await pool.query(query, queryParams);

  ////////////////////////////////////////////////////////////////
  if (result.rows.length === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'No data found on the requested page',
    });
  }

  res.status(200).json({
    status: 'success',
    result: result.rows.length,
    // totalRecords,
    // totalPages,
    data: result.rows,
  });
  ////////////////////////////////////////////////////////////////////

  // } catch (error) {
  //   console.error('Error:', error);
  //   res.status(500).json({
  //     status: 'error',
  //     message: 'An error occurred while retrieving the tours',
  //   });
  // }
});

// exports.getTour = catchAsync(async (req, res, next) => {
//   // try {

//   console.log('Function getTour is called');
//   console.log('ID:', req.params.id);

//   const query = `SELECT * FROM public."tours" WHERE id = '${req.params.id}';`;
//   console.log('Executing query:', query);

//   const result = await pool.query(query);

//   console.log('Result rows length:', result.rows.length);

//   if (!result.rows.length) {
//     return next(new AppError('Invalid ID', 404)); // Invalid ID if no rows
//   }

//   res.status(201).json({
//     status: 'success',
//     data: result.rows,
//   });
//   // } catch (error) {
//   //   console.error('Error', error);
//   //   res.status(404).json({ error: error.detail });
//   // }
// });

exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Validate the ID format
  if (!validator.isUUID(id)) {
    return next(
      new AppError('Invalid ID format. Please provide a valid UUID.', 400)
    );
  }

  // Query to fetch the specific tour with joins
  const query = `
SELECT 
  t.*, 
  sl.description AS start_location_description, 
  sl.coordinates AS start_location_coordinates, 
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
  jsonb_agg(
    DISTINCT l.*
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
          'email', ur.email
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
  public."locations" l ON l.tours_id = t.id AND l.id != t.start_location_id 
LEFT JOIN 
  public."tour_guides" tg ON tg.tour_id = t.id 
LEFT JOIN 
  public."users" u ON tg.guide_id = u.id 
LEFT JOIN 
  public."reviews" r ON r.tour_id = t.id 
LEFT JOIN 
  public."users" ur ON r.user_id = ur.id 
WHERE 
  t.id = $1 
GROUP BY 
  t.id, sl.description, sl.coordinates;

  `;

  // Execute parameterized query
  const result = await pool.query(query, [id]);

  // Handle no results
  if (!result.rows.length) {
    return next(new AppError('Invalid ID. Tour not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: result.rows[0], // Single tour result
  });
});

exports.getTourById = async (id) => {
  // Validate the ID format
  if (!validator.isUUID(id)) {
    throw new AppError('Invalid ID format. Please provide a valid UUID.', 400);
  }

  const query = ` 
  SELECT 
    t.*, 
    sl.description AS start_location_description, 
    sl.coordinates AS start_location_coordinates, 
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
    jsonb_agg(
      DISTINCT l.*
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
            'email', ur.email
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
    public."locations" l ON l.tours_id = t.id AND l.id != t.start_location_id 
  LEFT JOIN 
    public."tour_guides" tg ON tg.tour_id = t.id 
  LEFT JOIN 
    public."users" u ON tg.guide_id = u.id 
  LEFT JOIN 
    public."reviews" r ON r.tour_id = t.id 
  LEFT JOIN 
    public."users" ur ON r.user_id = ur.id 
  WHERE 
    t.id = $1 
  GROUP BY 
    t.id, sl.description, sl.coordinates;
  `;

  const result = await pool.query(query, [id]);

  if (!result.rows.length) {
    throw new AppError('Invalid ID. Tour not found.', 404);
  }

  return result.rows[0]; // Return the tour data instead of sending a response
};

/*
if(req.query.sort) {
const sortBy = req.query.sort.split(,).join(' ');
query = query.sort(sortBy)
} else {
 query = query.sort('-createdAt)
 }
}
 */

/*exports.createTour = async (req, res) => {
  if (!req.body.rating) {
    req.body.rating = 4.5;
  }

  let { name, rating, price } = req.body;
  // Validate and convert input
  price = parseInt(price, 10);
  rating = parseFloat(rating);
  try {
    const query = `INSERT INTO public."tours" (name,rating,price) VALUES ($1,$2,$3) RETURNING *;`;
    const values = [name, rating, price];

    const result = await pool.query(query, values);
    res.status(201).json({
      message: 'Tour created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating Tour');
    res.status(500).json({ error: error.detail });
  }
};*/

exports.createTour = catchAsync(async (req, res, next) => {
  if (!req.body.rating) req.body.rating = 4.5;

  const columns = Object.keys(req.body).map((col) => `"${col}"`);

  const values = Object.values(req.body);

  const placeholders = columns.map((_, index) => `$${index + 1}`);

  const query = `
    INSERT INTO public."tours" (${columns.join(',')}) 
    VALUES (${placeholders.join(',')}) 
    RETURNING *;
  `;

  // try {
  const result = await pool.query(query, values);

  res.status(201).json({
    message: 'Tour created successfully',
    data: result.rows[0],
  });
  // } catch (error) {
  //   console.error('Error creating Tour', error);
  //   res.status(500).json({ error: error.detail });
  // }
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params; // Tour ID
  const updates = req.body; // Updated fields

  // Check if 'guides' field is in the request body
  if (updates.guides) {
    return next(
      new AppError('To update tour guides, use the /guides route', 400)
    );
  }

  const fields = Object.keys(updates);
  const values = Object.values(updates);
  values.push(id); // Add the ID as the last parameter

  const setClause = fields
    .map((field, index) => `"${field}" = $${index + 1}`)
    .join(', ');

  if (fields.length > 0) {
    const query = `UPDATE public."tours" SET ${setClause} WHERE id = $${
      fields.length + 1
    } RETURNING *;`;

    // Execute the query
    const result = await pool.query(query, values);

    if (!result) {
      return next(new AppError('Invalid ID', 404));
    }

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No tour found with the given ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: result.rows[0],
      },
    });
  } else {
    return next(new AppError('No updates provided', 400));
  }
});

//////////////////////
/////////////////////NEW DELETE METHOD
// exports.deleteTour = deleteOne('tours');

exports.deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Delete references first if needed
  await pool.query('DELETE FROM public."locations" WHERE id = $1', [id]);

  // Then delete the tour
  const result = await pool.query('DELETE FROM public."tours" WHERE id = $1', [
    id,
  ]);

  if (result.rowCount === 0) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//////////////////////
/////////////////////OLD DELETE METHOD
/*exports.deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  // try {
  const query = `DELETE FROM public."tours" WHERE id = '${id}'`;
  const result = await pool.query(query);

  if (!result) {
    return new AppError('Invalid ID', 404);
  }

  res.status(200).json({
    status: 'success',
    data: `Successfully Deleted Record with ID:${id}`,
  });
  // } catch (error) {
  //   console.error('Error deleting tour:', error.message);
  //   res.status(500).json({
  //     status: 'error',
  //     message: 'An error occurred while deleting the tour',
  //   });
  // }
});*/

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  //Convert distance to meters
  const radius = unit === 'mi' ? distance * 1609.34 : distance * 1000;
  // const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const query = `
  SELECT t.id AS tour_id, t.name AS tour_name, 
       l.description AS location_description, 
       ST_AsText(l.coordinates) AS coordinates
  FROM locations l
  JOIN tours t ON l.tours_id = t.id
  WHERE ST_DWithin(
    l.coordinates,
    ST_SetSRID(ST_MakePoint($1, $2), 4326),
    $3
);

  `;

  const { rows } = await pool.query(query, [lng, lat, radius]);

  res.status(200).json({
    status: 'success',
    results: rows.length,
    data: rows,
  });
});

// Get Distances
exports.getDistances = async (req, res, next) => {
  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    // Set multiplier for unit conversion
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    const query = `
    SELECT 
        t.id AS tour_id, 
        t.name AS tour_name, 
        MIN(ST_Distance(
            l.coordinates,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)
        )) * $3 AS distance
    FROM locations l
    JOIN tours t ON l.tours_id = t.id
    GROUP BY t.id, t.name
    ORDER BY distance;
    `;

    const { rows } = await pool.query(query, [lng, lat, multiplier]);

    res.status(200).json({
      status: 'success',
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const query = `
      SELECT 
        UPPER(difficulty::text) AS difficulty,
        COUNT(*) AS "numTours",
        SUM("ratingsQuantity") AS "numRatings",
        AVG("ratingsAverage") AS "avgRating",
        AVG(price) AS "avgPrice",
        MIN(price) AS "minPrice",
        MAX(price) AS "maxPrice"
      FROM public."tours"
      WHERE "ratingsAverage" >= 4.5
      GROUP BY UPPER(difficulty::text)
      ORDER BY "avgPrice" ASC
    `;

  const result = await pool.query(query);

  res.status(200).json({
    status: 'success',
    data: {
      stats: result.rows,
    },
  });
  // } catch (err) {
  //   console.error('Error:', err);
  //   res.status(404).json({
  //     status: 'fail',
  //     message: 'An error occurred while retrieving tour stats',
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1;

  const query = `
    WITH tour_months AS (
    SELECT 
    DATE_TRUNC('month', start_date::timestamp) AS month,
    name
    FROM public."tours", UNNEST("startDates") AS start_date
    WHERE start_date::timestamp BETWEEN DATE '${year}-01-01' AND DATE '${year}-12-31'
    )
    SELECT 
    EXTRACT(MONTH FROM month) AS month,
    COUNT(*) AS "numTourStarts",
    ARRAY_AGG(name) AS "tours"
    FROM tour_months
    GROUP BY month
    ORDER BY "numTourStarts" DESC
    LIMIT 12;
    `;

  const result = await pool.query(query);

  res.status(200).json({
    status: 'success',
    data: {
      plan: result.rows,
    },
  });
  // } catch (err) {
  //   console.error('Error:', err);
  //   res.status(404).json({
  //     status: 'fail',
  //     message: 'An error occurred while retrieving the monthly plan',
  //   });
  // }
});
