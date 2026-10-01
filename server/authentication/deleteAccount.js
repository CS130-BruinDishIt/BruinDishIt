import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import User from "../models/User.js";
import Review from "../models/Review.js";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const deleteAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await Review.deleteMany({ userId });
    await User.deleteOne({ _id: userId });

    if (user.profileImageURL) {
      const key = user.profileImageURL.replace(`${process.env.R2_PUBLIC_URL}/`, "");

      try {
        await r2.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
        }));
      } catch (imageError) {
        console.error("Account deleted, but profile image cleanup failed:", imageError);
      }
    }

    return res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error." });
  }
};