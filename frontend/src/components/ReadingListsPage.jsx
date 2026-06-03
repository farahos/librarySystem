import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Edit, ListPlus, Trash2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { apiClient, formatCount } from "../lib/apiClient";
import { useUser } from "../hooks/useUser";

const emptyForm = { name: "", description: "", isPublic: true };

export default function ReadingListsPage() {
  const { user } = useUser();
  const [lists, setLists] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadLists = () => {
    setLoading(true);
    apiClient
      .get("/reading-lists")
      .then(({ data }) => setLists(data.lists || []))
      .catch((err) => toast.error(err.response?.data?.message || "Could not load reading lists"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) loadLists();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const submitList = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return toast.error("List name is required");
    setSaving(true);
    try {
      if (editingId) {
        const { data } = await apiClient.put(`/reading-lists/${editingId}`, form);
        setLists((current) => current.map((list) => (list._id === editingId ? data.list : list)));
        toast.success("Reading list updated");
      } else {
        const { data } = await apiClient.post("/reading-lists", form);
        setLists((current) => [data.list, ...current]);
        toast.success("Reading list created");
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save reading list");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (list) => {
    setEditingId(list._id);
    setForm({
      name: list.name || "",
      description: list.description || "",
      isPublic: list.isPublic !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteList = async (listId) => {
    const confirmed = window.confirm("Delete this reading list?");
    if (!confirmed) return;
    try {
      await apiClient.delete(`/reading-lists/${listId}`);
      setLists((current) => current.filter((list) => list._id !== listId));
      toast.success("Reading list deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete reading list");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-600">My Library</p>
        <h1 className="mt-2 text-4xl font-black text-gray-950">Reading Lists</h1>

        <form onSubmit={submitList} className="mt-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <label className="text-sm font-bold text-gray-700">
              List name
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Favorite Somali Stories"
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500"
              />
            </label>
            <label className="text-sm font-bold text-gray-700">
              Description
              <input
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Stories I want to keep close."
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500"
              />
            </label>
            <label className="flex items-end gap-2 pb-3 text-sm font-bold text-gray-700">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(event) => setForm((current) => ({ ...current, isPublic: event.target.checked }))}
                className="h-4 w-4 accent-orange-600"
              />
              Public
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-3 font-black text-white hover:bg-orange-700 disabled:opacity-60">
              <ListPlus size={18} />
              {saving ? "Saving..." : editingId ? "Update List" : "Create List"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-lg bg-gray-100 px-4 py-3 font-black text-gray-900 hover:bg-gray-200">
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <p className="mt-6 rounded-lg bg-white p-6 text-gray-500">Loading reading lists...</p>
        ) : lists.length === 0 ? (
          <p className="mt-6 rounded-lg bg-white p-6 text-gray-500">No reading lists yet.</p>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <article key={list._id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <Link to={`/reading-lists/${list._id}`} className="text-xl font-black text-gray-950 hover:text-orange-700">
                  {list.name}
                </Link>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{list.description || "A Madal reading list."}</p>
                <div className="mt-4 flex items-center justify-between text-sm font-bold">
                  <span className="text-orange-700">{formatCount(list.storiesCount || 0)} stories</span>
                  <span className="text-gray-500">{list.isPublic ? "Public" : "Private"}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => startEdit(list)} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-bold text-gray-900 hover:bg-gray-200">
                    <Edit size={15} />
                    Edit
                  </button>
                  <button onClick={() => deleteList(list._id)} className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100">
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
