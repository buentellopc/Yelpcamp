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

app.get("/", (req, res) => {
  res.render("home");
});

// ** ALL CAMPGROUNDS
app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

// ** CREATE A CAMPGROUND

// SHOW A CAMPGROUND TO CREATE
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

// POST TO HANDLE THE CREATION
app.post(
  "/campgrounds",
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
app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    // console.log(campground);
    res.render("campgrounds/show", { campground });
  })
);

// ** EDIT CAMPGROUND
app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);

// Not important really, just some testing wih mongoose middleware
// app.get(
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

app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

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
