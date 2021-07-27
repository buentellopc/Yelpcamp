const express = require("express");
const router = express.Router();
const User = require("../models/user");
const CatchAsync = require("../utils/catchAsync");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  CatchAsync(async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const user = new User({ username, email });
      const registeredUser = await User.register(user, password);
      console.log(registeredUser);
      req.flash("success", "Welcome to Campground");
      res.redirect("/campgrounds");
    } catch (error) {
      //   console.log(error.name);
      //   console.log(error.message);
      //   console.log(error.stack);

      req.flash("error", error.message);
      res.redirect("/register");
    }
  })
);

module.exports = router;
