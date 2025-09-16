// Post.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Post = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null); // show PDF file name
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);
    if (pdf) formData.append("pdf", pdf);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/api/post/createPost", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 201) {
        navigate("/posts");
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    setPdf(file);
    setPdfPreview(file ? file.name : null);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          ✍️ Create Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter post title..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows="4"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Write your content..."
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-600 border rounded-xl p-2 cursor-pointer"
            />

            {imagePreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl border"
                />
              </div>
            )}
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfChange}
              className="w-full text-sm text-gray-600 border rounded-xl p-2 cursor-pointer"
            />
            {pdfPreview && (
              <p className="mt-2 text-sm text-gray-500">
                Selected PDF: {pdfPreview}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition duration-300"
          >
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default Post;
