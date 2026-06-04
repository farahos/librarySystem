import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronLeft, ChevronRight, Eye, Heart, PenLine } from "lucide-react";
import { apiClient, authorProfilePath, formatCount, storyAuthor, storyCover, storySummary } from "../lib/apiClient";

const genres = [
  ["romance", "Romance", "Love, family, and longing"],
  ["horror", "Horror", "Fear, suspense, and shadow"],
  ["history", "History", "Memory, legacy, and place"],
  ["drama", "Drama", "People, choices, and conflict"],
  ["mystery", "Mystery", "Secrets waiting to open"],
  ["fantasy", "Fantasy", "New worlds and old magic"],
  ["action", "Action", "Fast, bold, and dangerous"],
  ["comedy", "Comedy", "Light stories with bite"],
  ["islamic", "Islamic", "Faith, reflection, and life"],
  ["poetry", "Poetry", "Voice, rhythm, and feeling"],
  ["short-stories", "Short Stories", "Quick reads with power"],
];

const uniqueStories = (stories) => {
  const seen = new Set();
  return stories.filter((story) => {
    if (!story?._id || seen.has(story._id)) return false;
    seen.add(story._id);
    return true;
  });
};

const authorName = (author, fallbackStory) =>
  author?.displayName || author?.username || storyAuthor(fallbackStory) || "Madal writer";

const Book = () => {
  const [feed, setFeed] = useState(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState([]);
  const [featuredDetail, setFeaturedDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get("/stories/feed/home"),
      apiClient.get("/stories/recently-updated", { params: { limit: 8 } }),
    ])
      .then(([homeResponse, updatedResponse]) => {
        setFeed(homeResponse.data || {});
        setRecentlyUpdated(updatedResponse.data?.stories || []);
      })
      .catch((err) => {
        console.error(err.response?.data || err);
        setFeed({});
        setRecentlyUpdated([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const storyPool = useMemo(
    () =>
      uniqueStories([
        ...(feed?.recommended || []),
        ...(feed?.trending || []),
        ...(recentlyUpdated || []),
        ...(feed?.newest || []),
        ...(feed?.originals || []),
        ...(feed?.weekly || []),
      ]),
    [feed, recentlyUpdated]
  );

  const featuredStory = storyPool[0];
  const trendingStories = feed?.trending || [];

  const risingAuthors = useMemo(() => {
    const authorMap = new Map();
    storyPool.forEach((story) => {
      const author = story?.authorId;
      const id = author?._id || author?.username || story?.writerName;
      if (!id) return;
      const existing = authorMap.get(id) || {
        author,
        reads: 0,
        stories: 0,
        latestStory: story,
      };
      existing.reads += Number(story.metrics?.reads || 0);
      existing.stories += 1;
      existing.latestStory = existing.latestStory || story;
      authorMap.set(id, existing);
    });
    return [...authorMap.values()].sort((a, b) => b.reads - a.reads).slice(0, 6);
  }, [storyPool]);

  useEffect(() => {
    if (!featuredStory?.slug) {
      setFeaturedDetail(null);
      return;
    }

    apiClient
      .get(`/stories/${featuredStory.slug}`)
      .then(({ data }) => setFeaturedDetail(data))
      .catch(() => setFeaturedDetail(null));
  }, [featuredStory?.slug]);

  if (loading) {
    return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Loading Madal...</main>;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50">
      <Hero stories={storyPool.slice(0, 5)} />

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12">
        {featuredStory && <FeaturedStory story={featuredStory} detail={featuredDetail} />}
        <StoryRail title="Trending Stories" kicker="Readers are opening these now" stories={trendingStories.slice(0, 4)} />
        <StoryRail title="Recently Updated" kicker="Fresh chapters and new movement" stories={recentlyUpdated.slice(0, 4)} />
        {risingAuthors.length > 0 && <RisingAuthors authors={risingAuthors} />}
        <BecomeWriter />
      </div>
    </main>
  );
};

function Hero({ stories }) {
  const lead = stories[0];

  return (
    <section className="relative overflow-hidden bg-orange-50">
      <div className="absolute inset-x-0 top-0 h-40 bg-white/70" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-9 px-4 py-10 sm:py-14 lg:grid lg:min-h-[650px] lg:grid-cols-[0.92fr_1.08fr] lg:py-20">
        <div className="w-full min-w-0 text-center text-gray-950 lg:text-left">
          <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight sm:text-5xl md:text-6xl lg:mx-0">
            Where Somali Stories Come Alive
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-700 sm:text-lg sm:leading-8 lg:mx-0">
            Discover original fiction, poetry, history, mystery, and serialized stories written by a new generation of Somali creators.
          </p>
          <div className="mt-7">
            <p className="text-sm font-bold text-gray-500">Explore stories in your favorite genre:</p>
            <div className="madal-scrollbar-hide mx-auto mt-3 max-w-full overflow-x-auto lg:mx-0 lg:overflow-visible">
              <div className="flex w-max max-w-none flex-nowrap gap-2 lg:w-auto lg:max-w-3xl lg:flex-wrap lg:justify-start">
                {genres.map(([value, label]) => (
                  <Link
                    key={value}
                    to={`/Books?category=${value}`}
                    className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-black text-orange-700 shadow-sm transition hover:border-orange-400 hover:bg-orange-100"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link to="/Books" className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-black text-white hover:bg-orange-700">
              <BookOpen size={18} />
              Explore Stories
            </Link>
            <Link to={lead ? `/story/${lead.slug}` : "/Books"} className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-black text-gray-950 hover:bg-orange-50">
              Start Reading
            </Link>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-sm grid-cols-3 items-end gap-3 md:max-w-none md:gap-4">
          {stories.slice(0, 5).map((story, index) => (
            <Link
              key={story._id}
              to={`/story/${story.slug}`}
              className={`group overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-gray-200 ${
                index > 2 ? "hidden sm:block" : ""
              } ${
                index === 1 || index === 3 ? "sm:-translate-y-8" : ""
              } ${index === 2 ? "sm:translate-y-8" : ""}`}
            >
              <img src={storyCover(story)} alt={story.title} className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-105" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedStory({ story, detail }) {
  const chapters = (detail?.chapters || []).slice(0, 3);

  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
      <div className="grid gap-0 lg:grid-cols-[0.82fr_1.18fr]">
        <Link to={`/story/${story.slug}`} className="relative block min-h-[420px] bg-gray-950">
          <img src={storyCover(story)} alt={story.title} className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-sm font-black uppercase tracking-wide text-orange-200">Featured Story</p>
            <h2 className="mt-2 text-4xl font-black leading-tight">{story.title}</h2>
            <p className="mt-2 font-semibold text-gray-200">{storyAuthor(story)}</p>
          </div>
        </Link>

        <div className="p-6 md:p-8">
          <p className="text-sm font-black uppercase tracking-wide text-orange-600">Start here</p>
          <h3 className="mt-2 text-3xl font-black text-gray-950">{story.title}</h3>
          <p className="mt-4 text-base leading-8 text-gray-600">{storySummary(story)}</p>

          <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Eye size={16} />
              {formatCount(story.metrics?.views || 0)} views
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen size={16} />
              {formatCount(story.metrics?.reads || 0)} reads
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart size={16} />
              {formatCount(story.metrics?.likes || 0)} likes
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <p className="font-black text-gray-950">Chapter previews</p>
            {chapters.length > 0 ? (
              chapters.map((chapter) => (
                <Link key={chapter._id} to={`/read/${story._id}/${chapter.chapterNumber}`} className="block rounded-lg bg-gray-50 p-4 hover:bg-orange-50">
                  <p className="text-sm font-black text-orange-700">Chapter {chapter.chapterNumber}</p>
                  <h4 className="mt-1 font-black text-gray-950">{chapter.title}</h4>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{chapter.content}</p>
                </Link>
              ))
            ) : (
              <p className="rounded-lg bg-gray-50 p-4 text-sm font-semibold text-gray-500">Open the story to begin reading.</p>
            )}
          </div>

          <Link to={`/story/${story.slug}`} className="mt-6 inline-flex rounded-lg bg-orange-600 px-5 py-3 font-black text-white hover:bg-orange-700">
            Read Featured Story
          </Link>
        </div>
      </div>
    </section>
  );
}

function StoryRail({ title, kicker, stories }) {
  const railRef = React.useRef(null);
  if (!stories?.length) return null;

  const scrollRail = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.75, 240),
      behavior: "smooth",
    });
  };

  return (
    <section className="overflow-hidden">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-orange-600">{kicker}</p>
          <h2 className="text-2xl font-black text-gray-950">{title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-8">
          <button
            type="button"
            onClick={() => scrollRail(-1)}
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-orange-50 hover:text-orange-700 sm:flex"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollRail(1)}
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-orange-50 hover:text-orange-700 sm:flex"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight size={18} />
          </button>
          <Link to="/Books" className="text-right text-sm font-bold text-orange-700">View All</Link>
        </div>
      </div>
      <div
        ref={railRef}
        className="madal-scrollbar-hide -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 scroll-smooth sm:gap-4 lg:gap-5"
      >
        {stories.map((story) => (
          <HomeStoryCard key={story._id} story={story} />
        ))}
      </div>
    </section>
  );
}

function HomeStoryCard({ story }) {
  return (
    <article className="group w-[31%] min-w-[31%] snap-start sm:w-40 sm:min-w-40 lg:w-52 lg:min-w-52">
      <Link to={`/story/${story.slug}`} className="block overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:ring-orange-200">
        <img src={storyCover(story)} alt={story.title} className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-105" />
      </Link>
      <Link to={`/story/${story.slug}`} className="mt-2 line-clamp-2 block text-sm font-black leading-5 text-gray-950 hover:text-orange-700 sm:text-base">
        {story.title}
      </Link>
      <Link to={authorProfilePath(story)} className="mt-1 line-clamp-1 block text-xs font-semibold text-gray-500 hover:text-orange-700 sm:text-sm">
        by {storyAuthor(story)}
      </Link>
      <p className="mt-2 w-fit rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-black capitalize text-gray-600 sm:text-xs">
        {story.category || "drama"}
      </p>
    </article>
  );
}

function RisingAuthors({ authors }) {
  return (
    <section>
      <div className="mb-5">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Voices gaining readers</p>
        <h2 className="text-2xl font-black text-gray-950">Rising Authors</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {authors.map(({ author, reads, stories, latestStory }) => (
          <Link key={author?._id || author?.username || latestStory?._id} to={authorProfilePath(author || latestStory)} className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 hover:ring-orange-200">
            <span className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {author?.avatarUrl ? (
                <img src={author.avatarUrl} alt={authorName(author, latestStory)} className="h-full w-full object-cover" />
              ) : (
                <img src={storyCover(latestStory)} alt={latestStory?.title || "Author"} className="h-full w-full object-cover" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-black text-gray-950">{authorName(author, latestStory)}</span>
              <span className="mt-1 block truncate text-sm font-semibold text-gray-500">{stories} stories - {formatCount(reads)} reads</span>
              {latestStory && <span className="mt-2 block truncate text-sm font-bold text-orange-700">{latestStory.title}</span>}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BecomeWriter() {
  return (
    <section className="overflow-hidden rounded-lg border border-orange-100 bg-white p-6 text-gray-950 shadow-sm md:p-8">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-orange-600">Become a writer</p>
          <h2 className="mt-2 text-3xl font-black">Your story could be the next one readers open.</h2>
          <p className="mt-3 max-w-2xl leading-7 text-gray-600">
            Publish chapters, build a readership, and give Somali stories another place to live.
          </p>
        </div>
        <Link to="/create" className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-black text-white hover:bg-orange-700">
          <PenLine size={18} />
          Start Writing
        </Link>
      </div>
    </section>
  );
}

export default Book;
