import express from "express";
import {
  create,
  category,
  collection,
  get,
  getById,
  homeFeed,
  interact,
  list,
  remove,
  update,
} from "../controllers/storyController.js";
import { authenticate, optionalAuth, requireActiveForPlatformAction } from "../middleware/auth.js";

const router = express.Router();

router.get("/", optionalAuth, list);
router.get("/feed/home", optionalAuth, homeFeed);
router.get("/trending", optionalAuth, (req, res) => {
  req.params.collection = "trending";
  return collection(req, res);
});
router.get("/recently-updated", optionalAuth, (req, res) => {
  req.params.collection = "recently-updated";
  return collection(req, res);
});
router.get("/popular", optionalAuth, (req, res) => {
  req.params.collection = "popular";
  return collection(req, res);
});
router.get("/category/:category", optionalAuth, category);
router.get("/id/:id", optionalAuth, getById);
router.post("/", authenticate, requireActiveForPlatformAction, create);
router.get("/:slug", optionalAuth, get);
router.put("/:id", authenticate, requireActiveForPlatformAction, update);
router.delete("/:id", authenticate, remove);
router.post("/:id/interactions", authenticate, interact);

export default router;
