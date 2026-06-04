import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../lib/apiClient";

const initialForm = {
  title: "",
  chapterNumber: 1,
  content: "",
  status: "published",
};

const AddChapter = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  useEffect(() => {
    setLoadingPage(true);
    Promise.all([
      apiClient.get(`/stories/id/${storyId}`),
      apiClient.get(`/stories/${storyId}/chapters`, { params: { includeDrafts: true } }),
    ])
      .then(([storyResponse, chaptersResponse]) => {
        const chapters = chaptersResponse.data.chapters || [];
        const nextNumber = chapters.reduce((max, chapter) => Math.max(max, Number(chapter.chapterNumber) || 0), 0) + 1;
        setStory(storyResponse.data.story);
        setForm((current) => ({
          ...current,
          title: "",
          chapterNumber: nextNumber,
        }));
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Could not load story");
        navigate("/Home");
      })
      .finally(() => setLoadingPage(false));
  }, [storyId, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await apiClient.post(`/stories/${storyId}/chapters`, {
        title: form.title,
        chapterNumber: Number(form.chapterNumber),
        content: form.content,
        status: form.status,
      });

      toast.success(form.status === "draft" ? "Chapter saved as draft" : "Chapter published");
      navigate(`/story/${storyId}/manage`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Could not add chapter");
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Loading writer tools...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Writer Studio</p>
          <h1 className="mt-2 text-3xl font-black text-gray-950">Add Chapter</h1>
          <p className="mt-2 text-gray-600">{story?.title}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_160px_180px]">
          <Input label="Chapter title" value={form.title} onChange={(value) => update("title", value)} required />
          <Input
            label="Chapter number"
            type="number"
            min="1"
            value={form.chapterNumber}
            onChange={(value) => update("chapterNumber", value)}
            required
          />
          <Select label="Status" value={form.status} options={["published", "draft", "scheduled"]} onChange={(value) => update("status", value)} />
        </div>

        <label className="block text-sm font-bold text-gray-700">
          Chapter content
          <textarea
            value={form.content}
            onChange={(event) => update("content", event.target.value)}
            rows={16}
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            required
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button disabled={loading} className="rounded-lg bg-orange-600 px-5 py-3 font-black text-white hover:bg-orange-700 disabled:bg-orange-300">
            {loading ? "Saving..." : "Save Chapter"}
          </button>
          <button type="button" onClick={() => navigate(`/story/${storyId}/manage`)} className="rounded-lg bg-gray-100 px-5 py-3 font-black text-gray-800 hover:bg-gray-200">
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
};

function Input({ label, value, onChange, required = false, type = "text", min }) {
  return (
    <label className="block text-sm font-bold text-gray-700">
      {label}
      <input
        type={type}
        min={min}
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
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export default AddChapter;
