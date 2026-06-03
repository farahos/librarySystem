import Report from "../models/Report.js";

export async function create(req, res) {
  try {
    const report = await Report.create({
      ...req.body,
      reporterId: req.user._id,
    });
    res.status(201).json({ report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function list(req, res) {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const reports = await Report.find(filter)
      .populate("reporterId", "username email")
      .sort({ createdAt: -1 });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function resolve(req, res) {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status || "resolved",
        adminAction: {
          type: req.body.action || "none",
          notes: req.body.notes,
          moderatorId: req.user._id,
          resolvedAt: new Date(),
        },
      },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
