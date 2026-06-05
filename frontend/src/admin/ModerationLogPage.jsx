import React, { useEffect, useState } from "react";
import { apiClient } from "../lib/apiClient";

export default function ModerationLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get("/admin/logs")
      .then(({ data }) => setLogs(data.logs || []))
      .catch((err) => setError(err.response?.data?.message || "Could not load moderation logs."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black text-gray-950">Moderation Log</h1>
        <p className="mt-2 text-sm font-semibold text-gray-500">Owner-only audit trail for platform actions.</p>

        <section className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {loading && <p className="p-5 text-sm font-bold text-gray-500">Loading logs...</p>}
          {error && <p className="p-5 text-sm font-bold text-red-700">{error}</p>}
          {!loading && !error && logs.length === 0 && <p className="p-5 text-sm font-bold text-gray-500">No logs yet.</p>}
          {!loading &&
            !error &&
            logs.map((log) => (
              <article key={log._id} className="grid gap-3 border-b border-gray-100 p-4 lg:grid-cols-[220px_1fr_160px]">
                <div>
                  <p className="font-black text-gray-950">{log.actorId?.displayName || log.actorId?.username || "System"}</p>
                  <p className="text-xs font-bold text-gray-500">{log.actorRole || log.actorId?.roles?.[0] || "unknown"}</p>
                </div>
                <div>
                  <p className="font-black text-gray-900">{log.action}</p>
                  <p className="text-sm text-gray-600">
                    {log.targetType} · {log.targetId}
                  </p>
                  {log.reason && <p className="mt-1 text-sm text-gray-700">{log.reason}</p>}
                </div>
                <time className="text-sm font-bold text-gray-500">{new Date(log.createdAt).toLocaleString()}</time>
              </article>
            ))}
        </section>
      </div>
    </main>
  );
}
