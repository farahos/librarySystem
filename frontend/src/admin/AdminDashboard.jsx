import React, { useEffect, useState } from "react";
import { BookOpen, Flag, ShieldCheck, Sparkles, UserX, Users } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import FeatureManager from "./FeatureManager";
import ModerationQueue from "./ModerationQueue";
import { useUser } from "../hooks/useUser";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const { isAdmin } = useUser();

  useEffect(() => {
    apiClient
      .get("/admin/analytics")
      .then(({ data }) => setAnalytics(data))
      .catch(() => setAnalytics(null));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Madal Admin</p>
        <h1 className="mt-2 text-4xl font-black text-gray-950">Dashboard</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Stat icon={Users} label="Users" value={analytics?.totalUsers || analytics?.users || 0} />
          <Stat icon={BookOpen} label="Stories" value={analytics?.stories || 0} />
          <Stat icon={Flag} label="Reports" value={analytics?.reports || 0} />
          <Stat icon={ShieldCheck} label="Pending Verification" value={analytics?.pendingVerifications || 0} />
          <Stat icon={UserX} label="Suspended Users" value={analytics?.suspendedUsers || 0} />
          <Stat icon={Sparkles} label="Featured Story" value={analytics?.featuredStory?.title || "None"} />
        </div>

        <div className={`mt-8 grid gap-6 ${isAdmin ? "xl:grid-cols-[1fr_420px]" : ""}`}>
          <ModerationQueue embedded />
          {isAdmin && <FeatureManager />}
        </div>
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value }) {
  const isText = typeof value === "string" && Number.isNaN(Number(value));
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <Icon className="text-orange-600" size={22} />
      <p className={`mt-3 font-black text-gray-950 ${isText ? "truncate text-lg" : "text-3xl"}`}>{value}</p>
      <p className="text-sm font-bold text-gray-500">{label}</p>
    </div>
  );
}
