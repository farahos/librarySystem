import mongoose from "mongoose";

const { Schema } = mongoose;

const ModerationLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorRole: { type: String, enum: ["user", "verified_author", "moderator", "admin", "owner"] },
    action: { type: String, required: true, trim: true },
    targetType: {
      type: String,
      enum: ["story", "chapter", "comment", "user", "report", "verification", "featured_story"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ModerationLogSchema.index({ createdAt: -1 });
ModerationLogSchema.index({ actorId: 1, createdAt: -1 });
ModerationLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export default mongoose.model("ModerationLog", ModerationLogSchema);
