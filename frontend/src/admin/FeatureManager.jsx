import React, { useEffect, useMemo, useState } from "react";
import { apiClient, storyAuthor, storyCover } from "../lib/apiClient";
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Loader2,
  Medal,
  Save,
  Search,
  Sparkles,
  Star,
} from "lucide-react";

const featureSlots = [
  { value: "trending", label: "Trending" },
  { value: "new", label: "New Stories" },
  { value: "recommended", label: "Recommended" },
  { value: "weekly", label: "Popular This Week" },
  { value: "originals", label: "Madal Originals" },
  { value: "writers", label: "Featured Writers" },
];

const formatDate = (value) => {
  if (!value) return "No expiry";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

export default function FeatureManager() {
  const [posts, setPosts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedPost = useMemo(
    () => posts.find((post) => post._id === selectedId) || posts[0],
    [posts, selectedId]
  );

  const [form, setForm] = useState({
    featured: true,
    originals: false,
    featureSlot: "recommended",
    featureRank: 10,
    featuredUntil: "",
  });

  const featuredPosts = useMemo(
    () =>
      posts
        .filter((post) => post.featured?.enabled || post.original?.enabled)
        .sort((a, b) => {
          if ((a.featured?.slot || "") !== (b.featured?.slot || "")) {
            return (a.featured?.slot || "").localeCompare(b.featured?.slot || "");
          }
          return (a.featured?.rank || 10) - (b.featured?.rank || 10);
        }),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter((post) =>
      [post.title, post.description, storyAuthor(post)]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [posts, query]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await apiClient.get("/stories", { params: { includePrivate: "true", limit: 100 } });
        const stories = data.stories || [];
        setPosts(stories);
        if (stories.length > 0) {
          setSelectedId(stories[0]._id);
        }
      } catch (err) {
        console.error(err.response?.data || err);
        setError("Could not load stories for featured placement.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (!selectedPost) return;
    setForm({
      featured: Boolean(selectedPost.featured?.enabled),
      originals: Boolean(selectedPost.original?.enabled),
      featureSlot: selectedPost.featured?.slot || "recommended",
      featureRank: selectedPost.featured?.rank || 10,
      featuredUntil: selectedPost.featured?.until
        ? selectedPost.featured.until.slice(0, 10)
        : "",
    });
  }, [selectedPost]);

  const handleSave = async () => {
    if (!selectedPost) return;
    setSaving(true);
    setError("");

    try {
      const { data } = await apiClient.patch(
        `/admin/stories/${selectedPost._id}/feature`,
        {
          enabled: form.featured,
          original: form.originals,
          slot: form.featureSlot,
          rank: Number(form.featureRank),
          until: form.featuredUntil || null,
        }
      );

      setPosts((current) =>
        current.map((post) => (post._id === data.story._id ? data.story : post))
      );
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Feature placement could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-lg border border-orange-100 bg-white shadow-sm">
      <div className="border-b border-orange-100 bg-orange-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-950">Featured Content</h2>
            <p className="text-sm text-gray-600">Read. Listen. Write Stories.</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Metric icon={Star} label="Featured" value={featuredPosts.length} />
          <Metric
            icon={Medal}
            label="Originals"
            value={posts.filter((post) => post.original?.enabled).length}
          />
          <Metric icon={BookOpen} label="Stories" value={posts.length} />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="Search stories or writers"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="max-h-72 space-y-3 overflow-auto pr-1">
          {loading && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-100 p-4 text-sm text-gray-500">
              <Loader2 className="animate-spin" size={18} />
              Loading stories
            </div>
          )}

          {!loading &&
            filteredPosts.map((post) => (
              <button
                key={post._id}
                onClick={() => setSelectedId(post._id)}
                className={`flex w-full gap-3 rounded-lg border p-3 text-left transition ${
                  selectedPost?._id === post._id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-100 hover:border-orange-200 hover:bg-gray-50"
                }`}
              >
                <img
                  src={storyCover(post)}
                  alt={post.title}
                  className="h-16 w-12 rounded-md object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-gray-900">
                    {post.title}
                  </span>
                  <span className="block truncate text-sm text-gray-500">
                    {storyAuthor(post)}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1">
                    {post.featured?.enabled && <Pill icon={Star} label="Featured" />}
                    {post.original?.enabled && <Pill icon={BadgeCheck} label="Original" />}
                  </span>
                </span>
              </button>
            ))}

          {!loading && filteredPosts.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
              No matching stories found.
            </div>
          )}
        </div>

        {selectedPost && (
          <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                Placement
              </p>
              <h3 className="truncate text-lg font-bold text-gray-950">
                {selectedPost.title}
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700">
                Featured
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      featured: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-orange-600"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700">
                Madal Original
                <input
                  type="checkbox"
                  checked={form.originals}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      originals: event.target.checked,
                      featureSlot: event.target.checked ? "originals" : current.featureSlot,
                    }))
                  }
                  className="h-4 w-4 accent-orange-600"
                />
              </label>
            </div>

            <label className="block text-sm font-semibold text-gray-700">
              Home feed section
              <select
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                value={form.featureSlot}
                onChange={(event) =>
                  setForm((current) => ({ ...current, featureSlot: event.target.value }))
                }
              >
                {featureSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-700">
                Rank
                <input
                  type="number"
                  min="1"
                  max="99"
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  value={form.featureRank}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      featureRank: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="block text-sm font-semibold text-gray-700">
                Ends on
                <input
                  type="date"
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  value={form.featuredUntil}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      featuredUntil: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays size={16} />
                {formatDate(form.featuredUntil)}
              </span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            Active placements
          </h3>
          {featuredPosts.slice(0, 5).map((post) => (
            <div
              key={post._id}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
            >
              <span className="truncate font-semibold text-gray-800">{post.title}</span>
              <span className="ml-3 shrink-0 rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">
                #{post.featured?.rank || 10}
              </span>
            </div>
          ))}
          {featuredPosts.length === 0 && (
            <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
              No stories are featured yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <Icon className="mb-2 text-orange-600" size={18} />
      <p className="text-xl font-bold text-gray-950">{value}</p>
      <p className="text-xs font-semibold text-gray-500">{label}</p>
    </div>
  );
}

function Pill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
      <Icon size={12} />
      {label}
    </span>
  );
}
