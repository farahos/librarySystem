import mongoose from "mongoose";

const { Schema } = mongoose;

const AudioFileSchema = new Schema(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter" },
    storyId: { type: Schema.Types.ObjectId, ref: "Story", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    source: { type: String, enum: ["ai", "upload"], required: true },
    provider: { type: String },
    storageKey: { type: String },
    url: { type: String, required: true },
    duration: { type: Number },
    size: { type: Number },
    format: { type: String },
    status: { type: String, enum: ["processing", "ready", "failed"], default: "ready" },
  },
  { timestamps: true }
);

AudioFileSchema.index({ chapterId: 1 });
AudioFileSchema.index({ storyId: 1, createdAt: -1 });

export default mongoose.model("AudioFile", AudioFileSchema);
