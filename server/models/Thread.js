const mongoose = require("mongoose");

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

module.exports =
  mongoose.models.Thread || mongoose.model("Thread", ThreadSchema);

