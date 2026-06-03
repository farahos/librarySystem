import express from "express";
import { list, markRead } from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, list);
router.patch("/read", authenticate, markRead);

export default router;
