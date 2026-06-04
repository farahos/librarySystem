import React, { useEffect, useState } from "react";
import { BookMarked, Clock, History, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import StoryCard from "./StoryCard";

const config = {
  bookmarks: {
    title: "Bookmarked Stories",
    endpoint: "/me/bookmarks",
    icon: BookMarked,
    empty: "No bookmarked stories yet.",
  },
  "continue-reading": {
    title: "Continue Reading",
    endpoint: "/me/continue-reading",
    icon: Clock,
    empty: "No reading progress yet.",
  },
  history: {
    title: "Reading History",
    endpoint: "/me/reading-history",
    icon: History,
    empty: "No reading history yet.",
  },
};

function readingProgress(item) {
  const percent = Math.min(Math.max(Math.round(Number(item.progressPercent ?? item.progress ?? 0)), 0), 100);
  const current = Number(item.currentChapterIndex || item.chapter?.chapterNumber || item.chapterNumber || 1);
  const total = Number(item.totalChapters || 0);
  const remaining = Number(item.remainingChapters ?? Math.max(total - current, 0));

  return { percent, current, total, remaining };
}

export default function LibraryPage({ type = "bookmarks" }) {
  const page = config[type] || config.bookmarks;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const Icon = page.icon;

  const loadItems = () => {
    setLoading(true);
    setError("");
    apiClient
      .get(page.endpoint)
      .then(({ data }) => setItems(data.items || []))
      .catch((err) => setError(err.response?.data?.message || "Could not load library"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, [page.endpoint]);

  const removeBookmark = async (storyId) => {
    await apiClient.delete(`/me/bookmarks/${storyId}`);
    setItems((current) => current.filter((item) => item.story._id !== storyId));
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600 text-white">
            <Icon size={24} />
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-orange-600">My Library</p>
            <h1 className="text-4xl font-black text-gray-950">{page.title}</h1>
          </div>
        </div>

        {loading && <p className="rounded-lg bg-white p-6 text-gray-500">Loading...</p>}
        {error && <p className="rounded-lg bg-red-50 p-6 font-bold text-red-700">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="rounded-lg bg-white p-6 text-gray-500">{page.empty}</p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const progress = readingProgress(item);
              const chapterNumber = item.chapter?.chapterNumber || item.chapterNumber || 1;
              const lastDate = item.lastOpenedAt || item.interaction?.createdAt;
              return (
              <div key={item.interaction?._id || item.story._id} className="space-y-3">
                <StoryCard story={item.story} />
                <div className="rounded-lg bg-white p-3 text-sm text-gray-600 shadow-sm">
                  {item.chapter && <p className="font-bold text-gray-900">Last read: {item.chapter.title}</p>}
                  {type === "continue-reading" && (
                    <>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-orange-600" style={{ width: `${progress.percent}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3 text-xs font-bold text-gray-500">
                        <span>{progress.percent}% complete</span>
                        {lastDate && <span>{new Date(lastDate).toLocaleDateString()}</span>}
                      </div>
                      {progress.total > 0 && (
                        <p className="mt-1 text-xs font-semibold text-gray-500">
                          Chapter {progress.current} of {progress.total} - {progress.remaining} left
                        </p>
                      )}
                      <Link
                        to={`/read/${item.story._id}/${chapterNumber}`}
                        className="mt-3 inline-flex rounded-lg bg-orange-600 px-3 py-2 font-black text-white hover:bg-orange-700"
                      >
                        Continue
                      </Link>
                    </>
                  )}
                  {type === "bookmarks" && (
                    <button
                      onClick={() => removeBookmark(item.story._id)}
                      className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-red-600"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </main>
  );
}
