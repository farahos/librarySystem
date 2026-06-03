import express from "express";
import { changePassword, login, me, signup } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authenticate, me);
router.patch("/change-password", authenticate, changePassword);

export default router;
