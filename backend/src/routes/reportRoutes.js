import express from "express";
import { create, list, resolve } from "../controllers/reportController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, create);
router.get("/", authenticate, authorizeRoles("admin"), list);
router.patch("/:id/resolve", authenticate, authorizeRoles("admin"), resolve);

export default router;
