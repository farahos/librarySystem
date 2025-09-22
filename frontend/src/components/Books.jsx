import React, { useEffect, useState } from "react";
import axios from "axios";

const Books = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get("/api/post/getPosts");
      setPosts(data);
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to fetch posts");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-900 mb-8">
        All Posts
      </h1>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <div
            key={p._id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden
                       hover:shadow-xl transition-shadow duration-300 h-[650px] flex flex-col"
          >
            {/* Image part */}
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

              {/* PDF download only */}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Books;

