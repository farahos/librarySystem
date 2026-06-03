import Chapter from "../models/Chapter.js";
import Comment from "../models/Comment.js";
import Follow from "../models/Follow.js";
import Story from "../models/Story.js";

const ownStoryFilter = (userId) => ({ authorId: userId });

export async function dashboard(req, res) {
  try {
    const stories = await Story.find(ownStoryFilter(req.user._id)).lean();
    const storyIds = stories.map((story) => story._id);
    const [totalChapters, totalFollowers, recentComments] = await Promise.all([
      Chapter.countDocuments({ storyId: { $in: storyIds } }),
      Follow.countDocuments({ followeeId: req.user._id }),
      Comment.find({ storyId: { $in: storyIds } })
        .populate("authorId", "username displayName avatarUrl")
        .populate("storyId", "title slug")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const totals = stories.reduce(
      (acc, story) => {
        acc.reads += story.metrics?.reads || 0;
        acc.likes += story.metrics?.likes || 0;
        acc.bookmarks += story.metrics?.bookmarks || 0;
        return acc;
      },
      { reads: 0, likes: 0, bookmarks: 0 }
    );

    res.json({
      totalStories: stories.length,
      totalChapters,
      totalReads: totals.reads,
      totalLikes: totals.likes,
      totalBookmarks: totals.bookmarks,
      totalFollowers,
      recentComments,
      storyPerformance: stories
        .sort((a, b) => (b.metrics?.reads || 0) - (a.metrics?.reads || 0))
        .slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function stories(req, res) {
  try {
    const items = await Story.find(ownStoryFilter(req.user._id)).sort({ updatedAt: -1 });
    res.json({ stories: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function analytics(req, res) {
  try {
    const story = await Story.findOne({ _id: req.params.id, authorId: req.user._id });
    if (!story) return res.status(404).json({ message: "Story not found" });
    const chapters = await Chapter.find({ storyId: story._id }).sort({ chapterNumber: 1 });
    const comments = await Comment.countDocuments({ storyId: story._id });
    res.json({ story, chapters, comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function comments(req, res) {
  try {
    const stories = await Story.find(ownStoryFilter(req.user._id)).select("_id");
    const comments = await Comment.find({ storyId: { $in: stories.map((story) => story._id) } })
      .populate("authorId", "username displayName avatarUrl")
      .populate("storyId", "title slug")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
