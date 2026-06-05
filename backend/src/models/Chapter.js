import mongoose from "mongoose";

const { Schema } = mongoose;

const ChapterSchema = new Schema(
  {
    storyId: { type: Schema.Types.ObjectId, ref: "Story", required: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    content: { type: String, required: true },
    chapterNumber: { type: Number, required: true, min: 1 },
    readingTime: { type: Number, default: 1 },
    audio: {
      source: { type: String, enum: ["ai", "upload", "none"], default: "none" },
      url: String,
      duration: Number,
      size: Number,
      format: String,
    },
    status: { type: String, enum: ["draft", "published", "scheduled"], default: "draft" },
    visibility: { type: String, enum: ["public", "hidden"], default: "public" },
    moderationStatus: {
      type: String,
      enum: ["clean", "flagged", "hidden"],
      default: "clean",
    },
    moderationScore: { type: Number, default: 0, min: 0, max: 100 },
    moderationFlags: [{ type: String }],
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderatedAt: { type: Date },
    moderationReason: { type: String },
    publishDate: { type: Date },
    scheduledFor: { type: Date },
    metrics: {
      views: { type: Number, default: 0 },
      reads: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
      audioListens: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

ChapterSchema.index({ storyId: 1, chapterNumber: 1 }, { unique: true });
ChapterSchema.index({ status: 1, publishDate: -1 });

export default mongoose.model("Chapter", ChapterSchema);
