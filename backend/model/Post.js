import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null, // Cloudinary URL haddii la upload gareeyo
    },
    pdf: {
      type: String,
      default: null, // Cloudinary URL haddii la upload gareeyo
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin/user ID
    },
  },
  {
    timestamps: true, // createdAt & updatedAt otomaatig ah
  }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
