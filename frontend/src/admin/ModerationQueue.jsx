import React, { useEffect, useState } from "react";
import { apiClient } from "../lib/apiClient";

export default function ModerationQueue() {
  const [reports, setReports] = useState([]);

  const loadReports = () => {
    apiClient
      .get("/reports", { params: { status: "open" } })
      .then(({ data }) => setReports(data.reports || []))
      .catch(() => setReports([]));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const resolveReport = async (id) => {
    await apiClient.patch(`/reports/${id}/resolve`, { status: "resolved", action: "none" });
    loadReports();
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-gray-950">Moderation Queue</h2>
      <div className="mt-4 space-y-3">
        {reports.map((report) => (
          <div key={report._id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-gray-900">{report.targetType} report</p>
                <p className="text-sm text-gray-600">{report.reason}</p>
                {report.details && <p className="mt-2 text-sm text-gray-700">{report.details}</p>}
              </div>
              <button
                onClick={() => resolveReport(report._id)}
                className="rounded-lg bg-gray-950 px-3 py-2 text-sm font-bold text-white"
              >
                Resolve
              </button>
            </div>
          </div>
        ))}
        {reports.length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-gray-500">No open reports.</p>}
      </div>
    </section>
  );
}
