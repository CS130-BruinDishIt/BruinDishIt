import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Adjust path as needed

const JWT_SECRET = process.env.JWT_SECRET;

export async function createAccountController(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "Username is already registered." });
    }

    // Create the new user 
    const newUser = new User({
      username,
      password // triggers the hashPassword and random salt generation under the hood
    });

    // Save to MongoDB. If password is < 8 chars, your virtual setter's error will throw here.
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "7d" } // Matching your login token duration
    );

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        profileImageURL: newUser.profileImageURL,
      }
    });

  } catch (error) {
    if (error.message && error.message.includes("Password must be a string")) {
      return res.status(400).json({ error: error.message });
    }

    console.error("Account Creation Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}