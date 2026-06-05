import { Router } from "express";
import { loginController } from "./login.js"; // Import the controller directly
import { createAccountController } from "./createAccount.js";
import {updateUsername, updateDescriptionOrImage} from "./editAccount.js";
import { changePassword } from "./changePassword.js";
import { authMiddleware } from "./authMiddleware.js";
import { getUserReviews } from "./getPosts.js";
import { uploadImage } from "./uploadImage.js";
import multer from "multer";



const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });
  

const router = Router();



router.post("/signup", createAccountController);
router.post("/login", loginController);

router.patch("/changeUsername", authMiddleware, updateUsername);
router.patch("/editDescription", authMiddleware, updateDescriptionOrImage);
router.patch("/editProfilePic", authMiddleware, updateDescriptionOrImage);
router.patch("/changePW", authMiddleware, changePassword);

router.get("/user/:userId", getUserReviews); 

router.post("/uploadImage", upload.single("image"), uploadImage);

export default router;
