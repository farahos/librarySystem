import mongoose from "mongoose";

const { Schema } = mongoose;

const FeaturedStorySchema = new Schema(
  {
    storyId: { type: Schema.Types.ObjectId, ref: "Story", required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    featuredBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slot: {
      type: String,
      enum: ["trending", "new", "recommended", "weekly", "originals", "writers"],
      default: "recommended",
    },
    rank: { type: Number, default: 10, min: 1, max: 99 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

FeaturedStorySchema.index({ storyId: 1, active: 1 });
FeaturedStorySchema.index({ active: 1, startDate: 1, endDate: 1, rank: 1 });

export default mongoose.model("FeaturedStory", FeaturedStorySchema);
