import mongoose from "mongoose";

// Review schema tied to a MenuItem and shaped for frontend display.
// Reviews are tied directly to a MenuItem and match the frontend display shape.
const reviewSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  imageUrl: { type: String },
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;