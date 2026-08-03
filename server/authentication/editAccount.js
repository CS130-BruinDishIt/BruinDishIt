import User from "../models/User.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Upload images to Cloudflare R2
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID, // like a username for R2
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY, // like a password for R2
  },
});

export const updateUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id; // Assumes auth middleware provides this. The req should have the user object who is making this request

    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "A valid username is required." });
    }

    const trimmedUsername = username.trim();

    // Check if the username is already taken by another user
    const existingUser = await User.findOne({ username: trimmedUsername });

    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(409).json({ error: "Username is already taken." });
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username: trimmedUsername },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      message: "Username updated successfully.",
      user: { username: updatedUser.username },
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error." });
  }
};

export const updateDescriptionOrImage = async (req, res) => {
  try {
    const { profileImageURL, profileDescription } = req.body;
    const userId = req.user.id; //Same as above, the req should store the user document that is doing this action

    // Build the update object dynamically based on what was provided
    const updateFields = {};

    if (profileImageURL !== undefined) {
      updateFields.profileImageURL = profileImageURL;
    }

    if (profileDescription !== undefined) {
      updateFields.profileDescription = profileDescription;
    }

    // If the body was empty, don't waste a database trip
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No update fields provided." });
    }

    // Fetch the old user first so we know what image to delete
    const oldUser = await User.findById(userId);
    if (!oldUser) {
      return res.status(404).json({ message: "User not found." });
    }
    const oldImageUrl = oldUser.profileImageURL;

    // Update the document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { returnDocument: "after", runValidators: true }
    );

    // Delete the old profile image from R2 if it exists and a new one is being uploaded
    if (
      updateFields.profileImageURL &&
      oldImageUrl &&
      updateFields.profileImageURL !== oldImageUrl
    ) {
      const key = oldImageUrl.replace(`${process.env.R2_PUBLIC_URL}/`, "");

      await r2.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      }));
    }

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      message: "Profile details updated successfully.",
      user: {
        profileImageURL: updatedUser.profileImageURL,
        profileDescription: updatedUser.profileDescription,
      },
    });
  } catch (error) {
    // If it violates the max length of 500 characters, Mongoose validation handles it here
    res.status(400).json({ error: error.message || "Internal server error." });
  }
};

