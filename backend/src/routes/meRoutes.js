import express from "express";
import { bookmarks, continueReading, readingHistory, removeBookmark } from "../controllers/meController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);
router.get("/bookmarks", bookmarks);
router.delete("/bookmarks/:storyId", removeBookmark);
router.get("/reading-history", readingHistory);
router.get("/continue-reading", continueReading);

export default router;
