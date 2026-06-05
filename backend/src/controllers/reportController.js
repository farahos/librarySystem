import Chapter from "../models/Chapter.js";
import Comment from "../models/Comment.js";
import ModerationLog from "../models/ModerationLog.js";
import Report from "../models/Report.js";
import Story from "../models/Story.js";
import User from "../models/User.js";
import { highestRole } from "../utils/roles.js";

const reasonAliases = {
  pornography: "sexual_content",
  adult_content: "sexual_content",
  abuse: "harassment",
  copyright_violation: "copyright",
  hate: "hate_speech",
  misinformation: "other",
};

const statusAliases = {
  open: "pending",
  in_review: "pending",
  resolved: "action_taken",
  rejected: "dismissed",
};

const allowedReasons = ["sexual_content", "harassment", "hate_speech", "violence", "spam", "copyright", "impersonation", "other"];

function normalizeReason(reason = "other") {
  const normalized = reasonAliases[reason] || reason;
  return allowedReasons.includes(normalized) ? normalized : "other";
}

function normalizeStatus(status = "pending") {
  return statusAliases[status] || status;
}

async function logAction(actorId, action, targetType, targetId, reason, metadata = {}) {
  return ModerationLog.create({
    actorId,
    actorRole: metadata.actorRole,
    action,
    targetType,
    targetId,
    reason,
    metadata,
  });
}

async function getTarget(targetType, targetId) {
  if (targetType === "story") return Story.findById(targetId).populate("authorId", "username displayName email status");
  if (targetType === "chapter") return Chapter.findById(targetId).populate("storyId", "title slug authorId");
  if (targetType === "comment") return Comment.findById(targetId).populate("authorId", "username displayName email status");
  if (targetType === "user") return User.findById(targetId).select("-passwordHash");
  return null;
}

async function getResponsibleUserId(report, target) {
  if (report.targetType === "user") return report.targetId;
  if (report.targetType === "story") return target?.authorId?._id || target?.authorId;
  if (report.targetType === "comment") return target?.authorId?._id || target?.authorId;
  if (report.targetType === "chapter") {
    const storyId = target?.storyId?._id || target?.storyId;
    const story = target?.storyId?.authorId ? target.storyId : await Story.findById(storyId).select("authorId");
    return story?.authorId?._id || story?.authorId;
  }
  return null;
}

async function hydrateReports(reports) {
  const hydrated = [];
  for (const report of reports) {
    const target = await getTarget(report.targetType, report.targetId);
    const reportCount = await Report.countDocuments({
      targetType: report.targetType,
      targetId: report.targetId,
      status: "pending",
    });
    hydrated.push({
      ...report.toObject(),
      target,
      reportCount,
    });
  }
  return hydrated;
}

export async function create(req, res) {
  try {
    const targetType = req.body.targetType;
    const targetId = req.body.targetId;
    if (!["story", "chapter", "comment", "user"].includes(targetType)) {
      return res.status(400).json({ message: "Invalid report target" });
    }

    const report = await Report.create({
      reporterId: req.user._id,
      targetType,
      targetId,
      reason: normalizeReason(req.body.reason),
      description: req.body.description || req.body.details,
      details: req.body.details || req.body.description,
      status: "pending",
    });

    await logAction(req.user._id, "report_created", "report", report._id, report.reason, {
      targetType,
      targetId,
    });

    res.status(201).json({ report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function list(req, res) {
  try {
    const filter = req.query.status ? { status: normalizeStatus(req.query.status) } : {};
    const reports = await Report.find(filter)
      .populate("reporterId", "username email displayName")
      .populate("reviewedBy", "username displayName")
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit || 100));
    res.json({ reports: await hydrateReports(reports) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function warnUser(userId, actorId, reason) {
  return User.findByIdAndUpdate(
    userId,
    {
      status: "warned",
      $push: { "discipline.warnings": { reason, moderatorId: actorId, createdAt: new Date() } },
    },
    { new: true }
  ).select("-passwordHash");
}

async function suspendUser(userId, actorId, reason, durationDays = 7) {
  const endDate = durationDays ? new Date(Date.now() + Number(durationDays) * 24 * 60 * 60 * 1000) : undefined;
  return User.findByIdAndUpdate(
    userId,
    {
      status: durationDays ? "suspended" : "banned",
      "discipline.suspension": {
        reason,
        moderatedBy: actorId,
        startDate: new Date(),
        endDate,
        permanent: !durationDays,
      },
    },
    { new: true }
  ).select("-passwordHash");
}

async function applyAction(report, req) {
  const action = req.body.action || req.body.adminAction || "dismiss";
  const reason = req.body.reason || req.body.notes || report.reason;
  const target = await getTarget(report.targetType, report.targetId);

  if (action === "dismiss") {
    return { status: "dismissed", result: null };
  }

  if (action === "escalate" || action === "escalate_to_admin") {
    return { status: "escalated", result: null };
  }

  if (action === "hide_content") {
    if (report.targetType === "story") {
      const story = await Story.findByIdAndUpdate(
        report.targetId,
        { visibility: "hidden", moderationStatus: "hidden", moderatedBy: req.user._id, moderatedAt: new Date(), moderationReason: reason },
        { new: true }
      );
      return { status: "action_taken", result: story };
    }
    if (report.targetType === "chapter") {
      const chapter = await Chapter.findByIdAndUpdate(
        report.targetId,
        { visibility: "hidden", moderationStatus: "hidden", moderatedBy: req.user._id, moderatedAt: new Date(), moderationReason: reason },
        { new: true }
      );
      return { status: "action_taken", result: chapter };
    }
    if (report.targetType === "comment") {
      const comment = await Comment.findByIdAndUpdate(
        report.targetId,
        { status: "hidden", moderatedBy: req.user._id, moderatedAt: new Date(), moderationReason: reason },
        { new: true }
      );
      return { status: "action_taken", result: comment };
    }
  }

  if (action === "delete_comment") {
    if (report.targetType !== "comment") return { status: "action_taken", result: null };
    const comment = await Comment.findByIdAndUpdate(
      report.targetId,
      {
        status: "deleted",
        moderationStatus: "deleted",
        moderatedBy: req.user._id,
        moderatedAt: new Date(),
        moderationReason: reason,
      },
      { new: true }
    );
    return { status: "action_taken", result: comment };
  }

  if (action === "warn_user") {
    const userId = await getResponsibleUserId(report, target);
    return { status: "action_taken", result: userId ? await warnUser(userId, req.user._id, reason) : null };
  }

  if (action === "suspend_user") {
    const userId = await getResponsibleUserId(report, target);
    return {
      status: "action_taken",
      result: userId ? await suspendUser(userId, req.user._id, reason, req.body.durationDays || 7) : null,
    };
  }

  if (action === "ban_user") {
    const userId = await getResponsibleUserId(report, target);
    return { status: "action_taken", result: userId ? await suspendUser(userId, req.user._id, reason, 0) : null };
  }

  return { status: "action_taken", result: null };
}

export async function resolve(req, res) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const actionResult = await applyAction(report, req);
    report.status = normalizeStatus(req.body.status) || actionResult.status;
    if (req.body.status === undefined) report.status = actionResult.status;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    report.adminAction = {
      type: req.body.action === "escalate_to_admin" ? "escalate" : req.body.action || "dismiss",
      notes: req.body.notes || req.body.reason,
      moderatorId: req.user._id,
      resolvedAt: new Date(),
    };
    await report.save();

    await logAction(req.user._id, `report_${report.adminAction.type}`, "report", report._id, report.adminAction.notes, {
      targetType: report.targetType,
      targetId: report.targetId,
      reportStatus: report.status,
      actorRole: highestRole(req.user),
    });

    res.json({ report, result: actionResult.result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
