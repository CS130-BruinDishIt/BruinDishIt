import mongoose from "mongoose";

const diningHallSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    location: {
      type: String,
    },

    // Reviews that belong to this dining hall
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    // Current or active daily menu
    currentMenu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyMenu",
    },
  },
  {
    timestamps: true,
  }
);

const DiningHall = mongoose.model("DiningHall", diningHallSchema);

export default DiningHall;