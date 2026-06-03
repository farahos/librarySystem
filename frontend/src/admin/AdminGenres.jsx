import React, { useEffect, useState } from "react";
import { apiClient } from "../lib/apiClient";

export default function AdminGenres() {
  const [genres, setGenres] = useState([]);
  const [name, setName] = useState("");

  const load = () => apiClient.get("/admin/genres").then(({ data }) => setGenres(data.genres || []));

  useEffect(() => {
    load();
  }, []);

  const create = async (event) => {
    event.preventDefault();
    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");
    await apiClient.post("/admin/genres", { name, slug });
    setName("");
    load();
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-black text-gray-950">Genres</h1>
        <form onSubmit={create} className="mt-6 flex gap-3">
          <input value={name} onChange={(event) => setName(event.target.value)} className="flex-1 rounded-lg border px-3 py-3" placeholder="Genre name" required />
          <button className="rounded-lg bg-orange-600 px-4 py-3 font-black text-white">Add</button>
        </form>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {genres.map((genre) => (
            <div key={genre._id} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="font-black">{genre.name}</p>
              <p className="text-sm text-gray-500">{genre.slug}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
