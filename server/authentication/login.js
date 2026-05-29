import jwt from "jsonwebtoken";
import User from "./models/User.js"; // Adjust path to your schema file


const JWT_SECRET = process.env.JWT_SECRET;


export async function loginController(req, res) {
 const { username, password } = req.body;


 try {
   // 1. Fetch user AND explicitly ask for the hidden hash and salt fields
   const user = await User.findOne({ username }).select("+passwordHash +passwordSalt");
   if (!user) {
     return res.status(401).json({ error: "Invalid username or password" });
   }


   // 2. Use your built-in verification method
   const isPasswordValid = user.verifyPassword(password);
   if (!isPasswordValid) {
     return res.status(401).json({ error: "Invalid username or password" });
   }


   // 3. Issue a JWT valid for 24 hours
   const token = jwt.sign(
     { userId: user._id, username: user.username },
     JWT_SECRET,
     { expiresIn: "7d" }
   );


   // 4. Return token (and optionally user profile data)
   return res.status(200).json({
     message: "Login successful",
     token,
     user: {
       id: user._id,
       username: user.username,
       profileImageURL: user.profileImageURL,
     }
   });


 } catch (error) {
   return res.status(500).json({ error: "Internal server error" });
 }
}

