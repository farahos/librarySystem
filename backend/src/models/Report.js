import mongoose from "mongoose";

const { Schema } = mongoose;

const ReportSchema = new Schema(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["story", "chapter", "comment", "user"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: {
      type: String,
      enum: ["spam", "abuse", "copyright", "adult_content", "hate", "other"],
      default: "other",
    },
    details: { type: String, maxlength: 3000 },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "rejected"],
      default: "open",
    },
    adminAction: {
      type: {
        type: String,
        enum: ["warning", "content_removal", "suspension", "ban", "none"],
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
