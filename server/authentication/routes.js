import { Router } from "express";
import { loginUser } from "./login.js";
import { signToken } from "./requireAuth.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await loginUser(username, password);

    if (!result.success) {
      return res.status(401).json({ error: result.message });
    }

    return res.status(200).json({
      user: result.user,
      token: signToken(result.user._id),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed." });
  }
});

export default router;
