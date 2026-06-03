import express from "express";
import { analytics, comments, dashboard, stories } from "../controllers/writerController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate, authorizeRoles("writer", "verified_writer", "admin"));
router.get("/dashboard", dashboard);
router.get("/stories", stories);
router.get("/stories/:id/analytics", analytics);
router.get("/comments", comments);

export default router;
