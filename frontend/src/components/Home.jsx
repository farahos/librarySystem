import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import { Link } from "react-router-dom";

const Home = () => {
  const [posts, setPosts] = useState([]);

  // Fetch all posts
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

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    pauseOnHover: true,
  };

  // Only posts with an image for banner
  const imagePosts = posts.filter((p) => p.image);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* ✅ Banner/Slider */}
      {imagePosts.length > 0 && (
        <div className="mb-12">
          <Slider {...settings}>
            {imagePosts.map((p) => (
              <div key={p._id}>
                <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {p.title}
                    </h2>
                    <p className="text-white/80 text-sm max-w-2xl line-clamp-3">
                      {p.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}

      {/* ✅ All Posts Section */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
        All Posts
      </h1>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link
            to={`/post/${p._id}`}
            key={p._id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden
                       hover:shadow-xl transition-shadow duration-300 h-[650px] flex flex-col cursor-pointer"
          >
            {p.image && (
              <div className="h-[350px] w-full overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
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
              {p.pdf && (
                <span className="mt-2 text-indigo-600 dark:text-indigo-400 underline">
                  Download PDF
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
