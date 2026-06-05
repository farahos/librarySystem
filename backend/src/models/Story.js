import mongoose from "mongoose";

const { Schema } = mongoose;

const StorySchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    coverUrl: { type: String },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: [
        "romance",
        "horror",
        "history",
        "drama",
        "mystery",
        "fantasy",
        "action",
        "comedy",
        "islamic",
        "poetry",
        "short-stories",
      ],
      required: true,
    },
    genres: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
    tags: [{ type: String, trim: true, lowercase: true }],
    language: { type: String, default: "so" },
    status: { type: String, enum: ["ongoing", "completed", "hiatus"], default: "ongoing" },
    visibility: { type: String, enum: ["public", "private", "hidden", "archived"], default: "private" },
    moderationStatus: {
      type: String,
      enum: ["clean", "flagged", "hidden", "archived"],
      default: "clean",
    },
    moderationScore: { type: Number, default: 0, min: 0, max: 100 },
    moderationFlags: [{ type: String }],
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderatedAt: { type: Date },
    moderationReason: { type: String },
    publishing: {
      publishedAt: { type: Date },
      scheduledFor: { type: Date },
    },
    metrics: {
      views: { type: Number, default: 0 },
      reads: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      audioListens: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
    },
    featured: {
      enabled: { type: Boolean, default: false },
      slot: {
        type: String,
        enum: ["trending", "new", "recommended", "weekly", "originals", "writers"],
        default: "recommended",
      },
      rank: { type: Number, default: 10, min: 1, max: 99 },
      until: { type: Date },
    },
    original: {
      enabled: { type: Boolean, default: false },
      badgeText: { type: String, default: "Madal Original" },
      contractRef: { type: String },
    },
  },
  { timestamps: true }
);

StorySchema.index({ authorId: 1, createdAt: -1 });
StorySchema.index({ category: 1, visibility: 1, createdAt: -1 });
StorySchema.index({ genres: 1, "featured.enabled": 1 });
StorySchema.index(
  { title: "text", description: "text", tags: "text" },
  { default_language: "none", language_override: "searchLanguage" }
);

export default mongoose.model("Story", StorySchema);
