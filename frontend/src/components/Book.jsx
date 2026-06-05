import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronLeft, ChevronRight, Library, PenLine, Users } from "lucide-react";
import { apiClient, authorProfilePath, formatCount, storyAuthor, storyCover } from "../lib/apiClient";

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

  if (loading) {
    return <main className="min-h-screen bg-[#121212] p-8 text-white/70">Loading Madal...</main>;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#121212] text-white">
      <Hero stories={storyPool.slice(0, 5)} />

      <div className="space-y-14 px-4 py-12 md:px-8 md:py-16 lg:px-10">
        <StoryRail title="Trending Stories" kicker="Readers are opening these now" stories={trendingStories.slice(0, 6)} />
        <StoryRail title="Recently Updated" kicker="Fresh chapters and new movement" stories={recentlyUpdated.slice(0, 6)} />
        {risingAuthors.length > 0 && <RisingAuthors authors={risingAuthors} />}
        <ReadWriteGrow />
        <CommunitySection />
      </div>
    </main>
  );
};

function Hero({ stories }) {
  const lead = stories[0];

  return (
    <section className="relative overflow-hidden bg-[#121212]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,122,0,0.24),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_44%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#121212] to-transparent" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-12 text-center sm:py-16 lg:min-h-[720px] lg:py-20">
        <div className="w-full min-w-0">
          <p className="mx-auto w-fit rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#FF7A00]">
            The home of Somali storytelling
          </p>
          <h1 className="mx-auto mt-5 max-w-5xl text-5xl font-black leading-[0.95] text-white sm:text-6xl md:text-7xl">
            Where Somali Stories Come Alive
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-white/[0.72] sm:text-lg sm:leading-8">
            Read and publish stories shaped by Somali voices. Madal brings chapters, writers, and reader communities into one cinematic home.
          </p>
          <div className="mt-8">
            <p className="text-sm font-bold text-white/[0.58]">Explore stories in your favorite genre:</p>
            <div className="madal-scrollbar-hide mx-auto mt-3 max-w-full overflow-x-auto lg:overflow-visible">
              <div className="mx-auto flex w-max max-w-none flex-nowrap gap-2 lg:w-auto lg:max-w-4xl lg:flex-wrap lg:justify-center">
                {genres.slice(0, 8).map(([value, label], index) => (
                  <Link
                    key={value}
                    to={`/Books?category=${value}`}
                    className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                      index === 0
                        ? "border-[#FF7A00] bg-[#FF7A00] text-white"
                        : "border-white/[0.18] bg-white text-[#121212] hover:border-[#FF7A00] hover:text-[#FF7A00]"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/Books" className="inline-flex items-center gap-2 rounded-lg bg-[#FF7A00] px-5 py-3 font-black text-white shadow-[0_18px_36px_rgba(255,122,0,0.28)] transition hover:bg-[#e66f00]">
              <BookOpen size={18} />
              Explore Stories
            </Link>
            <Link to={lead ? `/story/${lead.slug}` : "/Books"} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.18] bg-white/[0.08] px-5 py-3 font-black text-white transition hover:bg-white/[0.14]">
              Start Reading
            </Link>
          </div>
        </div>

        <div className="relative mx-auto grid w-full max-w-sm grid-cols-3 items-end gap-3 md:max-w-5xl md:grid-cols-5 md:gap-4">
          <div className="absolute -inset-6 rounded-[32px] bg-[#FF7A00]/10 blur-3xl" />
          {stories.slice(0, 5).map((story, index) => (
            <Link
              key={story._id}
              to={`/story/${story.slug}`}
              className={`group relative overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-white/[0.12] ${
                index > 2 ? "hidden sm:block" : ""
              } ${
                index === 1 || index === 3 ? "sm:-translate-y-6" : ""
              } ${index === 2 ? "sm:translate-y-6" : ""}`}
            >
              <img src={storyCover(story)} alt={story.title} className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs font-black text-white opacity-0 transition group-hover:opacity-100">
                {story.title}
              </span>
            </Link>
          ))}
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
    <section className="overflow-hidden rounded-lg border border-white/10 bg-[#181818] p-4 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-[#FF7A00]">{kicker}</p>
          <h2 className="text-2xl font-black text-white md:text-3xl">{title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-8">
          <button
            type="button"
            onClick={() => scrollRail(-1)}
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white ring-1 ring-white/10 hover:text-[#FF7A00] sm:flex"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollRail(1)}
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white ring-1 ring-white/10 hover:text-[#FF7A00] sm:flex"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight size={18} />
          </button>
          <Link to="/Books" className="text-right text-sm font-bold text-[#FF7A00]">View All</Link>
        </div>
      </div>
      <div
        ref={railRef}
        className="madal-scrollbar-hide flex snap-x gap-3 overflow-x-auto pb-3 scroll-smooth sm:gap-4 lg:gap-5"
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
    <article className="group w-36 min-w-36 snap-start sm:w-44 sm:min-w-44 lg:w-56 lg:min-w-56">
      <Link to={`/story/${story.slug}`} className="block overflow-hidden rounded-lg bg-[#0f0f0f] ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-[#FF7A00]/50">
        <img src={storyCover(story)} alt={story.title} className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-105" />
      </Link>
      <Link to={`/story/${story.slug}`} className="mt-3 line-clamp-2 block text-sm font-black leading-5 text-white hover:text-[#FF7A00] sm:text-base">
        {story.title}
      </Link>
      <Link to={authorProfilePath(story)} className="mt-1 line-clamp-1 block text-xs font-semibold text-white/55 hover:text-[#FF7A00] sm:text-sm">
        by {storyAuthor(story)}
      </Link>
      <p className="mt-2 w-fit rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black capitalize text-white/62 sm:text-xs">
        {story.category || "drama"}
      </p>
    </article>
  );
}

function RisingAuthors({ authors }) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#181818] p-4 md:p-6">
      <div className="mb-5">
        <p className="text-sm font-bold uppercase tracking-wide text-[#FF7A00]">Voices gaining readers</p>
        <h2 className="text-2xl font-black text-white md:text-3xl">Featured Writers</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {authors.map(({ author, reads, stories, latestStory }) => (
          <Link key={author?._id || author?.username || latestStory?._id} to={authorProfilePath(author || latestStory)} className="flex items-center gap-4 rounded-lg bg-white/[0.05] p-4 ring-1 ring-white/10 hover:ring-[#FF7A00]/50">
            <span className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/10">
              {author?.avatarUrl ? (
                <img src={author.avatarUrl} alt={authorName(author, latestStory)} className="h-full w-full object-cover" />
              ) : (
                <img src={storyCover(latestStory)} alt={latestStory?.title || "Author"} className="h-full w-full object-cover" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-black text-white">{authorName(author, latestStory)}</span>
              <span className="mt-1 block truncate text-sm font-semibold text-white/55">{stories} stories - {formatCount(reads)} reads</span>
              {latestStory && <span className="mt-2 block truncate text-sm font-bold text-[#FF7A00]">{latestStory.title}</span>}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ReadWriteGrow() {
  const pillars = [
    ["Read", BookOpen, "Discover serialized fiction, poetry, history, mystery, and chapters from Somali creators."],
    ["Write", PenLine, "Publish chapters, build a profile, and grow a readership around your work."],
    ["Grow", Library, "Build a library of chapters, follow writers, and return to stories you love."],
  ];

  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-6 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF7A00]">Read. Write. Grow.</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-white md:text-5xl">One platform for the full story journey.</h2>
          <p className="mt-4 max-w-xl leading-7 text-white/[0.64]">
            Madal is built for how stories move now: from a writer's first chapter, to a reader's library, to a community that keeps returning.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {pillars.map(([title, Icon, copy]) => (
            <article key={title} className="rounded-lg border border-white/10 bg-[#181818] p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF7A00] text-white">
                {React.createElement(Icon, { size: 20 })}
              </span>
              <h3 className="mt-5 text-xl font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunitySection() {
  return (
    <section className="grid gap-6 overflow-hidden rounded-lg border border-white/10 bg-[#181818] p-6 md:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF7A00]">Community</p>
        <h2 className="mt-3 text-3xl font-black leading-tight text-white md:text-5xl">Stories matter more when readers gather around them.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-white/[0.64]">
          Follow writers, return to chapters, discover rising voices, and help build a premium home for Somali storytelling.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/Register" className="inline-flex items-center gap-2 rounded-lg bg-[#FF7A00] px-5 py-3 font-black text-white hover:bg-[#e66f00]">
            <Users size={18} />
            Join Madal
          </Link>
          <Link to="/create" className="inline-flex items-center gap-2 rounded-lg border border-white/[0.14] px-5 py-3 font-black text-white hover:bg-white/[0.08]">
            <PenLine size={18} />
            Start Writing
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {["Readers", "Writers", "Chapters", "Library"].map((item, index) => (
          <div key={item} className={`rounded-lg border border-white/10 bg-white/[0.04] p-5 ${index === 1 ? "mt-8" : ""} ${index === 2 ? "-mt-4" : ""}`}>
            <p className="text-3xl font-black text-white">{item}</p>
            <p className="mt-2 text-sm font-semibold text-white/[0.54]">Part of the Madal ecosystem</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Book;
