import Follow from "../models/Follow.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

export async function follow(req, res) {
  try {
    const followeeId = req.params.userId;
    if (followeeId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const existing = await Follow.findOne({ followerId: req.user._id, followeeId });
    if (existing) return res.json({ message: "Already following" });

    await Follow.create({ followerId: req.user._id, followeeId });

    await Promise.all([
      User.findByIdAndUpdate(req.user._id, { $inc: { "stats.following": 1 } }),
      User.findByIdAndUpdate(followeeId, { $inc: { "stats.followers": 1 } }),
      Notification.create({
        userId: followeeId,
        actorId: req.user._id,
        type: "new_follower",
        payload: { followerId: req.user._id },
      }),
    ]);

    res.json({ message: "Followed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function unfollow(req, res) {
  try {
    const followeeId = req.params.userId;
    const deleted = await Follow.findOneAndDelete({ followerId: req.user._id, followeeId });
    if (deleted) {
      await Promise.all([
        User.findByIdAndUpdate(req.user._id, { $inc: { "stats.following": -1 } }),
        User.findByIdAndUpdate(followeeId, { $inc: { "stats.followers": -1 } }),
      ]);
    }
    res.json({ message: "Unfollowed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function followers(req, res) {
  try {
    const items = await Follow.find({ followeeId: req.params.userId })
      .populate("followerId", "username displayName avatarUrl")
      .sort({ createdAt: -1 });
    res.json({ followers: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function following(req, res) {
  try {
    const items = await Follow.find({ followerId: req.params.userId })
      .populate("followeeId", "username displayName avatarUrl")
      .sort({ createdAt: -1 });
    res.json({ following: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
