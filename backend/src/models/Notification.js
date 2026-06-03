import mongoose from "mongoose";

const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [
        "new_chapter",
        "new_follower",
        "story_like",
        "chapter_comment",
        "verification_approved",
        "verification_rejected",
        "featured_story",
        "moderation_action",
      ],
      required: true,
    },
    payload: { type: Object },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

export default mongoose.model("Notification", NotificationSchema);
