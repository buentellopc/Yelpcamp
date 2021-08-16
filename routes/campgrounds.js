const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");

const Campground = require("../models/campground");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

// ** ALL CAMPGROUNDS
router.get("/", catchAsync(campgrounds.index));

// ** CREATE A CAMPGROUND

// SHOW A CAMPGROUND TO CREATE
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// POST TO HANDLE THE CREATION
router.post(
  "/",
  isLoggedIn,
  validateCampground,

  catchAsync(campgrounds.createCamgpround)
);

// ** SPECIFIC CAMPGROUND (ID)
router.get("/:id", catchAsync(campgrounds.showCampground));

// ** EDIT CAMPGROUND
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

router.put(
  "/:id",
  isAuthor,
  validateCampground,
  catchAsync(campgrounds.updateCamgpround)
);

router.delete("/:id", isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;
