import mongoose from "mongoose";

const { Schema } = mongoose;

const EventSchema = new Schema(
  {
    type: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    targetType: { type: String },
    targetId: { type: Schema.Types.ObjectId },
    payload: { type: Object },
    occurredAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

EventSchema.index({ type: 1, occurredAt: -1 });
EventSchema.index({ userId: 1, occurredAt: -1 });

export default mongoose.model("Event", EventSchema);
