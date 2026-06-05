import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { useUser } from "../hooks/useUser";
import { Avatar } from "./UserProfile";

const EditProfile = () => {
  const { user, login, setUser } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    bio: "",
    avatarUrl: "",
    coverUrl: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      displayName: user.displayName || "",
      username: user.username || "",
      bio: user.bio || "",
      avatarUrl: user.avatarUrl || "",
      coverUrl: user.coverUrl || "",
    });
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const uploadImage = async (file, fallbackUrl) => {
    if (!file) return fallbackUrl;
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post("/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.secureUrl;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const avatarUrl = await uploadImage(avatarFile, form.avatarUrl);
      const coverUrl = await uploadImage(coverFile, form.coverUrl);
      const { data } = await apiClient.patch("/users/me", {
        displayName: form.displayName,
        username: form.username,
        bio: form.bio,
        avatarUrl,
        coverUrl,
      });

      const nextUser = data.user;
      localStorage.setItem("user", JSON.stringify(nextUser));
      localStorage.setItem("userId", nextUser.id || nextUser._id || "");
      localStorage.setItem("userRole", nextUser.role || "user");
      setUser(nextUser);
      login({ user: nextUser, token: localStorage.getItem("token") }, 7 * 24 * 60 * 60);
      toast.success("Profile updated");
      navigate(`/user/${nextUser.username}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Could not update profile");
    } finally {
      setLoading(false);
    }
  };

  const previewProfile = {
    displayName: form.displayName || form.username,
    username: form.username,
    avatarUrl: avatarFile ? URL.createObjectURL(avatarFile) : form.avatarUrl,
  };
  const coverPreview = coverFile ? URL.createObjectURL(coverFile) : form.coverUrl;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Profile</p>
          <h1 className="mt-2 text-3xl font-black text-gray-950">Edit Profile</h1>
          <p className="mt-2 text-gray-600">Manage your public Madal identity.</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <div className="h-40 bg-gray-900">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-bold text-gray-400">Profile cover preview</div>
            )}
          </div>
          <label className="block p-4 text-sm font-bold text-gray-700">
            Profile Cover
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
              className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-orange-600 file:px-3 file:py-2 file:font-bold file:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
            {coverFile && <span className="mt-2 block truncate text-xs font-semibold text-gray-500">{coverFile.name}</span>}
          </label>
        </div>

        <div className="flex flex-col gap-4 rounded-lg bg-gray-50 p-4 sm:flex-row sm:items-center">
          <Avatar profile={previewProfile} size="large" />
          <label className="block flex-1 text-sm font-bold text-gray-700">
            Avatar
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
              className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-orange-600 file:px-3 file:py-2 file:font-bold file:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
            {avatarFile && <span className="mt-2 block truncate text-xs font-semibold text-gray-500">{avatarFile.name}</span>}
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Display Name" value={form.displayName} onChange={(value) => update("displayName", value)} />
          <Input label="Username" value={form.username} onChange={(value) => update("username", value.toLowerCase())} required />
        </div>

        <label className="block text-sm font-bold text-gray-700">
          Bio
          <textarea
            value={form.bio}
            onChange={(event) => update("bio", event.target.value.slice(0, 500))}
            rows={6}
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="Somali storyteller passionate about history and philosophy."
          />
          <span className="mt-2 block text-xs font-semibold text-gray-500">{form.bio.length}/500</span>
        </label>

        <div className="flex flex-wrap gap-3">
          <button disabled={loading} className="rounded-lg bg-orange-600 px-5 py-3 font-black text-white hover:bg-orange-700 disabled:bg-orange-300">
            {loading ? "Saving..." : "Save Profile"}
          </button>
          <button type="button" onClick={() => navigate("/profile")} className="rounded-lg bg-gray-100 px-5 py-3 font-black text-gray-800 hover:bg-gray-200">
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
};

function Input({ label, value, onChange, required = false }) {
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

export default EditProfile;
