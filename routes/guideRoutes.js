const express = require('express');
const guideController = require('./../controllers/guideController');
const authController = require('./../controllers/authController');
const router = express.Router();

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    guideController.addGuideToTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    guideController.removeGuideFromTour
  );

module.exports = router;
