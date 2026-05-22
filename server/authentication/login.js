import User from "../models/User.js";

/**
 * Authenticate a user by username and plaintext password.
 * Uses User.verifyPassword (PBKDF2 hash + timing-safe compare).
 *
 * @returns {{ success: true, user: object } | { success: false, message: string }}
 */
export async function loginUser(username, password) {
  if (!username || !password) {
    return { success: false, message: "Username and password are required." };
  }

  const user = await User.findOne({ username: username.trim() }).select(
    "+passwordHash +passwordSalt"
  );

  if (!user || !user.verifyPassword(password)) {
    return { success: false, message: "Invalid username or password." };
  }

  const safeUser = user.toObject();
  delete safeUser.passwordHash;
  delete safeUser.passwordSalt;

  return { success: true, user: safeUser };
}
