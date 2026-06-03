import React from "react";
import { Link } from "react-router-dom";

const links = [
  { to: "/library/bookmarks", title: "Bookmarked Stories", text: "Stories you saved for later." },
  { to: "/library/continue-reading", title: "Continue Reading", text: "Pick up where you stopped." },
  { to: "/library/history", title: "Reading History", text: "Recently opened stories and chapters." },
  { to: "/library/lists", title: "Reading Lists", text: "Build collections like Islamic Reads or Favorite Somali Stories." },
];

export default function MyLibrary() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Madal</p>
        <h1 className="mt-2 text-4xl font-black text-gray-950">My Library</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-orange-200">
              <h2 className="text-xl font-black text-gray-950">{link.title}</h2>
              <p className="mt-2 text-gray-600">{link.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
