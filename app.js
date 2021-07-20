const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

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

// routes
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

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
