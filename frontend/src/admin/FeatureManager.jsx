import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, Save, Search, Sparkles, X } from "lucide-react";
import { apiClient, storyAuthor, storyCover } from "../lib/apiClient";

export default function FeatureManager() {
  const [stories, setStories] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedStory = useMemo(
    () => stories.find((story) => story._id === selectedId) || stories[0],
    [stories, selectedId]
  );

  const filteredStories = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return stories;
    return stories.filter((story) =>
      [story.title, story.description, storyAuthor(story)].filter(Boolean).some((value) => value.toLowerCase().includes(term))
    );
  }, [stories, query]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [{ data: storyData }, { data: featuredData }] = await Promise.all([
        apiClient.get("/stories", { params: { includePrivate: "true", limit: 100 } }),
        apiClient.get("/admin/featured"),
      ]);
      const nextStories = storyData.stories || [];
      const nextPlacements = featuredData.placements || [];
      setStories(nextStories);
      setPlacements(nextPlacements);
      const current = nextPlacements[0];
      const currentStoryId = current?.storyId?._id || current?.storyId;
      if (currentStoryId) {
        setSelectedId(currentStoryId);
        setStartDate(current.startDate ? current.startDate.slice(0, 10) : "");
        setEndDate(current.endDate ? current.endDate.slice(0, 10) : "");
      } else if (nextStories[0]) {
        setSelectedId(nextStories[0]._id);
      }
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Could not load featured story workflow.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!selectedStory) return;
    setSaving(true);
    setError("");
    try {
      await apiClient.patch(`/admin/stories/${selectedStory._id}/feature`, {
        enabled: true,
        startDate: startDate || null,
        endDate: endDate || null,
      });
      await load();
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Featured story could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const active = placements[0];
    const storyId = active?.storyId?._id || selectedStory?._id;
    if (!storyId) return;
    setSaving(true);
    setError("");
    try {
      await apiClient.patch(`/admin/stories/${storyId}/feature`, { enabled: false });
      setStartDate("");
      setEndDate("");
      await load();
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Featured story could not be removed.");
    } finally {
      setSaving(false);
    }
  };

  const activePlacement = placements[0];

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-950">Featured Story</h2>
            <p className="text-sm font-semibold text-gray-500">Choose one homepage feature with a start and end date.</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

        {activePlacement?.storyId && (
          <div className="rounded-lg bg-orange-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-orange-600">Currently featured</p>
            <p className="mt-1 font-black text-gray-950">{activePlacement.storyId.title}</p>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm font-semibold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="Search stories"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="max-h-72 space-y-3 overflow-auto pr-1">
          {loading && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-100 p-4 text-sm font-bold text-gray-500">
              <Loader2 className="animate-spin" size={18} />
              Loading stories
            </div>
          )}

          {!loading &&
            filteredStories.map((story) => (
              <button
                key={story._id}
                onClick={() => setSelectedId(story._id)}
                className={`flex w-full gap-3 rounded-lg border p-3 text-left transition ${
                  selectedStory?._id === story._id ? "border-orange-500 bg-orange-50" : "border-gray-100 hover:border-orange-200 hover:bg-gray-50"
                }`}
              >
                <img src={storyCover(story)} alt={story.title} className="h-16 w-12 rounded-md object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-black text-gray-900">{story.title}</span>
                  <span className="block truncate text-sm font-semibold text-gray-500">{storyAuthor(story)}</span>
                </span>
              </button>
            ))}
        </div>

        {selectedStory && (
          <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-orange-600">Selected story</p>
              <h3 className="truncate text-lg font-black text-gray-950">{selectedStory.title}</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-bold text-gray-700">
                Start Date
                <input
                  type="date"
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </label>
              <label className="block text-sm font-bold text-gray-700">
                End Date
                <input
                  type="date"
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                <CalendarDays size={16} />
                {startDate || "Today"} to {endDate || "no end date"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={remove}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-black text-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X size={16} />
                  Remove
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-black text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
