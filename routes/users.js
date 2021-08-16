const express = require("express");
const router = express.Router();
const users = require("../controllers/users");
const User = require("../models/user");
const CatchAsync = require("../utils/catchAsync");
const passport = require("passport");

router.get("/register", users.renderRegister);

router.post("/register", CatchAsync(users.register));

router.get("/login", users.renderLogin);

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  users.login
);

router.get("/logout", users.logout);

module.exports = router;
