const Campground = require("./models/campground");
const { campgroundSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //    console.log(req.originalUrl);
    req.flash("error", "you must be signed in");
    return res.redirect("/login");
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id).populate("author");
  console.log("author", campground.author);
  if (!campground.author.equals(req.user)) {
    req.flash("error", "You do not have permission!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
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

module.exports.validateReview = (req, res, next) => {
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
