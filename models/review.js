const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = {
  body: String,
  rating: Number,
};

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
