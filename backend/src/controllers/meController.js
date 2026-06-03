import Chapter from "../models/Chapter.js";
import Interaction from "../models/Interaction.js";
import Story from "../models/Story.js";

async function interactionsWithStories(userId, action) {
  const interactions = await Interaction.find({ userId, action, targetType: "story" }).sort({ updatedAt: -1 });
  const storyIds = interactions.map((item) => item.targetId);
  const stories = await Story.find({ _id: { $in: storyIds } })
    .populate("authorId", "username displayName avatarUrl verification roles")
    .lean();
  const storyMap = new Map(stories.map((story) => [story._id.toString(), story]));

  return interactions
    .map((interaction) => ({
      interaction,
      story: storyMap.get(interaction.targetId.toString()),
      progress: interaction.metadata?.progress || 0,
      progressPercent: interaction.metadata?.progressPercent || interaction.metadata?.progress || 0,
      chapterId: interaction.metadata?.chapterId,
      chapterNumber: interaction.metadata?.chapterNumber,
      lastOpenedAt: interaction.updatedAt,
    }))
    .filter((item) => item.story);
}

export async function bookmarks(req, res) {
  try {
    const items = await interactionsWithStories(req.user._id, "bookmark");
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function removeBookmark(req, res) {
  try {
    await Interaction.findOneAndDelete({
      userId: req.user._id,
      targetType: "story",
      targetId: req.params.storyId,
      action: "bookmark",
    });
    res.json({ message: "Bookmark removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function readingHistory(req, res) {
  try {
    const items = await interactionsWithStories(req.user._id, "read");
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function continueReading(req, res) {
  try {
    const items = await interactionsWithStories(req.user._id, "read");
    const withChapters = await Promise.all(
      items.slice(0, 20).map(async (item) => {
        const chapter = await Chapter.findOne({
          storyId: item.story._id,
          chapterNumber: item.chapterNumber || 1,
        }).select("title chapterNumber readingTime");
        return { ...item, chapter };
      })
    );
    res.json({ items: withChapters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
