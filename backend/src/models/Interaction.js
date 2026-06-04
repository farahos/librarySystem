import mongoose from "mongoose";

const { Schema } = mongoose;

const InteractionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["story", "chapter", "comment"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    action: {
      type: String,
      enum: ["like", "bookmark", "read", "listen", "share"],
      required: true,
    },
    metadata: {
      progress: Number,
      progressPercent: Number,
      chapterId: Schema.Types.ObjectId,
      chapterNumber: Number,
      currentChapterIndex: Number,
      totalChapters: Number,
      remainingChapters: Number,
      source: String,
    },
  },
  { timestamps: true }
);

InteractionSchema.index(
  { userId: 1, targetType: 1, targetId: 1, action: 1 },
  { unique: true }
);
InteractionSchema.index({ targetType: 1, targetId: 1, action: 1 });

export default mongoose.model("Interaction", InteractionSchema);
