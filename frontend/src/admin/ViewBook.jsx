import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient, storyAuthor, storyCover } from "../lib/apiClient";

const ViewBook = () => {
  const [stories, setStories] = useState([]);

  const fetchStories = async () => {
    const { data } = await apiClient.get("/stories", { params: { includePrivate: "true", limit: 100 } });
    setStories(data.stories || []);
  };

  const archiveStory = async (id) => {
    if (!window.confirm("Archive this story?")) return;
    await apiClient.delete(`/stories/${id}`);
    setStories((current) => current.filter((story) => story._id !== id));
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Admin</p>
            <h1 className="text-4xl font-black text-gray-950">Stories</h1>
          </div>
          <Link to="/addbook" className="rounded-lg bg-orange-600 px-4 py-3 font-black text-white">
            New Story
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <article key={story._id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <img src={storyCover(story)} alt={story.title} className="aspect-[2/3] w-full object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-black text-gray-950">{story.title}</h3>
                <p className="mt-1 text-sm font-semibold text-gray-500">{storyAuthor(story)}</p>
                <p className="mt-3 line-clamp-3 text-sm text-gray-600">{story.description}</p>
                <div className="mt-4 flex gap-2">
                  <Link to={`/story/${story.slug}`} className="flex-1 rounded-lg bg-gray-950 px-3 py-2 text-center text-sm font-bold text-white">
                    View
                  </Link>
                  <button onClick={() => archiveStory(story._id)} className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white">
                    Archive
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ViewBook;
