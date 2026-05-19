import mongoose from "mongoose";

const ThreadSchema = new mongoose.Schema(
  {
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
        required: true,
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default mongoose.model("Thread", ThreadSchema);