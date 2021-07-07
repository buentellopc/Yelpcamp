const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  image: String,
  description: String,
  location: String,
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
});

// The route was using a method that belongs to a Model and returns a Query, probably that is why nothing whas shown here
// CampgroundSchema.pre("updateOne", { document: true, query: false }, (doc) => {
//   console.log(doc);
//   console.log("this", this);
// });

CampgroundSchema.post("findOneAndDelete", async (doc) => {
  // console.log(doc);
  // console.log("this", this);
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

const Campground = mongoose.model("Campground", CampgroundSchema);

module.exports = Campground;
