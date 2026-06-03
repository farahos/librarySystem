import express from "express";
import { follow, followers, following, unfollow } from "../controllers/followController.js";
import { profile, updateMe } from "../controllers/userController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/profile/:username", optionalAuth, profile);
router.patch("/me", authenticate, updateMe);
router.get("/:userId/followers", followers);
router.get("/:userId/following", following);
router.post("/:userId/follow", authenticate, follow);
router.delete("/:userId/follow", authenticate, unfollow);

export default router;
