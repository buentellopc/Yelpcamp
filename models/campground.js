const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
    title: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    price: Number,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    description: String,
    location: String,
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  },
  opts
);

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>`;
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
