import express from "express";
import {
  adminGenres,
  analytics,
  approveVerification,
  createAdminGenre,
  deleteAdminGenre,
  featureStory,
  listUsers,
  rejectVerification,
  suspendUser,
  updateAdminGenre,
  updateUser,
  updateUserRole,
  verificationRequests,
} from "../controllers/adminController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/analytics", analytics);
router.get("/users", listUsers);
router.put("/users/:id", updateUser);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/suspend", suspendUser);
router.patch("/stories/:id/feature", featureStory);
router.get("/verification-requests", verificationRequests);
router.patch("/verification-requests/:id/approve", approveVerification);
router.patch("/verification-requests/:id/reject", rejectVerification);
router.get("/genres", adminGenres);
router.post("/genres", createAdminGenre);
router.patch("/genres/:id", updateAdminGenre);
router.delete("/genres/:id", deleteAdminGenre);

export default router;
