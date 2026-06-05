import Comment from "../models/Comment.js";
import Chapter from "../models/Chapter.js";
import Story from "../models/Story.js";
import Notification from "../models/Notification.js";
import Report from "../models/Report.js";
import ModerationLog from "../models/ModerationLog.js";
import { reasonFromScan, scanContent } from "../services/moderationScanner.js";
import { highestRole } from "../utils/roles.js";

export async function list(req, res) {
  try {
    const canModerate = req.user?.roles?.some((role) => ["admin", "owner", "moderator"].includes(role));
    const comments = await Comment.find({
      chapterId: req.params.chapterId,
      status: req.query.includeRemoved === "true" && canModerate ? { $ne: null } : "visible",
    })
      .populate("authorId", "username displayName avatarUrl")
      .sort({ createdAt: -1 });
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function create(req, res) {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    const scan = scanContent(req.body.content);
    const comment = await Comment.create({
      chapterId: chapter._id,
      storyId: chapter.storyId,
      authorId: req.user._id,
      parentCommentId: req.body.parentCommentId || null,
      content: req.body.content,
      status: scan.risk === "high" ? "hidden" : "visible",
      moderationStatus: scan.risk === "low" ? "clean" : scan.risk === "high" ? "hidden" : "flagged",
      moderationScore: scan.score,
      moderationFlags: scan.flags,
    });
    await comment.populate("authorId", "username displayName avatarUrl");

    if (scan.risk !== "low") {
      await Report.create({
        source: "automatic",
        targetType: "comment",
        targetId: comment._id,
        reason: reasonFromScan(scan),
        description: `Automatic moderation flagged this comment as ${scan.risk} risk.`,
        status: "pending",
      });
      await ModerationLog.create({
        actorId: req.user._id,
        actorRole: highestRole(req.user),
        action: scan.risk === "high" ? "comment_auto_hidden" : "comment_auto_flagged",
        targetType: "comment",
        targetId: comment._id,
        reason: scan.flags.join(", "),
        metadata: { score: scan.score, risk: scan.risk },
      });
    }

    const story = await Story.findByIdAndUpdate(chapter.storyId, { $inc: { "metrics.comments": 1 } }, { new: true });
    if (story && story.authorId.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: story.authorId,
        actorId: req.user._id,
        type: "chapter_comment",
        payload: {
          storyId: story._id,
          storyTitle: story.title,
          storySlug: story.slug,
          chapterId: chapter._id,
          chapterNumber: chapter.chapterNumber,
          chapterTitle: chapter.title,
          commentId: comment._id,
        },
      });
    }
    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function remove(req, res) {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isOwner = comment.authorId.toString() === req.user._id.toString();
    const canModerate = req.user.roles.some((role) => ["admin", "owner", "moderator"].includes(role));
    if (!isOwner && !canModerate) return res.status(403).json({ message: "Not allowed" });

    comment.status = "deleted";
    comment.moderationStatus = "deleted";
    await comment.save();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
