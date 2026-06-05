import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../lib/apiClient";

const categories = ["romance", "horror", "history", "drama", "mystery", "fantasy", "action", "comedy", "islamic", "poetry", "short-stories"];

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    coverUrl: "",
    category: "drama",
    visibility: "public",
    status: "ongoing",
  });
  const [loading, setLoading] = useState(false);
  const [loadingStory, setLoadingStory] = useState(true);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  useEffect(() => {
    setLoadingStory(true);
    apiClient
      .get(`/stories/id/${id}`)
      .then(({ data }) => {
        const story = data.story;
        setForm({
          title: story.title || "",
          description: story.description || "",
          coverUrl: story.coverUrl || "",
          category: story.category || "drama",
          visibility: story.visibility || "public",
          status: story.status || "ongoing",
        });
        setCoverPreview(story.coverUrl || "");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Story not found");
        navigate("/viewbook");
      })
      .finally(() => setLoadingStory(false));
  }, [id, navigate]);

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0] || null;
    setCoverFile(file);

    if (!file) {
      setCoverPreview(form.coverUrl);
      return;
    }

    setCoverPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (!coverFile || !coverPreview.startsWith("blob:")) return undefined;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverFile, coverPreview]);

  const uploadCover = async () => {
    if (!coverFile) return form.coverUrl;

    const formData = new FormData();
    formData.append("file", coverFile);
    const { data } = await apiClient.post("/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.secureUrl;
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const coverUrl = await uploadCover();
      const { data } = await apiClient.put(`/stories/${id}`, { ...form, coverUrl });
      toast.success("Story updated");
      navigate(`/story/${data.story._id}/manage`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (loadingStory) {
    return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Loading story...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <form onSubmit={handleUpdate} className="mx-auto max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black text-gray-950">Update Story</h1>
        <p className="text-sm text-gray-500">Update your story details.</p>
        <Input label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
        <label className="block text-sm font-bold text-gray-700">
          Cover image
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-orange-600 file:px-3 file:py-2 file:font-bold file:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
          {coverFile && <span className="mt-2 block truncate text-xs font-semibold text-gray-500">{coverFile.name}</span>}
        </label>
        {coverPreview && (
          <div className="mx-auto w-full max-w-xs overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            <img src={coverPreview} alt="Cover preview" className="aspect-[2/3] w-full object-cover" />
          </div>
        )}
        <label className="block text-sm font-bold text-gray-700">
          Description
          <textarea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            rows={5}
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500"
          />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <Select label="Category" value={form.category} options={categories} onChange={(value) => setForm((current) => ({ ...current, category: value }))} />
          <Select label="Status" value={form.status} options={["ongoing", "completed", "hiatus"]} onChange={(value) => setForm((current) => ({ ...current, status: value }))} />
          <Select label="Visibility" value={form.visibility} options={["public", "private", "archived"]} onChange={(value) => setForm((current) => ({ ...current, visibility: value }))} />
        </div>
        <button disabled={loading} className="rounded-lg bg-orange-600 px-5 py-3 font-black text-white">
          {loading ? "Updating..." : "Update Story"}
        </button>
      </form>
    </main>
  );
};

function Input({ label, value, onChange }) {
  return (
    <label className="block text-sm font-bold text-gray-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500"
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

export default EditPost;
