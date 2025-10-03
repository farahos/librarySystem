import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`/api/post/getPost/${id}`);
        setPost(data);
      } catch (err) {
        console.error(err.response?.data || err);
        alert("Failed to fetch post details");
      }
    };
    fetchPost();
  }, [id]);

  if (!post) {
    return <p className="p-6">Loading…</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-96 object-cover rounded-2xl mb-6"
        />
      )}
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {post.title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Author: {post.author}
      </p>
      <p className="text-gray-800 dark:text-gray-200 mb-6 whitespace-pre-line">
        {post.content}
      </p>
      {post.pdf && (
        <a
          href={post.pdf}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-600 dark:text-indigo-400 underline"
        >
          Download PDF
        </a>
      )}
    </div>
  );
};

export default PostDetail;
