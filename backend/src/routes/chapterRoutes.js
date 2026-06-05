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
import { authenticate, optionalAuth, requireActiveForPlatformAction } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

router.get("/", optionalAuth, list);
router.post("/", authenticate, requireActiveForPlatformAction, create);
router.post("/reorder", authenticate, reorder);
router.get("/:chapterNumber/reader", optionalAuth, reader);
router.get("/:chapterNumber", optionalAuth, get);
router.put("/by-id/:chapterId", authenticate, requireActiveForPlatformAction, update);
router.delete("/by-id/:chapterId", authenticate, remove);
router.post("/by-id/:chapterId/duplicate", authenticate, duplicate);
router.patch("/by-id/:chapterId/status", authenticate, requireActiveForPlatformAction, changeStatus);
router.post("/by-id/:chapterId/audio", authenticate, attachAudio);

export default router;
