import mongoose from "mongoose";

const diningHallSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    shortName: {
      type: String,
      required: true,
      unique: true,
    },
    averageRating: {
      type: Number,
      default: 0
    },
    level: {
      type: String,
      default: "small"
    }
  },
  {
    timestamps: true,
  }
);

const DiningHall = mongoose.model("DiningHall", diningHallSchema);

export default DiningHall;