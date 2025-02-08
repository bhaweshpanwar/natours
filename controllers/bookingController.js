const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('./../utils/catchAsync');
const tourController = require('./../controllers/tourController');
const pool = require('../db');
const factory = require('./handleFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1️⃣ Get the current tour
  const tour = await tourController.getTourById(req.params.tourId);

  // 2️⃣ Create Payment session
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ['card'],
  //   //
  //   success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
  //     req.params.tourId
  //   }&user=${req.user.id}&price=${tour.price}`,
  //   //
  //   cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
  //   //
  //   customer_email: req.user.email,
  //   client_reference_id: req.params.tourId,
  //   line_items: [
  //     {
  //       name: `${tour.name} Tour`,
  //       description: tour.summery,
  //       images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
  //       amount: tour.price * 100,
  //       currency: 'usd',
  //       quantity: 1,
  //     },
  //   ],
  // });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, // Stripe uses the smallest currency unit
          product_data: {
            name: tour.name,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });

  // 3️⃣ Send response to user
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  await pool.query(
    `INSERT INTO bookings (tour_id, user_id, price) VALUES ($1, $2, $3) RETURNING *`,
    [tour, user, price]
  );

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne('bookings');
exports.getBooking = factory.getOne('bookings');
exports.getAllBookings = factory.getAll('bookings');
exports.updateBooking = factory.updateOne('bookings');
exports.deleteBooking = factory.deleteOne('bookings');
