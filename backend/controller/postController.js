import Post from "../model/Post.js";
import cloudinary from "../config/cloudinary.js";

export const createPost = async (req, res) => {
  try {
    const currentUser = req.user._id;
    const { title, content } = req.body;

    let imageUrl = null;
    let pdfUrl = null;

    // Upload image to Cloudinary
    if (req.files?.image) {
      const encode_image = `data:image/jpg;base64,${req.files.image[0].buffer.toString('base64')}`;
      const imageResult = await cloudinary.uploader.upload(encode_image, {
        resource_type: "image",
        transformation: [{ width: 500, height: 500, crop: "limit" }],
        encoding: "base64"
      });
      imageUrl = imageResult.secure_url;
    }

    // Upload PDF to Cloudinary
    if (req.files?.pdf) {
      const encode_pdf = `data:application/pdf;base64,${req.files.pdf[0].buffer.toString('base64')}`;
      const pdfResult = await cloudinary.uploader.upload(encode_pdf, {
        resource_type: "raw", // PDF = raw
        encoding: "base64",
        public_id: `post_pdf_${Date.now()}`
      });
      pdfUrl = pdfResult.secure_url;
    }

    // Save new Post
    const newPost = new Post({
      title,
      content,
      image: imageUrl,
      pdf: pdfUrl,
      author: currentUser
    });

    await newPost.save();
    res.status(201).json(newPost);

  } catch (error) {
    console.error("Error while creating post", error);
    res.status(400).json({ message: error.message });
  }
};
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "username email").sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error while fetching posts", error);
    res.status(500).json({ message: "Server Error" });
  } 
};
