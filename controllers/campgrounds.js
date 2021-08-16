const Campground = require("../models/campground");

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCamgpround = async (req, res, next) => {
  // if (!req.body.campground) {
  //   throw new ExpressError("Invalid Campground Data (post)", 400);
  // }

  const campground = new Campground(req.body.campground);
  campground.author = req.user._id;
  await campground.save();
  req.flash("success", "Succesfully created a campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  //    console.log(campground.reviews[0].author);
  if (!campground) {
    console.log(campground); // it logs null, so null.length would be an error
    req.flash("error", "campground not found!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    console.log(campground); // does not log anything
    req.flash("error", "campground not found!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCamgpround = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  req.flash("success", "Succesfully edited a campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  // Not Colt approach
  // const deletedCampground = await Campground.findByIdAndDelete(id);
  // await Review.deleteMany({ _id: { $in: deletedCampground.reviews } });
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Succesfully deleted a campground!");
  res.redirect("/campgrounds");
};
