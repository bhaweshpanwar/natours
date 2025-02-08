const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('./../utils/catchAsync');
// const pool = require('./../db');
const User = require('../models/userModel');
const AppError = require('./../utils/appError');
const createPasswordResetToken = require('./../utils/tokenUtils');
const changedPasswordAfter = require('./../utils/authUtils');
const Email = require('./../utils/email');
const pool = require('../db');
const { userSchema } = require('./../validations/userValidations');

const createSendToken = (user, statusCode, res, sendUserData = true) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('V3wD5zX9pA6nQ4', token, cookieOptions);
  const response = {
    status: 'success',
  };

  // Include user data only if sendUserData is true
  if (sendUserData) {
    response.data = { user };
  }

  res.status(statusCode).json(response);
};

exports.signup = catchAsync(async (req, res, next) => {
  // Ensure passwords match
  if (req.body.password !== req.body.passwordConfirm) {
    throw new Error('Passwords do not match');
  }
  // 1) Validate the input data
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    return next(new Error(`Validation error: ${error.details[0].message}`));
  }

  // 2) Extract validated fields
  const { name, email, password } = value;

  // Hash the password and passwordConfirm
  const hashedPassword = await bcrypt.hash(password, 12);

  // Update req.body with hashed values for password and passwordConfirm
  //   const updatedBody = {
  //     ...otherFields,
  //     password: hashedPassword,
  //     passwordConfirm: hashedPassword,
  //   };

  //   // Dynamically generate columns and values for the query
  //   const columns = Object.keys(updatedBody).map((col) => `"${col}"`);
  //   const values = Object.values(updatedBody);
  //   const placeholders = values.map((_, index) => `$${index + 1}`);

  //   const query = `
  //     INSERT INTO public."users" (${columns.join(', ')})
  //     VALUES (${placeholders.join(', ')})
  //     RETURNING *;
  //   `;

  //   const query = `
  //     INSERT INTO public."users" ("name", "email", "password", "passwordConfirm", "role")
  //     VALUES ($1, $2, $3, $3, 'user')
  //     RETURNING "id", "name", "email", "role";
  // `;
  //   const values = [name, email, hashedPassword];

  //   // Execute the query
  //   const result = await pool.query(query, values);

  const result = await User.createUser({
    name,
    email,
    password: hashedPassword,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(result, url).sendWelcome();

  createSendToken(result, 201, res);

  // // Generate JWT token
  // const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  // });

  // // Respond with success
  // res.status(201).json({
  //   message: 'User Created Successfully',
  //   token,
  //   data: { user: result.rows[0] },
  // });
});

/*app.post('/api/v1/login', verifyRequest, async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM public."Customer" WHERE c_username = $1;`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'failure',
        message: 'Invalid username or password',
        data: null,
        errorCode: 'USER_NOT_FOUND',
      });
    }

    const user = result.rows[0];
    const isPasswordValid = password === user.c_password;
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'failure',
        message: 'Invalid username or password',
        data: null,
        errorCode: 'WRONG_PASSWORD',
      });
    }

    const token = 'JWT_HERE';

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token: token,
      },
      errorCode: null,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Please Try Again Later' });
  }
});*/

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect Credentials', 404));
  }

  createSendToken(user, 200, res, false);
});

exports.logout = (req, res) => {
  res.cookie('V3wD5zX9pA6nQ4', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // console.log(req.headers);

  //1.Getting token and check of its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.V3wD5zX9pA6nQ4) {
    token = req.cookies.V3wD5zX9pA6nQ4;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }

  //2.Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //3.Check if user still exists
  const currentUser = await User.findUserById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (changedPasswordAfter(currentUser.password_changed_at, decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Find user by email
  const user = await User.findUserByEmail(req.body.email);
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // 2) Generate reset token
  const { resetToken, hashedToken, expirationTime } =
    createPasswordResetToken();

  console.log({ resetToken, hashedToken, expirationTime });

  // 3) Update the database with the hashed token and expiration time
  const updatedUser = await User.updatePasswordResetToken(
    user.id,
    hashedToken,
    expirationTime
  );

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your Password Reset Link! Valid for 10 minute only',
    //   message,
    // });

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    console.log(error);

    const updatedUser = await User.updatePasswordResetToken(
      user.id,
      null,
      null
    );
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const query = `SELECT id, email, name FROM public."users" WHERE password_reset_token = $1 AND password_reset_expires > NOW() AND active = true;`;
  const result = await pool.query(query, [resetToken]);

  if (result.rowCount === 0) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  const user = result.rows[0];

  console.log(req.body.password, req.body.passwordConfirm);

  // Ensure passwords match
  if (req.body.password !== req.body.passwordConfirm) {
    throw new Error('Passwords do not match');
  }

  // Hash the password and passwordConfirm
  const hashedPassword = await bcrypt.hash(req.body.password, 12);

  // Update the user's password and clear the reset token and expiration
  const updateQuery = `
      UPDATE public."users"
      SET password = $1, "passwordConfirm" = $1,
          password_reset_token = NULL,
          password_reset_expires = NULL
      WHERE id = $2 AND active = true
    `;
  const updateValues = [hashedPassword, user.id];
  await pool.query(updateQuery, updateValues);

  createSendToken(user, 200, res, false);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // // 1. Get the token from headers
  // let token;
  // if (
  //   req.headers.authorization &&
  //   req.headers.authorization.startsWith('Bearer')
  // ) {
  //   token = req.headers.authorization.split(' ')[1];
  // }
  // if (!token) {
  //   return next(
  //     new AppError('You are not logged in! Please log in to get access.', 401)
  //   );
  // }

  // // 2. Verify the token
  // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // // 3. Check if the user still exists
  // const currentUser = await User.findUserById(decoded.id);
  // if (!currentUser) {
  //   return next(
  //     new AppError(
  //       'The user belonging to this token does no longer exist.',
  //       401
  //     )
  //   );
  // }

  const currentUser = req.user;
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  // 4. Validate the passwords
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return next(
      new AppError('Please provide both current and new password!', 400)
    );
  }

  if (newPassword !== newPasswordConfirm) {
    return next(new AppError('New Passwords do not match', 400));
  }

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    currentUser.password
  );
  console.log(isPasswordCorrect);

  if (!isPasswordCorrect) {
    return next(new AppError('Wrong old password.', 401));
  }

  // 5. Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // 6. Update the password in the database
  const updateQuery = `
    UPDATE public."users"
    SET password = $1 , "passwordConfirm" = $1
    WHERE id = $2 AND active = true
  `;
  const updateValues = [hashedPassword, currentUser.id];
  await pool.query(updateQuery, updateValues);

  // 7. Send a new token to the user
  createSendToken(currentUser, 200, res, false);
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.V3wD5zX9pA6nQ4) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.V3wD5zX9pA6nQ4,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findUserById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (changedPasswordAfter(currentUser.password_changed_at, decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
