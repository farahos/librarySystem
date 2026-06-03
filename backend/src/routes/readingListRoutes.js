import express from "express";
import {
  addStory,
  createList,
  deleteList,
  getList,
  myLists,
  removeStory,
  updateList,
} from "../controllers/readingListController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, myLists);
router.post("/", authenticate, createList);
router.get("/:listId", optionalAuth, getList);
router.put("/:listId", authenticate, updateList);
router.delete("/:listId", authenticate, deleteList);
router.post("/:listId/stories", authenticate, addStory);
router.delete("/:listId/stories/:storyId", authenticate, removeStory);

export default router;
