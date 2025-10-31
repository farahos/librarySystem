// src/components/MyBook.jsx
import React, { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import { Link } from "react-router-dom";
import axios from "axios";

const MyBook = () => {
  const { user } = useUser();
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavoritePosts = async () => {
      if (!user?.favorites?.length) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch details for each favorite post
        const posts = await Promise.all(
          user.favorites.map(async (postId) => {
            try {
              const { data } = await axios.get(`/api/post/getPost/${postId}`);
              return data;
            } catch (err) {
              console.error(`Error fetching post ${postId}:`, err);
              return null;
            }
          })
        );
        
        // Filter out any failed requests
        setFavoritePosts(posts.filter(post => post !== null));
      } catch (err) {
        console.error("Error fetching favorite posts:", err);
        setError("Failed to load favorite posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritePosts();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 p-6 rounded-2xl mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="font-semibold">Please login to view your favorite books</p>
          </div>
          <Link
            to="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading your favorite books...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            My Favorite Books
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your personal collection of loved books and stories
          </p>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        {/* Favorite Posts Grid */}
        {favoritePosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No favorites yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Start exploring books and add them to your favorites by clicking the heart icon.
              </p>
              <Link
                to="/Books"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 inline-block"
              >
                Explore Books
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoritePosts.map((post) => (
              <div 
                key={post._id} 
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2"
              >
                {post.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm">
                      by {post.uploadedBy?.username || "Unknown"}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-6">
                    {post.content}
                  </p>

                  <Link
                    to={`/post/${post._id}`}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 text-center block"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBook;