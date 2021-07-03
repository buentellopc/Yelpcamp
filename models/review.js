const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = {
  body: String,
  rating: Number,
};

const Schema = mongoose.model("Schema", ReviewSchema);

module.exports = Schema;
