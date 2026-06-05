import mongoose from "mongoose";

const { Schema } = mongoose;

const ReportSchema = new Schema(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User" },
    source: { type: String, enum: ["user", "automatic"], default: "user" },
    targetType: { type: String, enum: ["story", "chapter", "comment", "user"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: {
      type: String,
      enum: [
        "sexual_content",
        "harassment",
        "hate_speech",
        "violence",
        "spam",
        "copyright",
        "impersonation",
        "other",
      ],
      default: "other",
    },
    description: { type: String, maxlength: 3000 },
    details: { type: String, maxlength: 3000 },
    status: {
      type: String,
      enum: ["pending", "dismissed", "action_taken", "escalated"],
      default: "pending",
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reportCount: { type: Number, default: 1 },
    adminAction: {
      type: {
        type: String,
        enum: ["dismiss", "warn_user", "hide_content", "delete_comment", "suspend_user", "ban_user", "escalate", "none"],
        default: "none",
      },
      notes: String,
      moderatorId: { type: Schema.Types.ObjectId, ref: "User" },
      resolvedAt: Date,
    },
  },
  { timestamps: true }
);

ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ targetType: 1, targetId: 1 });

export default mongoose.model("Report", ReportSchema);
