import Chapter from "../models/Chapter.js";
import Story from "../models/Story.js";
import Interaction from "../models/Interaction.js";
import AudioFile from "../models/AudioFile.js";
import Follow from "../models/Follow.js";
import Notification from "../models/Notification.js";
import { minutesToRead } from "../utils/slug.js";

export async function list(req, res) {
  try {
    const filter = { storyId: req.params.storyId };
    if (req.query.includeDrafts === "true") {
      const story = await Story.findById(req.params.storyId);
      const isOwner = story?.authorId?.toString() === req.user?._id?.toString();
      const isAdmin = req.user?.roles?.includes("admin");
      if (!isOwner && !isAdmin) filter.status = "published";
    } else {
      filter.status = "published";
    }
    const chapters = await Chapter.find(filter).sort({ chapterNumber: 1 });
    res.json({ chapters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function create(req, res) {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ message: "Story not found" });

    const isOwner = story.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes("admin");
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

    const chapter = await Chapter.create({
      ...req.body,
      storyId: story._id,
      readingTime: req.body.readingTime || minutesToRead(req.body.content),
      publishDate: req.body.status === "published" ? new Date() : req.body.publishDate,
    });

    if (chapter.status === "published") {
      const followers = await Follow.find({ followeeId: story.authorId }).select("followerId");
      if (followers.length > 0) {
        await Notification.insertMany(
          followers.map((item) => ({
            userId: item.followerId,
            actorId: req.user._id,
            type: "new_chapter",
            payload: {
              storyId: story._id,
              storyTitle: story.title,
              storySlug: story.slug,
              chapterId: chapter._id,
              chapterNumber: chapter.chapterNumber,
              chapterTitle: chapter.title,
            },
          }))
        );
      }
    }

    res.status(201).json({ chapter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function get(req, res) {
  try {
    const chapter = await Chapter.findOne({
      storyId: req.params.storyId,
      chapterNumber: req.params.chapterNumber,
    });
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    if (chapter.status !== "published") {
      const story = await Story.findById(chapter.storyId);
      const isOwner = story?.authorId?.toString() === req.user?._id?.toString();
      const isAdmin = req.user?.roles?.includes("admin");
      if (!isOwner && !isAdmin) return res.status(404).json({ message: "Chapter not found" });
    }

    chapter.metrics.views += 1;
    await chapter.save();

    res.json({ chapter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function update(req, res) {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    const story = await Story.findById(chapter.storyId);
    const isOwner = story?.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes("admin");
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

    const wasPublished = chapter.status === "published";
    ["title", "content", "chapterNumber", "audio", "status", "publishDate", "scheduledFor"].forEach((key) => {
      if (req.body[key] !== undefined) chapter[key] = req.body[key];
    });
    if (req.body.content) chapter.readingTime = minutesToRead(req.body.content);
    if (req.body.status === "published" && !wasPublished) chapter.publishDate = new Date();
    if (req.body.status === "draft") {
      chapter.scheduledFor = undefined;
      chapter.publishDate = undefined;
    }

    await chapter.save();
    res.json({ chapter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function remove(req, res) {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    const story = await Story.findById(chapter.storyId);
    const isOwner = story?.authorId?.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes("admin");
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

    await chapter.deleteOne();
    res.json({ message: "Chapter deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function duplicate(req, res) {
  try {
    const chapter = await Chapter.findById(req.params.chapterId).lean();
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    const story = await Story.findById(chapter.storyId);
    const isOwner = story?.authorId?.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes("admin");
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

    const maxChapter = await Chapter.findOne({ storyId: story._id }).sort({ chapterNumber: -1 }).select("chapterNumber");
    const duplicateChapter = await Chapter.create({
      storyId: story._id,
      title: `${chapter.title} Copy`,
      content: chapter.content,
      chapterNumber: (maxChapter?.chapterNumber || 0) + 1,
      readingTime: chapter.readingTime,
      audio: chapter.audio,
      status: "draft",
    });

    res.status(201).json({ chapter: duplicateChapter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function changeStatus(req, res) {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    const story = await Story.findById(chapter.storyId);
    const isOwner = story?.authorId?.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes("admin");
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

    const nextStatus = req.body.status;
    if (!["draft", "published", "scheduled"].includes(nextStatus)) {
      return res.status(400).json({ message: "Invalid chapter status" });
    }

    const wasPublished = chapter.status === "published";
    chapter.status = nextStatus;
    if (nextStatus === "published" && !wasPublished) chapter.publishDate = new Date();
    if (nextStatus === "draft") {
      chapter.publishDate = undefined;
      chapter.scheduledFor = undefined;
    }
    if (nextStatus === "scheduled" && req.body.scheduledFor) {
      chapter.scheduledFor = req.body.scheduledFor;
    }

    await chapter.save();
    res.json({ chapter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function reorder(req, res) {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ message: "Story not found" });

    const isOwner = story.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes("admin");
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

    const orderedIds = Array.isArray(req.body.orderedIds) ? req.body.orderedIds : [];
    if (orderedIds.length === 0) return res.status(400).json({ message: "orderedIds is required" });

    const chapters = await Chapter.find({ storyId: story._id, _id: { $in: orderedIds } }).sort({ chapterNumber: 1 });
    if (chapters.length !== orderedIds.length) return res.status(400).json({ message: "Invalid chapter list" });

    await Promise.all(
      chapters.map((chapter, index) =>
        Chapter.updateOne({ _id: chapter._id }, { $set: { chapterNumber: 100000 + index } })
      )
    );
    await Promise.all(
      orderedIds.map((chapterId, index) =>
        Chapter.updateOne({ _id: chapterId, storyId: story._id }, { $set: { chapterNumber: index + 1 } })
      )
    );

    const reordered = await Chapter.find({ storyId: story._id }).sort({ chapterNumber: 1 });
    res.json({ chapters: reordered });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function attachAudio(req, res) {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    const audio = await AudioFile.create({
      ...req.body,
      chapterId: chapter._id,
      storyId: chapter.storyId,
      ownerId: req.user._id,
    });

    chapter.audio = {
      source: audio.source,
      url: audio.url,
      duration: audio.duration,
      size: audio.size,
      format: audio.format,
    };
    await chapter.save();

    res.status(201).json({ audio, chapter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function reader(req, res) {
  try {
    const story = await Story.findById(req.params.storyId)
      .populate("authorId", "username displayName avatarUrl verification roles")
      .lean();
    if (!story) return res.status(404).json({ message: "Story not found" });

    const chapterNumber = Number(req.params.chapterNumber);
    const [chapter, chapters] = await Promise.all([
      Chapter.findOne({ storyId: story._id, chapterNumber }).lean(),
      Chapter.find({ storyId: story._id, status: "published" })
        .select("title chapterNumber")
        .sort({ chapterNumber: 1 })
        .lean(),
    ]);

    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    if (chapter.status !== "published") {
      const isOwner = story.authorId?._id?.toString() === req.user?._id?.toString() || story.authorId?.toString() === req.user?._id?.toString();
      const isAdmin = req.user?.roles?.includes("admin");
      if (!isOwner && !isAdmin) return res.status(404).json({ message: "Chapter not found" });
    }

    const currentIndex = chapters.findIndex((item) => Number(item.chapterNumber) === chapterNumber);
    const previousChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    const nextChapter = currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
    const totalChapters = chapters.length;
    const currentChapterIndex = currentIndex >= 0 ? currentIndex + 1 : 1;
    const remainingChapters = Math.max(totalChapters - currentChapterIndex, 0);
    const progressPercent = totalChapters > 0 ? Math.round((currentChapterIndex / totalChapters) * 100) : 0;

    if (req.user?._id) {
      await Interaction.findOneAndUpdate(
        { userId: req.user._id, targetType: "story", targetId: story._id, action: "read" },
        {
          userId: req.user._id,
          targetType: "story",
          targetId: story._id,
          action: "read",
          metadata: {
            chapterId: chapter._id,
            chapterNumber,
            progress: progressPercent,
            progressPercent,
            currentChapterIndex,
            totalChapters,
            remainingChapters,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    res.json({ story, chapter, chapters, previousChapter, nextChapter, progressPercent, currentChapterIndex, totalChapters, remainingChapters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
