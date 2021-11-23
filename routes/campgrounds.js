const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");

const Campground = require("../models/campground");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  // .post(
  //   isLoggedIn,
  //   validateCampground,
  //   catchAsync(campgrounds.createCamgpround)
  // );
  .post((req, res) => {
    res.send(req.body);
  });

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(isAuthor, validateCampground, catchAsync(campgrounds.updateCamgpround))
  .delete(isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
