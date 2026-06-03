import React from "react";
import { Link } from "react-router-dom";

const Booked = () => {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <section className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Saved Stories</p>
        <h1 className="mt-2 text-3xl font-black text-gray-950">Your Library</h1>
        <p className="mt-3 text-gray-600">
          Bookmark support is connected through story interactions. A dedicated saved-stories feed can be added once the backend exposes a bookmark listing endpoint.
        </p>
        <Link to="/Books" className="mt-6 inline-flex rounded-lg bg-orange-600 px-5 py-3 font-black text-white">
          Explore Stories
        </Link>
      </section>
    </main>
  );
};

export default Booked;
