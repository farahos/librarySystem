import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient, storyCover, storySummary } from "../lib/apiClient";
import { useUser } from "../hooks/useUser";
import StoryCard from "./StoryCard";

const sections = [
  ["trending", "Trending Stories"],
  ["newest", "New Stories"],
  ["recommended", "Recommended"],
  ["weekly", "Popular This Week"],
  ["originals", "Madal Originals"],
];

const Book = () => {
  const { user } = useUser();
  const [feed, setFeed] = useState(null);
  const [continueItems, setContinueItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/stories/feed/home")
      .then(({ data }) => setFeed(data))
      .catch((err) => {
        console.error(err.response?.data || err);
        setFeed({});
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setContinueItems([]);
      return;
    }

    apiClient
      .get("/me/continue-reading")
      .then(({ data }) => setContinueItems((data.items || []).slice(0, 10)))
      .catch(() => setContinueItems([]));
  }, [user]);

  if (loading) {
    return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Loading Madal...</main>;
  }

  const hero = feed?.recommended?.[0] || feed?.trending?.[0] || feed?.newest?.[0];

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden bg-gray-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1800&q=80"
          alt="Open books in a warm library"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-end px-4 pb-16 pt-24">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-300">
            The Home of Somali Storytelling
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight md:text-7xl">
            Madal is where Somali stories are read, heard, and written.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-100">
            A modern storytelling platform for Somali-language readers and writers, built around serial fiction, audio chapters, writer trust, and community discovery.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/Books" className="rounded-lg bg-orange-600 px-5 py-3 font-black text-white hover:bg-orange-700">
              Explore Stories
            </Link>
            <Link to="/create" className="rounded-lg bg-white px-5 py-3 font-black text-gray-950 hover:bg-orange-50">
              Start Writing
            </Link>
          </div>
          {hero && (
            <div className="mt-8 max-w-2xl">
              <p className="text-sm font-bold text-orange-200">Featured now</p>
              <h2 className="mt-1 text-3xl font-black">{hero.title}</h2>
              <p className="mt-2 line-clamp-2 text-gray-200">{storySummary(hero)}</p>
              <Link
                to={`/story/${hero.slug}`}
                className="mt-5 inline-flex rounded-lg bg-orange-600 px-5 py-3 font-black text-white hover:bg-orange-700"
              >
                Start reading
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12">
        {user && continueItems.length > 0 && (
          <section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Library</p>
                <h2 className="text-2xl font-black text-gray-950">Continue Reading</h2>
              </div>
              <Link to="/library/continue-reading" className="text-sm font-bold text-orange-700">View all</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {continueItems.slice(0, 4).map((item) => (
                <Link
                  key={item.interaction?._id || `${item.story?._id}-${item.chapterNumber}`}
                  to={`/read/${item.story._id}/${item.chapter?.chapterNumber || item.chapterNumber || 1}`}
                  className="flex gap-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:border-orange-200 hover:shadow-md"
                >
                  <img src={storyCover(item.story)} alt={item.story.title} className="h-24 w-20 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-black text-gray-950">{item.story.title}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-500">
                      {item.chapter ? `Chapter ${item.chapter.chapterNumber}: ${item.chapter.title}` : `Chapter ${item.chapterNumber || 1}`}
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-orange-600"
                        style={{ width: `${Math.min(Math.max(item.progressPercent ?? item.progress ?? 0, 0), 100)}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs font-bold text-gray-500">
                      <span>{item.progressPercent ?? item.progress ?? 0}% complete</span>
                      {item.lastOpenedAt && <span>{new Date(item.lastOpenedAt).toLocaleDateString()}</span>}
                    </div>
                    <p className="mt-3 inline-flex rounded-lg bg-orange-600 px-3 py-2 text-sm font-black text-white">Continue</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {sections.map(([key, title]) => {
          const stories = feed?.[key] || [];
          if (stories.length === 0) return null;
          return (
            <section key={key}>
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Madal</p>
                  <h2 className="text-2xl font-black text-gray-950">{title}</h2>
                </div>
                <Link to="/Books" className="text-sm font-bold text-orange-700">View all</Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stories.slice(0, 4).map((story) => (
                  <StoryCard key={story._id} story={story} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
};

export default Book;
