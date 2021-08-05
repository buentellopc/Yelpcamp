const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = {
  body: String,
  rating: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
};

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
