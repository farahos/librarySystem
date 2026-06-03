import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient";

const initialForm = {
  title: "",
  description: "",
  coverUrl: "",
  category: "",
  status: "ongoing",
  visibility: "private",
};

const fallbackCategories = [
  { value: "romance", label: "Romance" },
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

const allowedCategoryValues = new Set(fallbackCategories.map((category) => category.value));

const Post = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [coverName, setCoverName] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [genres, setGenres] = useState(fallbackCategories);
  const navigate = useNavigate();

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  useEffect(() => {
    apiClient
      .get("/genres")
      .then(({ data }) => {
        const loaded = (data.genres || [])
          .map((genre) => ({ value: genre.slug, label: genre.name }))
          .filter((genre) => allowedCategoryValues.has(genre.value));
        if (loaded.length > 0) setGenres(loaded);
      })
      .catch(() => setGenres(fallbackCategories));
  }, []);

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      update("coverUrl", "");
      setCoverName("");
      return;
    }

    setCoverName(file.name);
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => update("coverUrl", reader.result);
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file, endpoint) => {
    if (!file) return "";
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.secureUrl;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const coverUrl = coverFile ? await uploadFile(coverFile, "/uploads/image") : form.coverUrl;
      if (!form.title.trim()) return toast.error("Story title is required");
      if (!form.description.trim()) return toast.error("Description is required");
      if (!form.category) return toast.error("Choose a category before creating the story");
      if (!form.status) return toast.error("Choose a story status");

      const storyResponse = await apiClient.post("/stories", {
        title: form.title,
        description: form.description,
        coverUrl,
        category: form.category,
        tags: [form.category],
        status: form.status,
        visibility: form.visibility,
      });

      const story = storyResponse.data.story;
      toast.success("Story workspace created");
      navigate(`/story/${story._id}/manage`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Could not publish story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Writer Studio</p>
        <h1 className="mt-2 text-4xl font-black text-gray-950">Create Story</h1>
        <p className="mt-3 text-gray-600">Set up the book first, then build chapters from one workspace.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Story title" value={form.title} onChange={(value) => update("title", value)} required />
            <label className="block text-sm font-bold text-gray-700">
              Cover image
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-orange-600 file:px-3 file:py-2 file:font-bold file:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
              {coverName && <span className="mt-2 block truncate text-xs font-semibold text-gray-500">{coverName}</span>}
            </label>
          </div>
          {form.coverUrl && (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <img src={form.coverUrl} alt="Cover preview" className="h-64 w-full object-cover" />
            </div>
          )}
          <label className="block text-sm font-bold text-gray-700">
            Description
            <textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              required
            />
          </label>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-3">
              <p className="text-sm font-bold text-gray-700">Category</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {genres.map((genre) => (
                  <button
                    key={genre.value}
                    type="button"
                    onClick={() => update("category", genre.value)}
                    className={`rounded-lg border px-4 py-3 text-left font-black transition ${
                      form.category === genre.value
                        ? "border-orange-600 bg-orange-600 text-white"
                        : "border-gray-200 bg-white text-gray-800 hover:border-orange-200 hover:bg-orange-50"
                    }`}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>
            <Select label="Status" value={form.status} onChange={(value) => update("status", value)} options={["ongoing", "completed", "hiatus"]} />
            <Select label="Visibility" value={form.visibility} onChange={(value) => update("visibility", value)} options={["public", "private"]} />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 px-4 py-3 font-black text-white hover:bg-orange-700 disabled:bg-orange-300"
          >
            {loading ? "Creating..." : "Create Story Workspace"}
          </button>
        </form>
      </div>
    </main>
  );
};

function Field({ label, value, onChange, required = false }) {
  return (
    <label className="block text-sm font-bold text-gray-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        required={required}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block text-sm font-bold text-gray-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500"
      >
        {options.map((option) => (
          typeof option === "string" ? (
            <option key={option} value={option}>{option}</option>
          ) : (
            <option key={option.value} value={option.value}>{option.label}</option>
          )
        ))}
      </select>
    </label>
  );
}

export default Post;
