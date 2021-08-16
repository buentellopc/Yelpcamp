const express = require("express");
const router = express.Router({ mergeParams: true });
const reviews = require("../controllers/reviews");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware");

const Review = require("../models/review");
const Campground = require("../models/campground");

// ? Reviews route
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,

  catchAsync(reviews.deleteReview)
);

module.exports = router;
