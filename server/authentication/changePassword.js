import User from "../models/User.js"; // Adjust path as needed


export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // The permanent database ID from your auth middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current password and new password are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters long." });
    }

    // Fetch the user from the database

    const user = await User.findById(userId).select("+passwordHash +passwordSalt");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Verify the current password is correct
    const isMatch = user.verifyPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect current password." });
    }

    // Update to the new password
    // triggers virtual password setter which generates new salt and hashes the new pw
    user.password = newPassword;

    // Save the updated user document to the database
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error." });
  }
};
