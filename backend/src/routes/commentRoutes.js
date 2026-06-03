import express from "express";
import { create, list, remove } from "../controllers/commentController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

router.get("/", optionalAuth, list);
router.post("/", authenticate, create);
router.delete("/:commentId", authenticate, remove);

export default router;
