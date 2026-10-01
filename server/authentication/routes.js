import { Router } from "express";
import { loginController } from "./login.js"; // Import the controller directly
import { createAccountController } from "./createAccount.js";
import {updateUsername, updateProfilePic} from "./editAccount.js";
import { deleteAccount } from "./deleteAccount.js";
import { changePassword } from "./changePassword.js";
import { authMiddleware } from "./authMiddleware.js";
import { getUserProfileAndReviews } from "./getProfileAndReviews.js";
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
router.patch("/editProfilePic", authMiddleware, updateProfilePic);
router.patch("/changePW", authMiddleware, changePassword);
router.delete("/deleteAccount", authMiddleware, deleteAccount);

router.get("/user/:userId", getUserProfileAndReviews); // No authMiddleware here since we want to allow fetching public profiles

router.post("/uploadImage", upload.single("image"), uploadImage);

export default router;
