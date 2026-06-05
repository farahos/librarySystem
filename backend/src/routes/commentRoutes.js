import express from "express";
import { create, list, remove } from "../controllers/commentController.js";
import { authenticate, optionalAuth, requireActiveForPlatformAction } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

router.get("/", optionalAuth, list);
router.post("/", authenticate, requireActiveForPlatformAction, create);
router.delete("/:commentId", authenticate, remove);

export default router;
