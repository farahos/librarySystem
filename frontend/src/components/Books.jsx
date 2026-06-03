import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import StoryCard from "./StoryCard";

const fallbackCategories = [
  { value: "", label: "All categories" },
  { value: "romance", label: "Romantic" },
  { value: "horror", label: "Horror" },
  { value: "history", label: "History" },
  { value: "drama", label: "Drama" },
  { value: "mystery", label: "Mystery" },
  { value: "fantasy", label: "Fantasy" },
  { value: "action", label: "Action" },
  { value: "comedy", label: "Comedy" },
  { value: "islamic", label: "Islamic" },
  { value: "poetry", label: "Poetry" },
  { value: "short-stories", label: "Short Stories" },
];

const Books = () => {
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("new");

  useEffect(() => {
    apiClient
      .get("/genres")
      .then(({ data }) => {
        const loaded = [
          { value: "", label: "All categories" },
          ...(data.genres || []).map((genre) => ({ value: genre.slug, label: genre.name })),
        ];
        if (loaded.length > 1) setCategories(loaded);
      })
      .catch(() => setCategories(fallbackCategories));
  }, []);

  useEffect(() => {
    apiClient
      .get("/stories", { params: { limit: 48, sort, category: category || undefined } })
      .then(({ data }) => {
        setStories(data.stories || []);
      })
      .catch((err) => {
        console.error(err.response?.data || err);
        setStories([]);
      })
      .finally(() => setLoading(false));
  }, [sort, category]);

  const filteredStories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return stories.filter((story) => {
      const matchesSearch =
        !term ||
        [story.title, story.description, story.authorId?.username, story.authorId?.displayName]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      return matchesSearch;
    });
  }, [stories, searchTerm]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Discover</p>
          <h1 className="mt-2 text-4xl font-black text-gray-950">Somali Stories</h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            Browse stories, originals, audio chapters, and writers from the Madal community.
          </p>
        </div>

        <div className="mb-8 grid gap-3 md:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search title, writer, tags..."
              className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-3 outline-none focus:border-orange-500"
          >
            {categories.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-3 outline-none focus:border-orange-500"
          >
            <option value="new">Newest</option>
            <option value="trending">Trending</option>
            <option value="featured">Featured</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        {loading ? (
          <p className="rounded-lg bg-white p-6 text-gray-500">Loading stories...</p>
        ) : filteredStories.length === 0 ? (
          <p className="rounded-lg bg-white p-6 text-gray-500">No stories found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Books;
