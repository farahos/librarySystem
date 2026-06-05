import bcrypt from "bcrypt";
import Chapter from "../models/Chapter.js";
import Comment from "../models/Comment.js";
import FeaturedStory from "../models/FeaturedStory.js";
import Genre from "../models/Genre.js";
import ModerationLog from "../models/ModerationLog.js";
import Notification from "../models/Notification.js";
import Report from "../models/Report.js";
import Story from "../models/Story.js";
import User from "../models/User.js";
import VerificationRequest from "../models/VerificationRequest.js";
import { hasAnyRole, highestRole, normalizeRoles } from "../utils/roles.js";

const dayStart = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const canManageAdmins = (user) => hasAnyRole(user, ["owner"]);

async function logAction(actorId, action, targetType, targetId, reason, metadata = {}) {
  return ModerationLog.create({ actorId, actorRole: metadata.actorRole, action, targetType, targetId, reason, metadata });
}

export async function analytics(req, res) {
  try {
    const today = dayStart();
    const [
      totalUsers,
      activeUsers,
      stories,
      chapters,
      comments,
      reports,
      pendingReports,
      actionedReports,
      dismissedReports,
      escalatedReports,
      suspendedUsers,
      bannedUsers,
      verificationRequests,
      dailyNewUsers,
      dailyStoryPublishes,
      dailyReadsAgg,
      topStories,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: { $in: ["active", "warned"] } }),
      Story.countDocuments(),
      Chapter.countDocuments(),
      Comment.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      Report.countDocuments({ status: "action_taken" }),
      Report.countDocuments({ status: "dismissed" }),
      Report.countDocuments({ status: "escalated" }),
      User.countDocuments({ status: "suspended" }),
      User.countDocuments({ status: "banned" }),
      VerificationRequest.countDocuments({ status: "pending" }),
      User.countDocuments({ createdAt: { $gte: today } }),
      Chapter.countDocuments({ status: "published", publishDate: { $gte: today } }),
      Chapter.aggregate([{ $group: { _id: null, reads: { $sum: "$metrics.reads" } } }]),
      Story.find({ visibility: "public" })
        .select("title slug metrics featured original")
        .sort({ "metrics.reads": -1 })
        .limit(10),
    ]);

    const dailyReads = dailyReadsAgg[0]?.reads || 0;

    res.json({
      totalUsers,
      activeUsers,
      users: totalUsers,
      stories,
      chapters,
      comments,
      reports,
      openReports: pendingReports,
      pendingReports,
      actionedReports,
      dismissedReports,
      escalatedReports,
      suspendedUsers,
      bannedUsers,
      verificationRequests,
      pendingVerifications: verificationRequests,
      dailyNewUsers,
      dailyReads,
      dailyStoryPublishes,
      topStories,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listUsers(req, res) {
  try {
    const filter = {};
    const search = String(req.query.search || "").trim();
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { displayName: { $regex: search, $options: "i" } },
      ];
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.role === "user") filter.roles = { $in: ["user", "reader", "writer"] };
    else if (req.query.role === "verified_author") filter.roles = { $in: ["verified_author", "verified_writer"] };
    else if (req.query.role) filter.roles = req.query.role;

    const users = await User.find()
      .find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit || 100));
    res.json({ users: users.map((user) => ({ ...user.toObject(), roles: normalizeRoles(user.roles || []) })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createUser(req, res) {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const displayName = String(req.body.displayName || "").trim();
    const password = String(req.body.password || "");
    const roles = normalizeRoles(Array.isArray(req.body.roles) ? req.body.roles : ["user"]);

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (roles.some((role) => ["admin", "owner"].includes(role)) && !canManageAdmins(req.user)) {
      return res.status(403).json({ message: "Only owners can create admins or owners" });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      displayName,
      passwordHash,
      roles,
      emailVerified: Boolean(req.body.emailVerified),
      verification: roles.includes("verified_author")
        ? { status: "approved", verifiedAt: new Date() }
        : { status: "none" },
    });

    await logAction(req.user._id, "user_created", "user", user._id, req.body.reason || "Created by admin", {
      roles,
      actorRole: highestRole(req.user),
    });

    const publicUser = await User.findById(user._id).select("-passwordHash");
    res.status(201).json({ user: publicUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateUser(req, res) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    await logAction(req.user._id, "user_updated", "user", user._id, req.body.reason, { actorRole: highestRole(req.user) });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { role, enabled = true } = req.body;
    const normalizedRole = normalizeRoles([role])[0];
    if (["moderator", "admin", "owner"].includes(normalizedRole) && !canManageAdmins(req.user)) {
      return res.status(403).json({ message: "Only owners can manage moderators, admins, or owners" });
    }
    const update = enabled ? { $addToSet: { roles: normalizedRole } } : { $pull: { roles: normalizedRole } };
    if (normalizedRole === "verified_author") {
      update.$set = {
        "verification.status": enabled ? "approved" : "none",
        "verification.verifiedAt": enabled ? new Date() : undefined,
      };
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    await logAction(req.user._id, enabled ? "role_granted" : "role_removed", "user", user._id, normalizedRole, {
      actorRole: highestRole(req.user),
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function disciplineUser(req, res) {
  try {
    const action = req.body.action || (req.body.status === "active" ? "restore" : req.body.status);
    const reason = req.body.reason || "Moderator action";
    const update = {};

    if (action === "warn") {
      update.status = "warned";
      update.$push = { "discipline.warnings": { reason, moderatorId: req.user._id, createdAt: new Date() } };
    } else if (action === "suspend") {
      const durationDays = Number(req.body.durationDays || 7);
      update.status = "suspended";
      update["discipline.suspension"] = {
        reason,
        moderatedBy: req.user._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        permanent: false,
      };
    } else if (action === "ban") {
      update.status = "banned";
      update["discipline.suspension"] = {
        reason,
        moderatedBy: req.user._id,
        startDate: new Date(),
        permanent: true,
      };
    } else if (action === "restore") {
      update.status = "active";
      update["discipline.suspension"] = undefined;
    } else {
      return res.status(400).json({ message: "Invalid discipline action" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    await logAction(req.user._id, `user_${action}`, "user", user._id, reason, {
      durationDays: req.body.durationDays,
      actorRole: highestRole(req.user),
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const suspendUser = disciplineUser;

export async function moderateStory(req, res) {
  try {
    const action = req.body.action;
    const map = {
      hide: { visibility: "hidden", moderationStatus: "hidden" },
      restore: { visibility: "public", moderationStatus: "clean" },
      archive: { visibility: "archived", moderationStatus: "archived" },
    };
    if (!map[action]) return res.status(400).json({ message: "Invalid story moderation action" });

    const story = await Story.findByIdAndUpdate(
      req.params.id,
      {
        ...map[action],
        moderatedBy: req.user._id,
        moderatedAt: new Date(),
        moderationReason: req.body.reason,
      },
      { new: true }
    );
    if (!story) return res.status(404).json({ message: "Story not found" });
    await logAction(req.user._id, `story_${action}`, "story", story._id, req.body.reason, { actorRole: highestRole(req.user) });
    res.json({ story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function moderateComment(req, res) {
  try {
    const action = req.body.action;
    const statusMap = { hide: "hidden", delete: "deleted", restore: "visible" };
    if (!statusMap[action]) return res.status(400).json({ message: "Invalid comment moderation action" });

    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        status: statusMap[action],
        moderationStatus: action === "restore" ? "clean" : statusMap[action],
        moderatedBy: req.user._id,
        moderatedAt: new Date(),
        moderationReason: req.body.reason,
      },
      { new: true }
    ).populate("authorId", "username displayName");
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    await logAction(req.user._id, `comment_${action}`, "comment", comment._id, req.body.reason, { actorRole: highestRole(req.user) });
    res.json({ comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function featureStory(req, res) {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    const enabled = Boolean(req.body.enabled);
    story.featured = {
      enabled,
      slot: req.body.slot || "recommended",
      rank: Math.min(99, Math.max(1, Number(req.body.rank || 10))),
      until: req.body.until || req.body.endDate || null,
    };
    story.original = {
      enabled: Boolean(req.body.original),
      badgeText: req.body.badgeText || "Madal Original",
      contractRef: req.body.contractRef,
    };
    await story.save();

    let featuredStory = null;
    if (enabled) {
      featuredStory = await FeaturedStory.findOneAndUpdate(
        { storyId: story._id, active: true },
        {
          storyId: story._id,
          startDate: req.body.startDate || new Date(),
          endDate: req.body.endDate || req.body.until || null,
          featuredBy: req.user._id,
          slot: story.featured.slot,
          rank: story.featured.rank,
          active: true,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      await FeaturedStory.updateMany({ storyId: story._id, active: true }, { active: false });
    }

    await logAction(req.user._id, enabled ? "story_featured" : "story_unfeatured", "featured_story", story._id, req.body.reason, {
      startDate: req.body.startDate,
      endDate: req.body.endDate || req.body.until,
      actorRole: highestRole(req.user),
    });

    if (story.authorId && enabled) {
      await Notification.create({
        userId: story.authorId,
        actorId: req.user._id,
        type: "featured_story",
        payload: { storyId: story._id, title: story.title },
      });
    }

    res.json({ story, featuredStory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function featuredStories(req, res) {
  try {
    const now = new Date();
    const placements = await FeaturedStory.find({
      active: true,
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }],
    })
      .populate({ path: "storyId", populate: { path: "authorId", select: "username displayName avatarUrl verification roles" } })
      .populate("featuredBy", "username displayName")
      .sort({ slot: 1, rank: 1, startDate: -1 });
    res.json({ placements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function verificationRequests(req, res) {
  try {
    const requests = await VerificationRequest.find(req.query.status ? { status: req.query.status } : {})
      .populate("userId", "username email displayName stats verification roles")
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function reviewVerification(req, res, status) {
  const request = await VerificationRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Verification request not found" });

  request.status = status;
  request.notes = req.body.notes;
  request.reviewerId = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  const userUpdate = {
    $set: {
      "verification.status": status,
      "verification.verifiedAt": status === "approved" ? new Date() : undefined,
    },
  };
  if (status === "approved") userUpdate.$addToSet = { roles: "verified_author" };
  if (status === "rejected") userUpdate.$pull = { roles: "verified_author" };
  await User.findByIdAndUpdate(request.userId, userUpdate);

  await logAction(req.user._id, `verification_${status}`, "verification", request._id, req.body.notes, {
    actorRole: highestRole(req.user),
  });
  res.json({ request });
}

export async function approveVerification(req, res) {
  try {
    await reviewVerification(req, res, "approved");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function rejectVerification(req, res) {
  try {
    await reviewVerification(req, res, "rejected");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function requestMoreVerificationInfo(req, res) {
  try {
    const request = await VerificationRequest.findByIdAndUpdate(
      req.params.id,
      { status: "pending", notes: req.body.notes, reviewerId: req.user._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Verification request not found" });
    await logAction(req.user._id, "verification_more_info_requested", "verification", request._id, req.body.notes, {
      actorRole: highestRole(req.user),
    });
    res.json({ request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function moderationLogs(req, res) {
  try {
    const logs = await ModerationLog.find(req.query.targetType ? { targetType: req.query.targetType } : {})
      .populate("actorId", "username displayName roles")
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit || 100));
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function adminGenres(req, res) {
  try {
    const genres = await Genre.find().sort({ sortOrder: 1, name: 1 });
    res.json({ genres });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAdminGenre(req, res) {
  try {
    const genre = await Genre.create(req.body);
    res.status(201).json({ genre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateAdminGenre(req, res) {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!genre) return res.status(404).json({ message: "Genre not found" });
    res.json({ genre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAdminGenre(req, res) {
  try {
    await Genre.findByIdAndDelete(req.params.id);
    res.json({ message: "Genre deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
