import mongoose from "mongoose";

const { Schema } = mongoose;

const GenreSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, maxlength: 1000 },
    parent: { type: Schema.Types.ObjectId, ref: "Genre", default: null },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 100 },
  },
  { timestamps: true }
);

GenreSchema.index({ active: 1, sortOrder: 1 });

export default mongoose.model("Genre", GenreSchema);
