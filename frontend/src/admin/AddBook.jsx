import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddBook = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [audio, setAudio] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("content", content);
    if (image) formData.append("image", image);
    if (pdf) formData.append("pdf", pdf);
    if (audio) formData.append("audio", audio);

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/post/createPost", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/posts");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to create post");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Create Post
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <input
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Author */}
          <input
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />

          {/* Content */}
          <textarea
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300 resize-none"
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            required
          />

          {/* Image Input & Preview */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Upload Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
            {imagePreview && (
              <div className="mt-3 flex justify-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-xl border-2 border-indigo-300 shadow-lg"
                />
              </div>
            )}
          </div>

          {/* PDF Input */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Upload PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdf(e.target.files[0])}
              className="w-full"
            />
            {pdf && (
              <p className="mt-2 text-gray-600 font-medium">
                Selected file: {pdf.name}
              </p>
            )}

          </div>
          {/* Audio Input */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Upload Audio
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudio(e.target.files[0])}
              className="w-full"
            />
            {audio && (
              <p className="mt-2 text-gray-600 font-medium">
                Selected file: {audio.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-bold text-lg hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;

