import React, { useEffect, useState } from "react";
import { BarChart2, BookOpen, Flag, MessageCircle, ShieldCheck, UserX, Users } from "lucide-react";
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat icon={Users} label="Total Users" value={analytics?.totalUsers || analytics?.users || 0} />
          <Stat icon={ShieldCheck} label="Active Users" value={analytics?.activeUsers || 0} />
          <Stat icon={BookOpen} label="Stories" value={analytics?.stories || 0} />
          <Stat icon={BarChart2} label="Chapters" value={analytics?.chapters || 0} />
          <Stat icon={MessageCircle} label="Comments" value={analytics?.comments || 0} />
          <Stat icon={Flag} label="Reports" value={analytics?.reports || 0} />
          <Stat icon={UserX} label="Suspended" value={analytics?.suspendedUsers || 0} />
          <Stat icon={UserX} label="Banned" value={analytics?.bannedUsers || 0} />
          <Stat icon={ShieldCheck} label="Verifications" value={analytics?.pendingVerifications || 0} />
          <Stat icon={Users} label="Daily New Users" value={analytics?.dailyNewUsers || 0} />
          <Stat icon={BarChart2} label="Daily Reads" value={analytics?.dailyReads || 0} />
          <Stat icon={BookOpen} label="Daily Publishes" value={analytics?.dailyStoryPublishes || 0} />
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
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <Icon className="text-orange-600" size={22} />
      <p className="mt-3 text-3xl font-black text-gray-950">{value}</p>
      <p className="text-sm font-bold text-gray-500">{label}</p>
    </div>
  );
}
