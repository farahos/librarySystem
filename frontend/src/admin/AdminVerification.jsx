import React, { useEffect, useState } from "react";
import { apiClient } from "../lib/apiClient";

const statuses = ["", "pending", "approved", "rejected"];

export default function AdminVerification() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/admin/verification-requests", {
        params: status ? { status } : {},
      });
      setRequests(data.requests || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const review = async (request, action) => {
    await apiClient.patch(`/admin/verification-requests/${request._id}/${action}`, {
      notes: action === "approve" ? "Verification approved" : "Verification rejected",
    });
    load();
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black text-gray-950">Verification</h1>
            <p className="mt-2 text-sm font-semibold text-gray-500">Verification is a badge only, not admin power.</p>
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          >
            {statuses.map((item) => (
              <option key={item || "all"} value={item}>
                {item || "All statuses"}
              </option>
            ))}
          </select>
        </div>

        <section className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {loading && <p className="p-5 text-sm font-bold text-gray-500">Loading verification requests...</p>}
          {!loading && requests.length === 0 && <p className="p-5 text-sm font-bold text-gray-500">No verification requests.</p>}
          {!loading &&
            requests.map((request) => (
              <article key={request._id} className="grid gap-4 border-b border-gray-100 p-4 lg:grid-cols-[1fr_160px_260px]">
                <div>
                  <p className="font-black text-gray-950">{request.userId?.displayName || request.userId?.username}</p>
                  <p className="text-sm font-semibold text-gray-500">{request.userId?.email}</p>
                  {request.qualityNotes && <p className="mt-2 text-sm text-gray-700">{request.qualityNotes}</p>}
                </div>
                <span className="rounded-lg bg-gray-100 px-3 py-2 text-center text-sm font-black capitalize text-gray-700">
                  {request.status}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => review(request, "approve")} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-black text-white">
                    Approve
                  </button>
                  <button onClick={() => review(request, "reject")} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-black text-white">
                    Reject
                  </button>
                  <button onClick={() => review(request, "more-info")} className="rounded-lg bg-gray-950 px-3 py-2 text-sm font-black text-white">
                    More Info
                  </button>
                </div>
              </article>
            ))}
        </section>
      </div>
    </main>
  );
}
