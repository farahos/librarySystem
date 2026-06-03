import User from "../models/User.js";
import Story from "../models/Story.js";
import Chapter from "../models/Chapter.js";
import Report from "../models/Report.js";
import Genre from "../models/Genre.js";
import VerificationRequest from "../models/VerificationRequest.js";
import Notification from "../models/Notification.js";

export async function analytics(req, res) {
  try {
    const [users, stories, chapters, openReports, pendingVerifications, topStories] = await Promise.all([
      User.countDocuments(),
      Story.countDocuments(),
      Chapter.countDocuments(),
      Report.countDocuments({ status: { $in: ["open", "in_review"] } }),
      VerificationRequest.countDocuments({ status: "pending" }),
      Story.find({ visibility: "public" })
        .select("title slug metrics featured original")
        .sort({ "metrics.reads": -1 })
        .limit(10),
    ]);

    res.json({ users, stories, chapters, openReports, pendingVerifications, topStories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listUsers(req, res) {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit || 100));
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateUser(req, res) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { role, enabled = true } = req.body;
    const update = enabled ? { $addToSet: { roles: role } } : { $pull: { roles: role } };
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function suspendUser(req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status || "suspended" },
      { new: true }
    ).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function featureStory(req, res) {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      {
        featured: {
          enabled: Boolean(req.body.enabled),
          slot: req.body.slot || "recommended",
          rank: Math.min(99, Math.max(1, Number(req.body.rank || 10))),
          until: req.body.until || null,
        },
        original: {
          enabled: Boolean(req.body.original),
          badgeText: req.body.badgeText || "Madal Original",
          contractRef: req.body.contractRef,
        },
      },
      { new: true, runValidators: true }
    );
    if (!story) return res.status(404).json({ message: "Story not found" });

    if (story.authorId && req.body.enabled) {
      await Notification.create({
        userId: story.authorId,
        actorId: req.user._id,
        type: "featured_story",
        payload: { storyId: story._id, title: story.title },
      });
    }

    res.json({ story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function verificationRequests(req, res) {
  try {
    const requests = await VerificationRequest.find(req.query.status ? { status: req.query.status } : {})
      .populate("userId", "username email displayName stats verification roles")
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function reviewVerification(req, res, status) {
  const request = await VerificationRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Verification request not found" });

  request.status = status;
  request.notes = req.body.notes;
  request.reviewerId = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  await User.findByIdAndUpdate(request.userId, {
    "verification.status": status === "approved" ? "verified" : "rejected",
    ...(status === "approved" ? { $addToSet: { roles: "verified_writer" } } : {}),
  });

  res.json({ request });
}

export async function approveVerification(req, res) {
  try {
    await reviewVerification(req, res, "approved");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function rejectVerification(req, res) {
  try {
    await reviewVerification(req, res, "rejected");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function adminGenres(req, res) {
  try {
    const genres = await Genre.find().sort({ sortOrder: 1, name: 1 });
    res.json({ genres });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAdminGenre(req, res) {
  try {
    const genre = await Genre.create(req.body);
    res.status(201).json({ genre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateAdminGenre(req, res) {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!genre) return res.status(404).json({ message: "Genre not found" });
    res.json({ genre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAdminGenre(req, res) {
  try {
    await Genre.findByIdAndDelete(req.params.id);
    res.json({ message: "Genre deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
