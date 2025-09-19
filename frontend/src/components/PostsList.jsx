import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const token = localStorage.getItem("token");

  const fetchPosts = async () => {
    const { data } = await axios.get("/api/post/getPosts");
    setPosts(data);
  };

  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`/api/post/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Delete failed");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          All Posts
        </h1>
        <Link
          to="/create"
          className="bg-gradient-to-r from-green-600 to-emerald-500 
                     text-white px-5 py-2 rounded-xl shadow hover:scale-105 
                     transition-transform duration-200"
        >
          + New Post
        </Link>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <div
            key={p._id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden
                       hover:shadow-xl transition-shadow duration-300 h-[650px] flex flex-col"
          >
            {/* Image part - taller like a book cover */}
            {p.image && (
              <div className="h-[350px] w-full overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content part */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {p.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Author: {p.author}
              </p>
              <p className="text-gray-700 dark:text-gray-200 mb-3 flex-1 overflow-hidden">
                {p.content}
              </p>

              {/* PDF download */}
              {p.pdf && (
                <a
                  href={p.pdf}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-indigo-600 dark:text-indigo-400 underline"
                >
                  Download PDF
                </a>
              )}

              {/* Edit & Delete Buttons */}
              <div className="mt-4 flex gap-3">
                <Link
                  to={`/edit/${p._id}`}
                  className="flex-1 text-center bg-yellow-500 hover:bg-yellow-600
                             text-white px-3 py-2 rounded-lg transition-colors duration-200"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deletePost(p._id)}
                  className="flex-1 text-center bg-red-600 hover:bg-red-700
                             text-white px-3 py-2 rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostsList;
