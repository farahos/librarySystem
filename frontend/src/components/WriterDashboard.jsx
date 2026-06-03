import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/apiClient";

export default function WriterDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get("/writer/dashboard")
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || "Writer dashboard unavailable"));
  }, []);

  if (error) return <main className="min-h-screen bg-gray-50 p-8 text-red-700">{error}</main>;
  if (!data) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Loading writer dashboard...</main>;

  const stats = [
    ["Stories", data.totalStories],
    ["Chapters", data.totalChapters],
    ["Reads", data.totalReads],
    ["Likes", data.totalLikes],
    ["Bookmarks", data.totalBookmarks],
    ["Followers", data.totalFollowers],
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Writer Studio</p>
            <h1 className="text-4xl font-black text-gray-950">Dashboard</h1>
          </div>
          <Link to="/create" className="rounded-lg bg-orange-600 px-4 py-3 font-black text-white">New Story</Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-3xl font-black text-gray-950">{value || 0}</p>
              <p className="text-sm font-bold text-gray-500">{label}</p>
            </div>
          ))}
        </div>
        <section className="mt-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-gray-950">Recent Comments</h2>
          <div className="mt-4 space-y-3">
            {data.recentComments?.map((comment) => (
              <div key={comment._id} className="rounded-lg bg-gray-50 p-3">
                <p className="font-bold">{comment.authorId?.username || "Reader"} on {comment.storyId?.title}</p>
                <p className="text-gray-600">{comment.content}</p>
              </div>
            ))}
            {data.recentComments?.length === 0 && <p className="text-gray-500">No comments yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
