import React from "react";
import StoryCard from "./StoryCard";

const FeaturedCarousel = ({ posts = [] }) => {
  return (
    <div className="w-full overflow-x-auto py-6">
      <div className="flex gap-4 px-4 sm:px-6 lg:px-8">
        {posts.map((story) => (
          <div key={story._id} className="w-64 flex-shrink-0">
            <StoryCard story={story} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCarousel;
