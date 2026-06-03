import express from "express";
import authRoutes from "./authRoutes.js";
import storyRoutes from "./storyRoutes.js";
import chapterRoutes from "./chapterRoutes.js";
import commentRoutes from "./commentRoutes.js";
import followRoutes from "./followRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import genreRoutes from "./genreRoutes.js";
import reportRoutes from "./reportRoutes.js";
import verificationRoutes from "./verificationRoutes.js";
import adminRoutes from "./adminRoutes.js";
import meRoutes from "./meRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import writerRoutes from "./writerRoutes.js";
import readingListRoutes from "./readingListRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/stories", storyRoutes);
router.use("/stories/:storyId/chapters", chapterRoutes);
router.use("/chapters/:chapterId/comments", commentRoutes);
router.use("/users", followRoutes);
router.use("/notifications", notificationRoutes);
router.use("/genres", genreRoutes);
router.use("/reports", reportRoutes);
router.use("/verification-requests", verificationRoutes);
router.use("/admin", adminRoutes);
router.use("/me", meRoutes);
router.use("/uploads", uploadRoutes);
router.use("/writer", writerRoutes);
router.use("/reading-lists", readingListRoutes);

export default router;
