import React from "react";
import { BadgeCheck, BookOpen, Headphones, Heart, Library, PenLine, Users } from "lucide-react";
import { Link } from "react-router-dom";

const journey = [
  {
    title: "Stories Become Series",
    text: "A story on Madal is a home for many chapters, so writers can publish slowly and readers can keep returning.",
    icon: BookOpen,
  },
  {
    title: "Readers Follow Writers",
    text: "Profiles, followers, and notifications help readers stay close to the voices they care about.",
    icon: Users,
  },
  {
    title: "Chapters Can Be Heard",
    text: "Audio-ready chapters make Madal useful for readers who want to listen as well as read.",
    icon: Headphones,
  },
  {
    title: "Identity Matters",
    text: "Writer profiles, badges, bios, and public story grids make authors visible beyond one post.",
    icon: BadgeCheck,
  },
];

const principles = [
  ["Serial-first", "Built for ongoing chapters, not one-off blog posts."],
  ["Somali-first", "Categories, language, and discovery shaped around Somali readers."],
  ["Community-first", "Follows, comments, likes, and notifications keep people connected."],
  ["Writer-first", "Tools for publishing, editing, analytics, and profile identity."],
];

const About = () => {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="border-b border-orange-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-600">About Madal</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-gray-950 md:text-6xl">
              A place where Somali writers build worlds chapter by chapter.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Madal is designed for serialized storytelling: one story, many chapters, reader communities, author profiles, and audio-friendly reading.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/Books" className="rounded-lg bg-orange-600 px-5 py-3 font-black text-white hover:bg-orange-700">
                Browse Stories
              </Link>
              <Link to="/create" className="rounded-lg bg-gray-100 px-5 py-3 font-black text-gray-950 hover:bg-gray-200">
                Publish a Story
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Madal Model</p>
              <div className="mt-5 space-y-4">
                <FlowItem icon={PenLine} title="Write" text="Create a story and publish the first chapter." />
                <FlowItem icon={Library} title="Grow" text="Add chapters, build a profile, and earn followers." />
                <FlowItem icon={Heart} title="Connect" text="Readers like, comment, follow, and continue reading." />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {journey.map((item) => (
            <div key={item.title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <item.icon className="text-orange-600" size={28} />
              <h2 className="mt-5 text-xl font-black text-gray-950">{item.title}</h2>
              <p className="mt-3 leading-7 text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Principles</p>
          <h2 className="mt-2 text-3xl font-black text-gray-950">What makes Madal different?</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {principles.map(([title, text]) => (
              <div key={title} className="rounded-lg bg-orange-50 p-5">
                <h3 className="font-black text-orange-900">{title}</h3>
                <p className="mt-2 leading-7 text-orange-950">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

function FlowItem({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
        <Icon size={18} />
      </span>
      <div>
        <p className="font-black text-gray-950">{title}</p>
        <p className="text-sm leading-6 text-gray-600">{text}</p>
      </div>
    </div>
  );
}

export default About;
