import { Router } from "express";
import { loginController } from "./login.js"; // Import the controller directly
import { createAccountController } from "./createAccount.js";

const router = Router();



router.post("/signup", createAccountController);
router.post("/login", loginController);


export default router;
