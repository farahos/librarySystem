import mongoose from "mongoose";

const { Schema } = mongoose;

const VerificationRequestSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    evidence: [{ type: String }],
    qualityNotes: { type: String },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

VerificationRequestSchema.index({ userId: 1, status: 1 });
VerificationRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("VerificationRequest", VerificationRequestSchema);
