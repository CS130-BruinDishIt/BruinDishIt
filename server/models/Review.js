const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    diningHall: {
      type: String,
      required: true,
      trim: true,
    },
    menuItem: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    imageURL: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

