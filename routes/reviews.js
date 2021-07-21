const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const { reviewSchema } = require("../schemas");

const ExpressError = require("../utils/ExpressError");
const Review = require("../models/review");
const Campground = require("../models/campground");

const validateReview = (req, res, next) => {
  // console.log(req.body);
  const { error } = reviewSchema.validate(req.body);
  // const obj = reviewSchema.validate(req.body);
  // console.log("full object", obj);
  // console.log("error part", error);
  if (error) {
    // console.log(error.details);
    console.log(error.details[0].message);
    const msg = error.details[0].message;
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// ? Reviews route
router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Succesfully created a review!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Succesfully deleted a review!");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
