const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");

const Campground = require("../models/campground");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

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
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

// POST TO HANDLE THE CREATION
router.post(
  "/",
  isLoggedIn,
  validateCampground,

  catchAsync(async (req, res, next) => {
    // if (!req.body.campground) {
    //   throw new ExpressError("Invalid Campground Data (post)", 400);
    // }

    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Succesfully created a campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// ** SPECIFIC CAMPGROUND (ID)
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
      .populate("reviews")
      .populate("author");
    console.log(campground);
    if (!campground) {
      console.log(campground); // it logs null, so null.length would be an error
      req.flash("error", "campground not found!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);

// ** EDIT CAMPGROUND
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      console.log(campground); // does not log anything
      req.flash("error", "campground not found!");
      return res.redirect("/campgrounds");
    }
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
  isAuthor,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Succesfully edited a campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:id",
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    // Not Colt approach
    // const deletedCampground = await Campground.findByIdAndDelete(id);
    // await Review.deleteMany({ _id: { $in: deletedCampground.reviews } });
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Succesfully deleted a campground!");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
