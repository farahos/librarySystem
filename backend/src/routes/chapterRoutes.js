import express from "express";
import {
  attachAudio,
  changeStatus,
  create,
  duplicate,
  get,
  list,
  reader,
  remove,
  reorder,
  update,
} from "../controllers/chapterController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

router.get("/", optionalAuth, list);
router.post("/", authenticate, create);
router.post("/reorder", authenticate, reorder);
router.get("/:chapterNumber/reader", optionalAuth, reader);
router.get("/:chapterNumber", optionalAuth, get);
router.put("/by-id/:chapterId", authenticate, update);
router.delete("/by-id/:chapterId", authenticate, remove);
router.post("/by-id/:chapterId/duplicate", authenticate, duplicate);
router.patch("/by-id/:chapterId/status", authenticate, changeStatus);
router.post("/by-id/:chapterId/audio", authenticate, attachAudio);

export default router;
