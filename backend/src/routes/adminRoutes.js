import express from "express";
import {
  adminGenres,
  analytics,
  approveVerification,
  createAdminGenre,
  deleteAdminGenre,
  disciplineUser,
  featuredStories,
  featureStory,
  listUsers,
  moderateComment,
  moderateStory,
  moderationOverview,
  moderationLogs,
  ownerControls,
  requestMoreVerificationInfo,
  rejectVerification,
  suspendUser,
  transferOwnership,
  updateAdminGenre,
  updateUser,
  updateUserRole,
  userDisciplineCenter,
  verificationRequests,
} from "../controllers/adminController.js";
import { list as listReports, resolve as resolveReport } from "../controllers/reportController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

const moderatorOrAbove = authorizeRoles("moderator", "admin", "owner");
const adminOrOwner = authorizeRoles("admin", "owner");
const ownerOnly = authorizeRoles("owner");

router.use(authenticate);

router.get("/analytics", moderatorOrAbove, analytics);
router.get("/moderation", moderatorOrAbove, moderationOverview);
router.get("/reports", moderatorOrAbove, listReports);
router.patch("/reports/:id/resolve", moderatorOrAbove, resolveReport);
router.patch("/stories/:id/moderate", moderatorOrAbove, moderateStory);
router.patch("/comments/:id/moderate", moderatorOrAbove, moderateComment);
router.patch("/users/:id/discipline", moderatorOrAbove, disciplineUser);
router.patch("/users/:id/suspend", moderatorOrAbove, suspendUser);

router.get("/users", adminOrOwner, listUsers);
router.get("/users/:id/discipline-center", adminOrOwner, userDisciplineCenter);
router.put("/users/:id", adminOrOwner, updateUser);
router.patch("/users/:id/role", adminOrOwner, updateUserRole);
router.patch("/users/:id/transfer-ownership", ownerOnly, transferOwnership);
router.get("/owner-controls", ownerOnly, ownerControls);
router.get("/featured", adminOrOwner, featuredStories);
router.patch("/stories/:id/feature", adminOrOwner, featureStory);
router.get("/verification-requests", adminOrOwner, verificationRequests);
router.patch("/verification-requests/:id/approve", adminOrOwner, approveVerification);
router.patch("/verification-requests/:id/reject", adminOrOwner, rejectVerification);
router.patch("/verification-requests/:id/more-info", adminOrOwner, requestMoreVerificationInfo);
router.get("/genres", adminOrOwner, adminGenres);
router.post("/genres", adminOrOwner, createAdminGenre);
router.patch("/genres/:id", adminOrOwner, updateAdminGenre);
router.delete("/genres/:id", adminOrOwner, deleteAdminGenre);

router.get("/logs", ownerOnly, moderationLogs);

export default router;
