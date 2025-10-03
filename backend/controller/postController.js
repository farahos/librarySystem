import Post from "../model/Post.js";
import cloudinary from "../config/cloudinary.js";

/* =====================================================
   CREATE  (Admin Only)
   ===================================================== */
export const createPost = async (req, res) => {
  try {
    console.log("Tijaabo admin miya tahay")
    const { title, author, content } = req.body;
    if (!title || !author || !content) {
      return res.status(400).json({ message: "Title, author, and content are required" });
    }

    // Uploads
    let imageUrl = null;
    let pdfUrl = null;
    let audioUrl = null;

    if (req.files?.image) {
      const encodedImg = `data:${req.files.image[0].mimetype};base64,${req.files.image[0].buffer.toString("base64")}`;
      const imageResult = await cloudinary.uploader.upload(encodedImg, {
        resource_type: "image",
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      });
      imageUrl = imageResult.secure_url;
    }

    if (req.files?.pdf) {
      const encodedPdf = `data:application/pdf;base64,${req.files.pdf[0].buffer.toString("base64")}`;
      const pdfResult = await cloudinary.uploader.upload(encodedPdf, {
        resource_type: "raw",
        public_id: `post_pdf_${Date.now()}`,
      });
      pdfUrl = pdfResult.secure_url;
    }

    if (req.files?.audio) {
      const encodedAudio = `data:audio/mpeg;base64,${req.files.audio[0].buffer.toString("base64")}`;
      const audioResult = await cloudinary.uploader.upload(encodedAudio, {
        resource_type: "video",
        public_id: `post_audio_${Date.now()}`,
      });
      audioUrl = audioResult.secure_url;
    }

    const newPost = await Post.create({
      title,
      author,
      content,
      image: imageUrl,
      pdf: pdfUrl,
      audio: audioUrl,
      uploadedBy: req.user._id,
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* =====================================================
   READ  (All Users)
   ===================================================== */
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("uploadedBy", "username email role")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get single post
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "uploadedBy",
      "username email role"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* =====================================================
   UPDATE  (Admin Only & owner)
   ===================================================== */
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only the admin who created it can update
   if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { title, content } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;

    // Optional new uploads
    if (req.files?.image) {
      const encodedImg = `data:${req.files.image[0].mimetype};base64,${req.files.image[0].buffer.toString("base64")}`;
      const imageResult = await cloudinary.uploader.upload(encodedImg, {
        resource_type: "image",
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      });
      post.image = imageResult.secure_url;
    }

    if (req.files?.pdf) {
      const encodedPdf = `data:application/pdf;base64,${req.files.pdf[0].buffer.toString("base64")}`;
      const pdfResult = await cloudinary.uploader.upload(encodedPdf, {
        resource_type: "raw",
        public_id: `post_pdf_${Date.now()}`,
      });
      post.pdf = pdfResult.secure_url;
    }
    if (req.files?.audio) {
      const encodedAudio = `data:audio/mpeg;base64,${req.files.audio[0].buffer.toString("base64")}`;
      const audioResult = await cloudinary.uploader.upload(encodedAudio, {
        resource_type: "video",
        public_id: `post_audio_${Date.now()}`,
      });
      post.audio = audioResult.secure_url;
    }

    const updated = await post.save();
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* =====================================================
   DELETE  (Admin Only & owner)
   ===================================================== */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
