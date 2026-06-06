import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Flag, XCircle } from "lucide-react";
import { apiClient } from "../lib/apiClient";

export default function ModerationOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/admin/moderation")
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const counts = data?.counts || {};

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-wide text-orange-600">Platform</p>
        <h1 className="mt-2 text-4xl font-black text-gray-950">Moderation</h1>
        <p className="mt-2 text-sm font-semibold text-gray-500">Report health, recent actions, and escalations.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={Clock} label="Pending Reports" value={counts.pendingReports || 0} />
          <Metric icon={CheckCircle2} label="Actioned Reports" value={counts.actionedReports || 0} />
          <Metric icon={XCircle} label="Dismissed Reports" value={counts.dismissedReports || 0} />
          <Metric icon={AlertTriangle} label="Escalated Reports" value={counts.escalatedReports || 0} />
        </div>

        {loading && <p className="mt-6 rounded-lg bg-white p-5 text-sm font-bold text-gray-500">Loading moderation overview...</p>}

        {!loading && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-gray-950">Recent Moderation Actions</h2>
              <div className="mt-4 space-y-3">
                {(data?.recentActions || []).length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm font-bold text-gray-500">No recent actions.</p>}
                {(data?.recentActions || []).map((action) => (
                  <article key={action._id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="font-black text-gray-950">{action.action}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-600">
                      {action.actorId?.displayName || action.actorId?.username || "System"} · {action.targetType}
                    </p>
                    {action.reason && <p className="mt-1 text-sm text-gray-700">{action.reason}</p>}
                    <time className="mt-2 block text-xs font-bold text-gray-400">{new Date(action.createdAt).toLocaleString()}</time>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-gray-950">Escalated Cases</h2>
              <div className="mt-4 space-y-3">
                {(data?.escalatedCases || []).length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm font-bold text-gray-500">No escalated cases.</p>}
                {(data?.escalatedCases || []).map((report) => (
                  <article key={report._id} className="rounded-lg border border-orange-100 bg-orange-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-orange-600">{report.targetType} report</p>
                    <p className="mt-1 font-black text-gray-950">{report.reason}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-600">
                      Reported by {report.reporterId?.displayName || report.reporterId?.username || "Unknown"}
                    </p>
                    {report.description && <p className="mt-2 text-sm text-gray-700">{report.description}</p>}
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <Icon className="text-orange-600" size={22} />
      <p className="mt-3 text-3xl font-black text-gray-950">{value}</p>
      <p className="text-sm font-bold text-gray-500">{label}</p>
    </div>
  );
}
