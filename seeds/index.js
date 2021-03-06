const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.on("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  //   const c = new Campground({ title: "purple field" });
  //   await c.save();
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      author: "60ff485022c3be6c288637f4",
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatibus, magni. Fuga sed, cumque id velit adipisci iure voluptatem excepturi explicabo quos distinctio quas atque nulla laboriosam, saepe voluptates perferendis ipsum!",
      images: [
        {
          url: "https://res.cloudinary.com/datev5uoe/image/upload/v1640206241/Yelpcamp/qjvxqharci3itvk5tr6l.jpg",
          filename: "Yelpcamp/qjvxqharci3itvk5tr6l.jpg",
        },
        {
          url: "https://res.cloudinary.com/datev5uoe/image/upload/v1639519020/Yelpcamp/bqacrpz6m6vedyqkywha.png",
          filename: "Yelpcamp/bqacrpz6m6vedyqkywha.png",
        },
      ],
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
