import VerificationRequest from "../models/VerificationRequest.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

export async function requestVerification(req, res) {
  try {
    const request = await VerificationRequest.create({
      userId: req.user._id,
      evidence: req.body.evidence || [],
      qualityNotes: req.body.qualityNotes,
    });

    await User.findByIdAndUpdate(req.user._id, { "verification.status": "pending" });
    res.status(201).json({ request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function list(req, res) {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const requests = await VerificationRequest.find(filter)
      .populate("userId", "username email displayName stats")
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function review(req, res) {
  try {
    const request = await VerificationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Verification request not found" });

    request.status = req.body.status;
    request.notes = req.body.notes;
    request.reviewerId = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    const verified = req.body.status === "approved";
    const userUpdate = {
      verification: {
        status: verified ? "verified" : "rejected",
        verifiedAt: verified ? new Date() : undefined,
      },
    };
    if (verified) userUpdate.$addToSet = { roles: "verified_writer" };
    await User.findByIdAndUpdate(request.userId, userUpdate);

    await Notification.create({
      userId: request.userId,
      actorId: req.user._id,
      type: verified ? "verification_approved" : "verification_rejected",
      payload: { notes: request.notes },
    });

    res.json({ request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
