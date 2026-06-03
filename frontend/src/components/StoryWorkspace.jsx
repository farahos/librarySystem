import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Copy, Edit, Eye, GripVertical, Plus, Trash2 } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { apiClient, storyCover } from "../lib/apiClient";
import { useUser } from "../hooks/useUser";

const blankChapter = {
  title: "",
  chapterNumber: 1,
  content: "",
  audioUrl: "",
  status: "draft",
  scheduledFor: "",
};

export default function StoryWorkspace() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useUser();
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState("");
  const [form, setForm] = useState(blankChapter);
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentUserId = user?.id || user?._id;
  const storyOwnerId = story?.authorId?._id || story?.authorId?.id || story?.authorId;
  const canManage = Boolean(currentUserId && storyOwnerId && (String(currentUserId) === String(storyOwnerId) || isAdmin));

  const grouped = useMemo(
    () => ({
      published: chapters.filter((chapter) => chapter.status === "published"),
      drafts: chapters.filter((chapter) => chapter.status === "draft"),
      scheduled: chapters.filter((chapter) => chapter.status === "scheduled"),
    }),
    [chapters]
  );

  const loadWorkspace = () => {
    setLoading(true);
    Promise.all([
      apiClient.get(`/stories/id/${storyId}`),
      apiClient.get(`/stories/${storyId}/chapters`, { params: { includeDrafts: true } }),
    ])
      .then(([storyResponse, chaptersResponse]) => {
        setStory(storyResponse.data.story);
        setChapters(chaptersResponse.data.chapters || []);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Could not load story workspace");
        navigate("/writer-dashboard");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) loadWorkspace();
  }, [storyId, user]);

  if (!user) return <Navigate to="/login" replace />;
  if (loading) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Loading story workspace...</main>;
  if (!story) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Story not found.</main>;
  if (!canManage) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">You cannot manage this story.</main>;

  const nextChapterNumber = chapters.reduce((max, chapter) => Math.max(max, Number(chapter.chapterNumber) || 0), 0) + 1;

  const openNewChapter = () => {
    setEditingChapterId("");
    setAudioFile(null);
    setForm({ ...blankChapter, title: `Chapter ${nextChapterNumber}`, chapterNumber: nextChapterNumber });
    setEditorOpen(true);
  };

  const openEditChapter = (chapter) => {
    setEditingChapterId(chapter._id);
    setAudioFile(null);
    setForm({
      title: chapter.title || "",
      chapterNumber: chapter.chapterNumber || 1,
      content: chapter.content || "",
      audioUrl: chapter.audio?.url || "",
      status: chapter.status || "draft",
      scheduledFor: chapter.scheduledFor ? new Date(chapter.scheduledFor).toISOString().slice(0, 16) : "",
    });
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uploadAudio = async () => {
    if (!audioFile) return form.audioUrl;
    const formData = new FormData();
    formData.append("file", audioFile);
    const { data } = await apiClient.post("/uploads/audio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.secureUrl;
  };

  const saveChapter = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return toast.error("Chapter title is required");
    if (!form.content.trim()) return toast.error("Chapter content is required");

    setSaving(true);
    try {
      const uploadedAudioUrl = await uploadAudio();
      const payload = {
        title: form.title,
        chapterNumber: Number(form.chapterNumber),
        content: form.content,
        status: form.status,
        scheduledFor: form.status === "scheduled" ? form.scheduledFor || undefined : undefined,
        audio: uploadedAudioUrl ? { source: "upload", url: uploadedAudioUrl } : { source: "none" },
      };

      if (editingChapterId) {
        await apiClient.put(`/stories/${storyId}/chapters/by-id/${editingChapterId}`, payload);
        toast.success("Chapter updated");
      } else {
        await apiClient.post(`/stories/${storyId}/chapters`, payload);
        toast.success(form.status === "published" ? "Chapter published" : "Chapter saved");
      }

      setEditorOpen(false);
      setEditingChapterId("");
      loadWorkspace();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Could not save chapter");
    } finally {
      setSaving(false);
    }
  };

  const deleteChapter = async (chapter) => {
    const confirmed = window.confirm(`Delete ${chapter.title}?`);
    if (!confirmed) return;
    try {
      await apiClient.delete(`/stories/${storyId}/chapters/by-id/${chapter._id}`);
      toast.success("Chapter deleted");
      loadWorkspace();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete chapter");
    }
  };

  const duplicateChapter = async (chapter) => {
    try {
      await apiClient.post(`/stories/${storyId}/chapters/by-id/${chapter._id}/duplicate`);
      toast.success("Chapter duplicated as draft");
      loadWorkspace();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not duplicate chapter");
    }
  };

  const setChapterStatus = async (chapter, status) => {
    try {
      await apiClient.patch(`/stories/${storyId}/chapters/by-id/${chapter._id}/status`, { status });
      toast.success(status === "published" ? "Chapter published" : "Chapter moved to draft");
      loadWorkspace();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update chapter");
    }
  };

  const moveChapter = async (chapterId, direction) => {
    const orderedIds = chapters.map((chapter) => chapter._id);
    const index = orderedIds.indexOf(chapterId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= orderedIds.length) return;
    [orderedIds[index], orderedIds[nextIndex]] = [orderedIds[nextIndex], orderedIds[index]];

    try {
      const { data } = await apiClient.post(`/stories/${storyId}/chapters/reorder`, { orderedIds });
      setChapters(data.chapters || []);
      toast.success("Chapter order updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reorder chapters");
    }
  };

  const publishStory = async () => {
    try {
      const { data } = await apiClient.put(`/stories/${story._id}`, {
        visibility: "public",
        publishing: { ...(story.publishing || {}), publishedAt: story.publishing?.publishedAt || new Date().toISOString() },
      });
      setStory(data.story);
      toast.success("Story published");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not publish story");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 md:grid-cols-[150px_1fr_auto]">
            <img src={storyCover(story)} alt={story.title} className="aspect-[2/3] w-full rounded-lg object-cover" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Story Workspace</p>
              <h1 className="mt-2 text-4xl font-black text-gray-950">{story.title}</h1>
              <p className="mt-3 max-w-3xl text-gray-600">{story.description}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-black">
                <span className="rounded-full bg-orange-50 px-3 py-2 capitalize text-orange-700">{story.category}</span>
                <span className="rounded-full bg-gray-100 px-3 py-2 capitalize text-gray-700">{story.status}</span>
                <span className="rounded-full bg-gray-100 px-3 py-2 capitalize text-gray-700">{story.visibility}</span>
                <span className="rounded-full bg-gray-100 px-3 py-2 text-gray-700">{chapters.length} chapters</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link to={`/edit/${story._id}`} className="rounded-lg bg-gray-100 px-4 py-3 text-center font-black text-gray-900 hover:bg-gray-200">
                Edit Story
              </Link>
              <Link to={`/story/${story.slug}`} className="rounded-lg bg-white px-4 py-3 text-center font-black text-gray-900 ring-1 ring-gray-200 hover:bg-orange-50">
                Preview Story
              </Link>
              <button onClick={publishStory} className="rounded-lg bg-orange-600 px-4 py-3 font-black text-white hover:bg-orange-700">
                Publish Story
              </button>
            </div>
          </div>
        </div>

        {editorOpen && (
          <form onSubmit={saveChapter} className="rounded-lg border border-orange-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Chapter Editor</p>
                <h2 className="text-2xl font-black text-gray-950">{editingChapterId ? "Edit Chapter" : "New Chapter"}</h2>
              </div>
              <button type="button" onClick={() => setEditorOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 font-black text-gray-800">
                Close
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_140px_170px]">
              <Input label="Chapter title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} required />
              <Input label="Number" type="number" min="1" value={form.chapterNumber} onChange={(value) => setForm((current) => ({ ...current, chapterNumber: value }))} required />
              <Select label="Status" value={form.status} options={["draft", "published", "scheduled"]} onChange={(value) => setForm((current) => ({ ...current, status: value }))} />
            </div>
            {form.status === "scheduled" && (
              <div className="mt-4 max-w-xs">
                <Input label="Schedule date" type="datetime-local" value={form.scheduledFor} onChange={(value) => setForm((current) => ({ ...current, scheduledFor: value }))} />
              </div>
            )}
            <label className="mt-4 block text-sm font-bold text-gray-700">
              Content
              <textarea
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                rows={14}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                required
              />
            </label>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="Audio URL optional" value={form.audioUrl} onChange={(value) => setForm((current) => ({ ...current, audioUrl: value }))} />
              <label className="block text-sm font-bold text-gray-700">
                Audio file optional
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/mp4"
                  onChange={(event) => setAudioFile(event.target.files?.[0] || null)}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-orange-600 file:px-3 file:py-2 file:font-bold file:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </label>
            </div>
            <button disabled={saving} className="mt-5 rounded-lg bg-orange-600 px-5 py-3 font-black text-white hover:bg-orange-700 disabled:bg-orange-300">
              {saving ? "Saving..." : "Save Chapter"}
            </button>
          </form>
        )}

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Chapter Manager</p>
              <h2 className="text-2xl font-black text-gray-950">Build this book</h2>
            </div>
            <button onClick={openNewChapter} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-black text-white hover:bg-orange-700">
              <Plus size={18} />
              New Chapter
            </button>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <ChapterGroup title="Published" chapters={grouped.published} onEdit={openEditChapter} onDelete={deleteChapter} onDuplicate={duplicateChapter} onStatus={setChapterStatus} onMove={moveChapter} allChapters={chapters} />
            <ChapterGroup title="Drafts" chapters={grouped.drafts} onEdit={openEditChapter} onDelete={deleteChapter} onDuplicate={duplicateChapter} onStatus={setChapterStatus} onMove={moveChapter} allChapters={chapters} />
            <ChapterGroup title="Scheduled" chapters={grouped.scheduled} onEdit={openEditChapter} onDelete={deleteChapter} onDuplicate={duplicateChapter} onStatus={setChapterStatus} onMove={moveChapter} allChapters={chapters} />
          </div>
        </section>
      </section>
    </main>
  );
}

function ChapterGroup({ title, chapters, onEdit, onDelete, onDuplicate, onStatus, onMove, allChapters }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-gray-950">{title}</h3>
        <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-gray-600">{chapters.length}</span>
      </div>
      <div className="mt-4 space-y-3">
        {chapters.map((chapter) => (
          <article key={chapter._id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
            <div className="flex items-start gap-3">
              <GripVertical className="mt-1 shrink-0 text-gray-400" size={18} />
              <div className="min-w-0 flex-1">
                <p className="font-black text-gray-950">Chapter {chapter.chapterNumber}</p>
                <p className="line-clamp-1 text-sm font-bold text-gray-600">{chapter.title}</p>
                <p className="mt-1 text-xs font-semibold capitalize text-orange-700">{chapter.status}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-black">
              <button onClick={() => onEdit(chapter)} className="inline-flex items-center justify-center gap-1 rounded-lg bg-gray-100 px-2 py-2 text-gray-800 hover:bg-gray-200">
                <Edit size={13} /> Edit
              </button>
              <Link to={`/read/${chapter.storyId}/${chapter.chapterNumber}`} className="inline-flex items-center justify-center gap-1 rounded-lg bg-gray-100 px-2 py-2 text-gray-800 hover:bg-gray-200">
                <Eye size={13} /> Preview
              </Link>
              <button onClick={() => onDuplicate(chapter)} className="inline-flex items-center justify-center gap-1 rounded-lg bg-gray-100 px-2 py-2 text-gray-800 hover:bg-gray-200">
                <Copy size={13} /> Duplicate
              </button>
              <button onClick={() => onDelete(chapter)} className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-50 px-2 py-2 text-red-700 hover:bg-red-100">
                <Trash2 size={13} /> Delete
              </button>
              <button onClick={() => onStatus(chapter, chapter.status === "published" ? "draft" : "published")} className="col-span-2 rounded-lg bg-orange-50 px-2 py-2 text-orange-700 hover:bg-orange-100">
                {chapter.status === "published" ? "Unpublish" : "Publish"}
              </button>
              <button onClick={() => onMove(chapter._id, -1)} disabled={allChapters[0]?._id === chapter._id} className="rounded-lg bg-white px-2 py-2 text-gray-700 ring-1 ring-gray-200 disabled:opacity-40">
                Move Up
              </button>
              <button onClick={() => onMove(chapter._id, 1)} disabled={allChapters[allChapters.length - 1]?._id === chapter._id} className="rounded-lg bg-white px-2 py-2 text-gray-700 ring-1 ring-gray-200 disabled:opacity-40">
                Move Down
              </button>
            </div>
          </article>
        ))}
        {chapters.length === 0 && <p className="rounded-lg bg-white p-4 text-sm text-gray-500">No chapters here yet.</p>}
      </div>
    </div>
  );
}

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
