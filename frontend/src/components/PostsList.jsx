// PostsList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PostsList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/post/getPosts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setPosts(response.data);
        }
      } catch (error) {
        console.error("Error while fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">📌 Posts</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
          >
            {/* Cover Image */}
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
            )}

            {/* Content */}
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {post.title}
              </h2>
              <p className="text-gray-600 line-clamp-3">{post.content}</p>

              {/* PDF Viewer */}
              {post.pdf && (
                <div className="mt-4 border rounded-lg">
                  <iframe
                    src={post.pdf}
                    width="100%"
                    height="400px"
                    title={`PDF of ${post.title}`}
                    className="rounded-lg"
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostsList;
