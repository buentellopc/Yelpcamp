const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, function (err) {
      if (err) return next(err);

      req.flash("success", "Welcome to Campground");
      res.redirect("/campgrounds");
    });

    console.log(registeredUser);
  } catch (error) {
    //   console.log(error.name);
    //   console.log(error.message);
    //   console.log(error.stack);

    req.flash("error", error.message);
    res.redirect("/register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  const redirectUrl = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  req.flash("success", "Welcome back!");
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Goodbye!");
  res.redirect("/campgrounds");
};
