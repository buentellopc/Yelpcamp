const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Joi = require("joi");
const { campgroundSchema, reviewSchema } = require("./schemas");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
// const { required } = require("joi");
const Campground = require("./models/campground");
const Review = require("./models/review");

// routes
const campgrounds = require("./routes/campgrounds");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.on("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

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

// routes
app.use("/campgrounds", campgrounds);

// ? Reviews route
app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    // Not Colt approach
    // const deletedCampground = await Campground.findByIdAndDelete(id);
    // await Review.deleteMany({ _id: { $in: deletedCampground.reviews } });
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);
// app.get("/makecampgrounds", async (req, res) => {
//   const camp = new Campground({
//     title: "My Backyard",
//     description: "cheap camping!",
//   });
//   await camp.save();
//   res.send(camp);
// });

/*
*Just to see when there is an error with no message
app.get("/error", (req, res) => {
  throw new ExpressError();
});
 */

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  // , message = "Something went wrong! (default)"
  const { statusCode = 500 } = err;
  if (!err.message)
    err.message = "Oh no, something went wrong (default error message)";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log(`Serving on port 3000`);
});
