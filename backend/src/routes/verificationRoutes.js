import express from "express";
import {
  list,
  requestVerification,
  review,
} from "../controllers/verificationController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, authorizeRoles("writer", "verified_writer"), requestVerification);
router.get("/", authenticate, authorizeRoles("admin"), list);
router.patch("/:id/review", authenticate, authorizeRoles("admin"), review);

export default router;
