import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[a-z0-9_]{3,30}$/i,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    displayName: { type: String, trim: true },
    bio: { type: String, maxlength: 500 },
    avatarUrl: { type: String },
    coverUrl: { type: String },
    roles: {
      type: [String],
      enum: ["user", "verified_author", "moderator", "admin", "owner"],
      default: ["user"],
    },
    verification: {
      status: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none",
      },
      verifiedAt: { type: Date },
    },
    socialLinks: {
      website: String,
      facebook: String,
      instagram: String,
      tiktok: String,
      x: String,
      youtube: String,
    },
    stats: {
      followers: { type: Number, default: 0 },
      following: { type: Number, default: 0 },
      storiesCount: { type: Number, default: 0 },
      totalReads: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
    },
    preferences: {
      genres: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
      language: { type: String, default: "so" },
      audioSpeed: { type: Number, default: 1 },
      darkMode: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["active", "warned", "suspended", "banned"],
      default: "active",
    },
    discipline: {
      warnings: [
        {
          reason: String,
          moderatorId: { type: Schema.Types.ObjectId, ref: "User" },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      suspension: {
        reason: String,
        moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
        startDate: Date,
        endDate: Date,
        permanent: { type: Boolean, default: false },
      },
    },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ roles: 1, "verification.status": 1 });

export default mongoose.model("User", UserSchema);
