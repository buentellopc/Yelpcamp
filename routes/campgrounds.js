const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { campgroundSchema, reviewSchema } = require("../schemas");

const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  // console.log(result);
  // console.log(error);
  if (error) {
    // console.log(error.details);
    // console.log(error.details[0].message);
    const msg = error.details[0].message;
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// ** ALL CAMPGROUNDS
router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

// ** CREATE A CAMPGROUND

// SHOW A CAMPGROUND TO CREATE
router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});

// POST TO HANDLE THE CREATION
router.post(
  "/",
  validateCampground,

  catchAsync(async (req, res, next) => {
    // if (!req.body.campground) {
    //   throw new ExpressError("Invalid Campground Data (post)", 400);
    // }

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// ** SPECIFIC CAMPGROUND (ID)
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    // console.log(campground);
    res.render("campgrounds/show", { campground });
  })
);

// ** EDIT CAMPGROUND
router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);

// Not important really, just some testing wih mongoose middleware
// router.get(
//   "/campgrounds/test/:id",
//   catchAsync(async (req, res) => {
//     console.log("test route reached");
//     const { id } = req.params;
//     const campground = await Campground.updateOne(
//       { _id: id },
//       {
//         title: "lalalal",
//       }
//     );
//     res.send("OK");
//   })
// );

router.put(
  "/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

module.exports = router;
