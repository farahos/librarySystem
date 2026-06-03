import Notification from "../models/Notification.js";

export async function list(req, res) {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate("actorId", "username displayName avatarUrl")
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit || 50));
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function markRead(req, res) {
  try {
    await Notification.updateMany(
      { userId: req.user._id, ...(req.body.ids?.length ? { _id: { $in: req.body.ids } } : {}) },
      { read: true, readAt: new Date() }
    );
    res.json({ message: "Notifications marked read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
