const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  // tells what the review is for
  subjectType: {
    type: String,
    required: true,
    enum: ["MenuItem", "DiningHall"],
  },

  // dynamic reference based on subjectType
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "subjectType",
  },

  user: {
    type: String,
    required: true,
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  text: {
    type: String,
    required: true,
  },

  likes: {
    type: Number,
    default: 0,
  },

  dislikes: {
    type: Number,
    default: 0,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  imageUrl: {
    type: String,
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = mongoose.models.Review || mongoose.model("Review", reviewSchema);