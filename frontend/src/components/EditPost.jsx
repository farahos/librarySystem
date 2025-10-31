import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      const { data } = await axios.get(`https://dhaxalbook.onrender.com/api/post/getPosts`);
      const found = data.find((p) => p._id === id);
      if (found) {
        setTitle(found.title);
        setAuthor(found.author);
        setContent(found.content);
      }
    };
    loadPost();
  }, [id]);

  const handleUpdate = async (e) => {
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
      await axios.put(`/api/post/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/posts");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Update failed");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2 rounded"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files[0])} />
        <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files[0])} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
      </form>
    </div>
  );
};

export default EditPost;
