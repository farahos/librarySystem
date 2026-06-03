import Comment from "../models/Comment.js";
import Chapter from "../models/Chapter.js";
import Story from "../models/Story.js";
import Notification from "../models/Notification.js";

export async function list(req, res) {
  try {
    const comments = await Comment.find({
      chapterId: req.params.chapterId,
      status: req.query.includeRemoved === "true" ? { $ne: null } : "visible",
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

    const comment = await Comment.create({
      chapterId: chapter._id,
      storyId: chapter.storyId,
      authorId: req.user._id,
      parentCommentId: req.body.parentCommentId || null,
      content: req.body.content,
    });
    await comment.populate("authorId", "username displayName avatarUrl");

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
    const isAdmin = req.user.roles.includes("admin");
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

    comment.status = "removed";
    await comment.save();
    res.json({ message: "Comment removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
