import mongoose from "mongoose";

const { Schema } = mongoose;

const ReadingListSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500 },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReadingListSchema.index({ ownerId: 1, isPublic: 1, updatedAt: -1 });

export default mongoose.model("ReadingList", ReadingListSchema);
