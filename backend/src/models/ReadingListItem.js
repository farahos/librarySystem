import mongoose from "mongoose";

const { Schema } = mongoose;

const ReadingListItemSchema = new Schema(
  {
    readingListId: { type: Schema.Types.ObjectId, ref: "ReadingList", required: true },
    storyId: { type: Schema.Types.ObjectId, ref: "Story", required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ReadingListItemSchema.index({ readingListId: 1, storyId: 1 }, { unique: true });

export default mongoose.model("ReadingListItem", ReadingListItemSchema);
