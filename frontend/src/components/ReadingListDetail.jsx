import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiClient, authorProfilePath, formatCount } from "../lib/apiClient";
import StoryCard from "./StoryCard";
import { Avatar } from "./UserProfile";

export default function ReadingListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadList = () => {
    setLoading(true);
    setError("");
    apiClient
      .get(`/reading-lists/${listId}`)
      .then(({ data }) => {
        setList(data.list);
        setItems(data.items || []);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load reading list"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadList();
  }, [listId]);

  const removeStory = async (storyId) => {
    const confirmed = window.confirm("Remove this story from the list?");
    if (!confirmed) return;
    try {
      await apiClient.delete(`/reading-lists/${listId}/stories/${storyId}`);
      setItems((current) => current.filter((item) => item.story?._id !== storyId));
      setList((current) => ({ ...current, storiesCount: Math.max((current?.storiesCount || 1) - 1, 0) }));
      toast.success("Story removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove story");
    }
  };

  if (loading) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Loading reading list...</main>;
  if (error) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">{error}</main>;
  if (!list) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Reading list not found.</main>;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-7xl">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-orange-700">
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-orange-600">{list.isPublic ? "Public List" : "Private List"}</p>
              <h1 className="mt-2 text-4xl font-black text-gray-950">{list.name}</h1>
              <p className="mt-3 max-w-3xl text-gray-600">{list.description || "A Madal reading list."}</p>
            </div>
            <div className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-black text-orange-700">
              {formatCount(list.storiesCount || items.length || 0)} stories
            </div>
          </div>

          {list.ownerId && (
            <Link to={authorProfilePath(list.ownerId)} className="mt-5 inline-flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 hover:bg-orange-50">
              <Avatar profile={list.ownerId} />
              <span className="font-bold text-gray-900">{list.ownerId.displayName || list.ownerId.username}</span>
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-6 rounded-lg bg-white p-6 text-gray-500">No stories in this list yet.</p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item._id} className="space-y-3">
                <StoryCard story={item.story} />
                {list.isOwner && (
                  <button onClick={() => removeStory(item.story._id)} className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100">
                    <Trash2 size={15} />
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
