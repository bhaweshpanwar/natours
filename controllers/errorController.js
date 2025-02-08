const dotenv = require('dotenv');
dotenv.config({ path: './../config.env' });
const AppError = require('./../utils/appError');

const handleInvalidEnumErrorDB = (err) => {
  const message = `Invalid value: "${err}". Please provide one of the allowed values.`;
  return new AppError(message, 400, true);
};

const handleCheckConstraintErrorDB = (err) => {
  const message = `Check constraint failed for value: "${err}". Please provide a valid input.`;
  return new AppError(message, 400, true);
};

const handleUniqueConstraintErrorDB = (err) => {
  const message = `Duplicate field value: "${err}". Please use another value!`;
  return new AppError(message, 400, true);
};

handleJWTError = () => new AppError('Invalid Token.Please Log in Again', 401);

handleJWTExpiredError = () =>
  new AppError('Your Token has expired! Please log in again', 401);

// const handleCastErrorDB = (err) => {
//   const message = `Invalid ${err.path}: ${err.value}.`;
//   return new AppError(message, 400, true);
// };

/**
 * @function sendErrorDev
 * @description Sends detailed error responses during development. This function is designed
 *              to provide comprehensive error information to aid debugging.
 * @param {Error} err The error object caught by the error handler.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 * @returns {object} Returns the response object after sending error information.
 */
const sendErrorDev = (err, req, res) => {
  // Check if the request originated from an API endpoint.
  if (req.originalUrl.startsWith('/api')) {
    // If it's an API request:
    // Respond with a JSON object including detailed error information.
    // This is useful for development as it includes error stack, message, etc.
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    // Execution: This block is executed if the request URL starts with '/api'
  }
  // If it's not an API request (likely a browser request for a page):
  // Log the error to the console.
  console.log('ERROR 💥', err);
  // Render an error page with a general error message.
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong.',
    msg: err.message,
  });
  // Execution: This block is executed if the request URL does NOT start with '/api'
};

/**
 * @function sendErrorProd
 * @description Sends error responses during production. This function is designed
 *              to handle errors more gracefully and avoid exposing sensitive information
 *              to the client.
 * @param {Error} err The error object caught by the error handler.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 * @returns {object} Returns the response object after sending error information.
 */
const sendErrorProd = (err, req, res) => {
  // Check if the request originated from an API endpoint.
  if (req.originalUrl.startsWith('/api')) {
    // If it's an API request:
    // Check if the error is an operational error (expected runtime error)
    if (err.isOperational) {
      // If it's an operational error:
      // Respond with a JSON object including a less detailed error message.
      // It doesn't include stack traces etc.
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // Execution: This block is executed if the request URL starts with '/api' AND the error is operational.
    }
    // If not an operational error, log the error to the console.
    console.log('ERROR 💥', err);
    // Respond with a generic server error message for unexpected or programming errors
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
    });
    // Execution: This block is executed if the request URL starts with '/api' AND the error is NOT operational.
  }
  // If it's NOT an API request (likely a browser request for a page):
  // Check if the error is an operational error.
  if (err.isOperational) {
    // If operational error: Render an error page with a specific message
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong.',
      msg: err.message,
    });
    // Execution: This block is executed if the request URL does NOT start with '/api' and the error is operational.
  }
  //If not operational error, Log the error to the console.
  console.error('ERROR 💥', err);
  // Render a generic error page with a message for programming or unknown errors.
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong.',
    msg: 'Please try again later.',
  });
  // Execution: This block is executed if the request URL does NOT start with '/api' and the error is NOT operational.
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // Handle specific PostgreSQL error codes
    if (err.code === '23514') error = handleCheckConstraintErrorDB(err, req); // Check constraint
    if (err.code === '23505') error = handleUniqueConstraintErrorDB(err); // Unique constraint
    if (err.code === '22P02') error = handleInvalidEnumErrorDB(err); // Invalid enum cast
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // Add default operational flag if not already set
    if (!error.isOperational) {
      error = new AppError('An unexpected error occurred.', 500, false);
    }

    sendErrorProd(error, req, res);
  }
};
