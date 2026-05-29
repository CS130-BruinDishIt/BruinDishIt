import { Router } from "express";
import { loginController } from "./login.js"; // Import the controller directly


const router = Router();


// Just pass the controller function straight in!
router.post("/login", loginController);


export default router;
