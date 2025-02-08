const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const pool = require('./../db');
const { getOne } = require('./../controllers/handleFactory');

/*const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});*/

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

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)
    .then(() => next())
    .catch((err) => next(new AppError('Error processing image', 500)));
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  let query = 'SELECT * FROM users_safe;';
  const result = await pool.query(query);

  if (result.rows.length === 0) {
    return next(new AppError('No data found on the requested page', 404));
  }

  res.status(200).json({
    status: 'success',
    result: result.rows.length,
    // totalRecords,
    // totalPages,
    data: result.rows,
  });
});

// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'Route not defined yet!',
//   });
// };

exports.getUser = getOne('users');

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Route not defined yet!',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'Route not defined yet!',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'Route not defined yet!',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);

  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword.',
        400
      )
    );
  }

  // 2) Filter out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'email', 'name', 'photo');
  if (req.file) filteredBody.photo = req.file.filename;

  if (Object.keys(filteredBody).length === 0) {
    return next(new AppError('No valid fields to update.', 400));
  }

  const columns = Object.keys(filteredBody);
  let values = Object.values(filteredBody);
  values.push(req.user.id); // Add user ID for the WHERE clause

  const setClause = columns
    .map((field, index) => `"${field}" = $${index + 1}`)
    .join(', ');

  // 3) Update user document
  const query = `UPDATE public."users" SET ${setClause} WHERE id = $${
    columns.length + 1
  } RETURNING name,email,id,role,photo ;`;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    return next(new AppError('User not found.', 404));
  }

  const updatedUser = result.rows[0];

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const query = `UPDATE public."users" SET active = false WHERE id = $1 RETURNING *;`;
  const result = await pool.query(query, [req.user.id]);

  if (result.rowCount === 0) {
    return next(new AppError('User not found or already deleted.', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
