import Story from "../models/Story.js";
import Chapter from "../models/Chapter.js";
import Interaction from "../models/Interaction.js";
import Event from "../models/Event.js";
import Notification from "../models/Notification.js";
import { slugify } from "../utils/slug.js";

const buildStoryFilter = (query, user) => {
  const filter = {};
  const canIncludePrivate = query.includePrivate === "true" && user?.roles?.includes("admin");
  if (!canIncludePrivate) filter.visibility = "public";
  const search = query.search || query.q;
  if (search) filter.$text = { $search: search };
  if (query.genre) filter.genres = query.genre;
  if (query.category) filter.category = query.category;
  if (query.authorId) filter.authorId = query.authorId;
  if (query.status) filter.status = query.status;
  if (query.featured === "true") filter["featured.enabled"] = true;
  if (query.originals === "true") filter["original.enabled"] = true;
  if (query.tag) filter.tags = query.tag.toLowerCase();
  return filter;
};

export async function list(req, res) {
  try {
    const { page = 1, limit = 12, sort = "newest" } = req.query;
    const sortMap = {
      new: { createdAt: -1 },
      newest: { createdAt: -1 },
      trending: { "metrics.reads": -1, "metrics.likes": -1 },
      popular: { "metrics.likes": -1, "metrics.bookmarks": -1 },
      featured: { "featured.rank": 1, createdAt: -1 },
      weekly: { "metrics.views": -1, updatedAt: -1 },
      "recently-updated": { updatedAt: -1 },
    };

    const stories = await Story.find(buildStoryFilter(req.query, req.user))
      .populate("authorId", "username displayName avatarUrl verification roles")
      .populate("genres", "name slug")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort(sortMap[sort] || sortMap.new);

    res.json({ stories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function collection(req, res) {
  try {
    const sort = req.params.collection;
    req.query.sort = sort;
    req.query.limit = req.query.limit || 24;
    return list(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function category(req, res) {
  try {
    req.query.category = req.params.category;
    req.query.limit = req.query.limit || 24;
    return list(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function homeFeed(req, res) {
  try {
    const storyList = (filter, sort, limit = 10) =>
      Story.find(filter)
        .populate("authorId", "username displayName avatarUrl verification roles")
        .populate("genres", "name slug")
        .sort(sort)
        .limit(limit);

    const [trending, newest, recommended, weekly, originals, featuredWriters] = await Promise.all([
      storyList({ visibility: "public" }, { "metrics.reads": -1 }),
      storyList({ visibility: "public" }, { createdAt: -1 }),
      storyList({ visibility: "public", "featured.enabled": true }, { "featured.rank": 1 }),
      storyList({ visibility: "public" }, { "metrics.views": -1, updatedAt: -1 }),
      storyList({ visibility: "public", "original.enabled": true }, { createdAt: -1 }),
      Story.aggregate([
        { $match: { visibility: "public" } },
        { $group: { _id: "$authorId", reads: { $sum: "$metrics.reads" }, stories: { $sum: 1 } } },
        { $sort: { reads: -1 } },
        { $limit: 8 },
      ]),
    ]);

    res.json({ trending, newest, recommended, weekly, originals, featuredWriters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function create(req, res) {
  try {
    const title = String(req.body.title || "").trim();
    const description = String(req.body.description || "").trim();
    const category = String(req.body.category || "").trim();
    const status = String(req.body.status || "").trim();

    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!description) return res.status(400).json({ message: "Description is required" });
    if (!category) return res.status(400).json({ message: "Category is required" });
    if (!status) return res.status(400).json({ message: "Story status is required" });

    const slug = req.body.slug || slugify(req.body.title);
    const story = await Story.create({
      ...req.body,
      title,
      description,
      category,
      status,
      slug,
      authorId: req.user._id,
    });

    await Event.create({ type: "story.created", userId: req.user._id, targetType: "story", targetId: story._id });
    res.status(201).json({ story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function get(req, res) {
  try {
    const story = await Story.findOne({ slug: req.params.slug })
      .populate("authorId", "username displayName avatarUrl bio socialLinks stats verification roles")
      .populate("genres", "name slug");

    if (!story) return res.status(404).json({ message: "Story not found" });

    story.metrics.views += 1;
    await story.save();

    const chapters = await Chapter.find({ storyId: story._id, status: "published" })
      .select("title content chapterNumber readingTime audio status publishDate")
      .sort({ chapterNumber: 1 });

    res.json({ story, chapters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getById(req, res) {
  try {
    const story = await Story.findById(req.params.id)
      .populate("authorId", "username displayName avatarUrl bio socialLinks stats verification roles")
      .populate("genres", "name slug");

    if (!story) return res.status(404).json({ message: "Story not found" });

    res.json({ story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function update(req, res) {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    const isOwner = story.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes("admin");
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

    const allowed = [
      "title",
      "slug",
      "description",
      "coverUrl",
      "category",
      "genres",
      "tags",
      "status",
      "visibility",
      "publishing",
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) story[key] = req.body[key];
    });
    if (req.body.title !== undefined && !String(req.body.title).trim()) return res.status(400).json({ message: "Title is required" });
    if (req.body.description !== undefined && !String(req.body.description).trim()) return res.status(400).json({ message: "Description is required" });
    if (req.body.category !== undefined && !String(req.body.category).trim()) return res.status(400).json({ message: "Category is required" });
    if (req.body.status !== undefined && !String(req.body.status).trim()) return res.status(400).json({ message: "Story status is required" });
    if (req.body.title && !req.body.slug) story.slug = slugify(req.body.title);

    await story.save();
    res.json({ story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function remove(req, res) {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    const isOwner = story.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes("admin");
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

    story.visibility = "archived";
    await story.save();
    res.json({ message: "Story archived" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function interact(req, res) {
  try {
    const { action } = req.body;
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    const existing = await Interaction.findOne({
      userId: req.user._id,
      targetType: "story",
      targetId: story._id,
      action,
    });

    if (!existing) {
      await Interaction.create({
        userId: req.user._id,
        targetType: "story",
        targetId: story._id,
        action,
        metadata: req.body.metadata,
      });

      if (action === "like") story.metrics.likes += 1;
      if (action === "bookmark") story.metrics.bookmarks += 1;
      if (action === "read") story.metrics.reads += 1;
      if (action === "listen") story.metrics.audioListens += 1;
      await story.save();

      if (action === "like" && story.authorId.toString() !== req.user._id.toString()) {
        await Notification.create({
          userId: story.authorId,
          actorId: req.user._id,
          type: "story_like",
          payload: { storyId: story._id, storyTitle: story.title, storySlug: story.slug },
        });
      }
    }

    res.json({ message: `${action} recorded`, metrics: story.metrics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
