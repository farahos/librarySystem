import express from "express";
import { create, list, update } from "../controllers/genreController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/", list);
router.post("/", authenticate, authorizeRoles("admin"), create);
router.put("/:id", authenticate, authorizeRoles("admin"), update);

export default router;
