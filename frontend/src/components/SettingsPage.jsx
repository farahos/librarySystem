import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Globe, Lock, Moon } from "lucide-react";
import { Navigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { useUser } from "../hooks/useUser";

const SettingsPage = () => {
  const { user } = useUser();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [language, setLanguage] = useState(() => localStorage.getItem("madalLanguage") || "so");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("madalDarkMode") === "true");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("madalLanguage", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("madalDarkMode", String(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  if (!user) return <Navigate to="/login" replace />;

  const updatePassword = (field, value) => setPasswordForm((current) => ({ ...current, [field]: value }));

  const changePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiClient.patch("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-3xl">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Account</p>
          <h1 className="mt-2 text-3xl font-black text-gray-950">Settings</h1>
          <p className="mt-2 text-gray-600">Manage password, language, and system theme.</p>
        </div>

        <div className="mt-8 space-y-5">
          <form onSubmit={changePassword} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <SectionTitle icon={Lock} title="Change Password" text="Update your login password." />
            <div className="mt-5 space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(value) => updatePassword("currentPassword", value)}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(value) => updatePassword("newPassword", value)}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(value) => updatePassword("confirmPassword", value)}
                />
              </div>
              <button disabled={loading} className="rounded-lg bg-orange-600 px-5 py-3 font-black text-white hover:bg-orange-700 disabled:bg-orange-300">
                {loading ? "Saving..." : "Change Password"}
              </button>
            </div>
          </form>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <SectionTitle icon={Globe} title="Change Language" text="Choose the language preference for Madal." />
            <label className="mt-5 block text-sm font-bold text-gray-700">
              Language
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500"
              >
                <option value="so">Somali</option>
                <option value="en">English</option>
              </select>
            </label>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle icon={Moon} title="Dark System" text="Switch Madal between dark and light mode across the whole app." />
              <button
                onClick={() => setDarkMode((value) => !value)}
                className={`w-fit rounded-lg px-5 py-3 font-black ${
                  darkMode ? "bg-gray-950 text-white hover:bg-gray-800" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {darkMode ? "Use Light Mode" : "Use Dark Mode"}
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};

function SectionTitle({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
        <Icon size={20} />
      </span>
      <div>
        <h2 className="text-xl font-black text-gray-950">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-gray-500">{text}</p>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block text-sm font-bold text-gray-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        required
      />
    </label>
  );
}

export default SettingsPage;
