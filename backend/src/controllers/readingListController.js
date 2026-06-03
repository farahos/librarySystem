import ReadingList from "../models/ReadingList.js";
import ReadingListItem from "../models/ReadingListItem.js";
import Story from "../models/Story.js";

async function listWithCount(list) {
  const storiesCount = await ReadingListItem.countDocuments({ readingListId: list._id });
  return { ...list.toObject(), storiesCount };
}

export async function myLists(req, res) {
  try {
    const lists = await ReadingList.find({ ownerId: req.user._id }).sort({ updatedAt: -1 });
    const withCounts = await Promise.all(lists.map(listWithCount));
    res.json({ lists: withCounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createList(req, res) {
  try {
    const list = await ReadingList.create({
      ownerId: req.user._id,
      name: req.body.name,
      description: req.body.description || "",
      isPublic: req.body.isPublic !== false,
    });
    res.status(201).json({ list: await listWithCount(list) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getList(req, res) {
  try {
    const list = await ReadingList.findById(req.params.listId).populate("ownerId", "username displayName avatarUrl");
    if (!list) return res.status(404).json({ message: "Reading list not found" });

    const isOwner = req.user?._id && list.ownerId._id.toString() === req.user._id.toString();
    if (!list.isPublic && !isOwner) return res.status(403).json({ message: "Not allowed" });

    const items = await ReadingListItem.find({ readingListId: list._id })
      .populate({
        path: "storyId",
        populate: { path: "authorId", select: "username displayName avatarUrl verification roles" },
      })
      .sort({ addedAt: -1 });

    res.json({
      list: { ...list.toObject(), storiesCount: items.length, isOwner },
      items: items.filter((item) => item.storyId).map((item) => ({ ...item.toObject(), story: item.storyId })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateList(req, res) {
  try {
    const list = await ReadingList.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: "Reading list not found" });
    if (list.ownerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not allowed" });

    ["name", "description", "isPublic"].forEach((key) => {
      if (req.body[key] !== undefined) list[key] = req.body[key];
    });
    await list.save();
    res.json({ list: await listWithCount(list) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteList(req, res) {
  try {
    const list = await ReadingList.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: "Reading list not found" });
    if (list.ownerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not allowed" });

    await ReadingListItem.deleteMany({ readingListId: list._id });
    await list.deleteOne();
    res.json({ message: "Reading list deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function addStory(req, res) {
  try {
    const list = await ReadingList.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: "Reading list not found" });
    if (list.ownerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not allowed" });

    const story = await Story.findById(req.body.storyId || req.params.storyId);
    if (!story) return res.status(404).json({ message: "Story not found" });

    const item = await ReadingListItem.findOneAndUpdate(
      { readingListId: list._id, storyId: story._id },
      { readingListId: list._id, storyId: story._id, addedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    list.updatedAt = new Date();
    await list.save();
    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function removeStory(req, res) {
  try {
    const list = await ReadingList.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: "Reading list not found" });
    if (list.ownerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not allowed" });

    await ReadingListItem.findOneAndDelete({ readingListId: list._id, storyId: req.params.storyId });
    res.json({ message: "Story removed from list" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
