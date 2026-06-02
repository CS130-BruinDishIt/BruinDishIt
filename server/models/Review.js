import mongoose from "mongoose";

// Review schema tied to a MenuItem and shaped for frontend display.
// Reviews are tied directly to a MenuItem and match the frontend display shape.
const reviewSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
  },
  hallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DiningHall",
  },
  userId: { // keep track of who wrote review
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  dislikedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  date: { type: Date, default: Date.now },
  imageUrl: { type: String },
});

reviewSchema.pre('validate', function () {
  // both itemId and hallId are missing
  if (!this.itemId && !this.hallId) {
    return new Error('A review must be attached to either a MenuItem or a DiningHall.');
  }

  // both provided
  if (this.itemId && this.hallId) {
    return new Error('A review cannot be attached to BOTH a MenuItem and a DiningHall.');
  }
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;