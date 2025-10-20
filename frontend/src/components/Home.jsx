import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import { Link } from "react-router-dom";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      const { data } = await axios.get("/api/post/getPosts");
      setPosts(data);
      setFilteredPosts(data);
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter posts based on search and category
  useEffect(() => {
    let results = posts;

    // Search filter
    if (searchTerm) {
      results = results.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.uploadedBy?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (activeCategory !== "all") {
      results = results.filter(post => {
        switch (activeCategory) {
          case "with-pdf":
            return post.pdf;
          case "with-audio":
            return post.audio;
          case "with-images":
            return post.image;
          default:
            return true;
        }
      });
    }

    setFilteredPosts(results);
  }, [searchTerm, activeCategory, posts]);

  // Slider settings for desktop
  const desktopSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    pauseOnHover: true,
    adaptiveHeight: true,
  };

  // Slider settings for mobile
  const mobileSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    pauseOnHover: false,
    adaptiveHeight: true,
  };

  // Categories for filtering
  const categories = [
    { id: "all", label: "All Posts", count: posts.length },
  
    { id: "with-pdf", label: "With PDF", count: posts.filter(p => p.pdf).length },
    { id: "with-audio", label: "With Audio", count: posts.filter(p => p.audio).length },
  ];

  // Only posts with an image for banner
  const imagePosts = posts.filter((p) => p.image);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Skeleton Banner */}
          <div className="mb-12">
            <div className="h-80 sm:h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
          </div>
          
          {/* Skeleton Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse max-w-md"></div>
            <div className="flex space-x-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-24"></div>
              ))}
            </div>
          </div>

          {/* Skeleton Posts */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
            All Posts
          </h1>
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ✅ Banner/Slider */}
        {imagePosts.length > 0 && (
          <div className="mb-8 sm:mb-12">
            {/* Desktop Slider */}
            <div className="hidden sm:block">
              <Slider {...desktopSettings}>
                {imagePosts.map((p) => (
                  <div key={p._id}>
                    <Link to={`/post/${p._id}`} className="block">
                      <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8">
                          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 line-clamp-2">
                            {p.title}
                          </h2>
                          <p className="text-white/80 text-sm sm:text-base max-w-2xl line-clamp-2 sm:line-clamp-3">
                            {p.content}
                          </p>
                          <div className="flex items-center mt-3 text-white/60 text-sm">
                            <span>By {p.uploadedBy?.username || "Unknown"}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </Slider>
            </div>
            
            {/* Mobile Slider */}
            <div className="sm:hidden">
              <Slider {...mobileSettings}>
                {imagePosts.slice(0, 3).map((p) => (
                  <div key={p._id}>
                    <Link to={`/post/${p._id}`} className="block">
                      <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                          <h2 className="text-lg font-bold text-white mb-1 line-clamp-2">
                            {p.title}
                          </h2>
                          <div className="flex items-center text-white/60 text-xs">
                            <span>By {p.uploadedBy?.username || "Unknown"}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        )}

        {/* ✅ Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search posts, authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeCategory === category.id
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {category.label}
                  <span className="ml-1 text-xs opacity-75">({category.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ✅ All Posts Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {searchTerm || activeCategory !== "all" ? "Search Results" : "All Posts"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {searchTerm || activeCategory !== "all" 
                  ? `Found ${filteredPosts.length} posts matching your criteria`
                  : `Discover ${filteredPosts.length} amazing stories and insights`
                }
              </p>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? "No posts found" : "No posts yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? "Try adjusting your search terms or filters"
                  : "Be the first to share your story!"
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("all");
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((p) => (
              <Link
                to={`/post/${p._id}`}
                key={p._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden
                           hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer
                           border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600
                           group"
              >
                {/* Post Image */}
                {p.image && (
                  <div className="h-48 sm:h-56 w-full overflow-hidden relative">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 flex space-x-1">
                      {p.pdf && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg">
                          PDF
                        </span>
                      )}
                      {p.audio && (
                        <span className="bg-purple-500 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg">
                          Audio
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Post Content */}
                <div className="p-4 sm:p-6 flex flex-col flex-1">
                  {/* Title and Author */}
                  <div className="mb-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      {p.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>By {p.uploadedBy?.username || p.author || "Unknown"}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="flex-1 mb-4">
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base line-clamp-3 leading-relaxed">
                      {p.content}
                    </p>
                  </div>

                  {/* Media Indicators and Read More */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      {/* PDF Indicator */}
                      {p.pdf && (
                        <div className="flex items-center text-gray-400 group/tooltip relative" title="Contains PDF">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Audio Indicator */}
                      {p.audio && (
                        <div className="flex items-center text-gray-400 group/tooltip relative" title="Contains Audio">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a9 9 0 010 12m-4.5-9.5L12 3v18l-4.5-4.5H4a1 1 0 01-1-1v-7a1 1 0 011-1h3.5z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Read More CTA */}
                    <div className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform duration-200">
                      Read more
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;