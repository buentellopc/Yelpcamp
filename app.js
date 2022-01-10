if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const mongoSanitize = require("express-mongo-sanitize");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

// router
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
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

app.use(express.static("public"));
app.set("public", path.join(__dirname, "public"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(mongoSanitize());

const sessionConfig = {
  name: "session",
  secret: "supersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //    secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// after session
app.use(passport.initialize());
app.use(passport.session());
// authenticate is added by passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  console.log(req.query);
  // console.log(req.session);
  if (!["/", "/login"].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  next();
});

// testing passport strategy
app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "coltttt@gmail.com", username: "colttt" });
  const newUser = await User.register(user, "chicken");
  res.send(newUser);
});

// routes
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);
app.use("/", (req, res) => {
  res.render("home");
});

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
