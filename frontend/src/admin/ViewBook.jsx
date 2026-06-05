import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient, storyAuthor, storyCover } from "../lib/apiClient";

const ViewBook = () => {
  const [stories, setStories] = useState([]);

  const fetchStories = async () => {
    const { data } = await apiClient.get("/stories", { params: { includePrivate: "true", limit: 100 } });
    setStories(data.stories || []);
  };

  const moderateStory = async (story, action) => {
    await apiClient.patch(`/admin/stories/${story._id}/moderate`, {
      action,
      reason: `Story ${action} from admin stories page`,
    });
    fetchStories();
  };

  const featureStory = async (story, enabled) => {
    await apiClient.patch(`/admin/stories/${story._id}/feature`, {
      enabled,
      slot: story.featured?.slot || "recommended",
      rank: story.featured?.rank || 10,
    });
    fetchStories();
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Admin</p>
            <h1 className="text-4xl font-black text-gray-950">Stories</h1>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <article key={story._id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <img src={storyCover(story)} alt={story.title} className="aspect-[2/3] w-full object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-black text-gray-950">{story.title}</h3>
                <p className="mt-1 text-sm font-semibold text-gray-500">{storyAuthor(story)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-black text-gray-700">{story.visibility}</span>
                  {story.featured?.enabled && <span className="rounded-lg bg-orange-100 px-2 py-1 text-xs font-black text-orange-700">featured</span>}
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-gray-600">{story.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link to={`/story/${story.slug}`} className="rounded-lg bg-gray-950 px-3 py-2 text-center text-sm font-bold text-white">
                    View
                  </Link>
                  <button onClick={() => moderateStory(story, "hide")} className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-bold text-white">
                    Hide
                  </button>
                  <button onClick={() => moderateStory(story, "restore")} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white">
                    Restore
                  </button>
                  <button onClick={() => moderateStory(story, "archive")} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-bold text-white">
                    Archive
                  </button>
                  <button onClick={() => featureStory(story, !story.featured?.enabled)} className="col-span-2 rounded-lg bg-orange-600 px-3 py-2 text-sm font-bold text-white">
                    {story.featured?.enabled ? "Remove Featured" : "Feature Story"}
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
