import mongoose from "mongoose";

const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    storyId: { type: Schema.Types.ObjectId, ref: "Story", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    content: { type: String, required: true, trim: true, maxlength: 3000 },
    likes: { type: Number, default: 0 },
    status: { type: String, enum: ["visible", "removed", "flagged"], default: "visible" },
  },
  { timestamps: true }
);

CommentSchema.index({ chapterId: 1, createdAt: -1 });
CommentSchema.index({ storyId: 1 });
CommentSchema.index({ authorId: 1 });

export default mongoose.model("Comment", CommentSchema);
