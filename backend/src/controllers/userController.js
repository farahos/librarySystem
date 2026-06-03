import Follow from "../models/Follow.js";
import ReadingList from "../models/ReadingList.js";
import ReadingListItem from "../models/ReadingListItem.js";
import Story from "../models/Story.js";
import User from "../models/User.js";

const usernamePattern = /^[a-z0-9_]{3,30}$/;

const profileAchievements = (user, stats) => {
  const badges = ["New Writer"];
  if (user.verification?.status === "verified") badges.push("Verified Author");
  if ((stats.totalReads || 0) >= 10000) badges.push("Rising Writer");
  if ((stats.topStoryReads || 0) >= 50000) badges.push("Top Story");
  return badges;
};

export async function profile(req, res) {
  try {
    const user = await User.findOne({ username: req.params.username, status: "active" }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const [followersCount, followingCount, storyStats, publishedStories, readingLists, isFollowing] = await Promise.all([
      Follow.countDocuments({ followeeId: user._id }),
      Follow.countDocuments({ followerId: user._id }),
      Story.aggregate([
        { $match: { authorId: user._id, visibility: "public" } },
        {
          $group: {
            _id: "$authorId",
            totalStories: { $sum: 1 },
            totalReads: { $sum: "$metrics.reads" },
            totalViews: { $sum: "$metrics.views" },
            totalLikes: { $sum: "$metrics.likes" },
            totalComments: { $sum: "$metrics.comments" },
            totalAudioListens: { $sum: "$metrics.audioListens" },
            topStoryReads: { $max: "$metrics.reads" },
          },
        },
      ]),
      Story.find({ authorId: user._id, visibility: "public" })
        .populate("authorId", "username displayName avatarUrl verification roles")
        .sort({ updatedAt: -1 })
        .lean(),
      ReadingList.find({ ownerId: user._id, isPublic: true }).sort({ updatedAt: -1 }).lean(),
      req.user?._id ? Follow.exists({ followerId: req.user._id, followeeId: user._id }) : null,
    ]);

    const stats = storyStats[0] || {};
    const listIds = readingLists.map((list) => list._id);
    const listCounts = listIds.length
      ? await ReadingListItem.aggregate([
          { $match: { readingListId: { $in: listIds } } },
          { $group: { _id: "$readingListId", storiesCount: { $sum: 1 } } },
        ])
      : [];
    const listCountMap = new Map(listCounts.map((item) => [item._id.toString(), item.storiesCount]));

    res.json({
      profile: {
        id: user._id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatarUrl,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        bio: user.bio || "",
        joinedAt: user.createdAt,
        followersCount,
        followingCount,
        totalStories: stats.totalStories || 0,
        totalReads: stats.totalReads || 0,
        totalViews: stats.totalViews || 0,
        totalLikes: stats.totalLikes || 0,
        totalComments: stats.totalComments || 0,
        totalAudioListens: stats.totalAudioListens || 0,
        achievements: profileAchievements(user, stats),
        isFollowing: Boolean(isFollowing),
        publishedStories,
        readingLists: readingLists.map((list) => ({
          ...list,
          storiesCount: listCountMap.get(list._id.toString()) || 0,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateMe(req, res) {
  try {
    const updates = {};
    const { displayName, username, bio, avatarUrl, coverUrl } = req.body;

    if (displayName !== undefined) updates.displayName = String(displayName).trim().slice(0, 80);
    if (avatarUrl !== undefined) updates.avatarUrl = String(avatarUrl).trim();
    if (coverUrl !== undefined) updates.coverUrl = String(coverUrl).trim();

    if (bio !== undefined) {
      const nextBio = String(bio).trim();
      if (nextBio.length > 500) return res.status(400).json({ message: "Bio must be 500 characters or less" });
      updates.bio = nextBio;
    }

    if (username !== undefined) {
      const nextUsername = String(username).trim().toLowerCase();
      if (!usernamePattern.test(nextUsername)) {
        return res.status(400).json({ message: "Username can only use lowercase letters, numbers, and underscores" });
      }

      const existing = await User.findOne({ username: nextUsername, _id: { $ne: req.user._id } });
      if (existing) return res.status(409).json({ message: "Username already exists" });
      updates.username = nextUsername;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        roles: user.roles,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        bio: user.bio,
        verification: user.verification,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
