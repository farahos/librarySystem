import React, { useEffect, useMemo, useState } from "react";
import { Archive, Ban, EyeOff, Flag, Loader2, ShieldAlert, Trash2, UserX } from "lucide-react";
import { apiClient } from "../lib/apiClient";

const statuses = [
  { value: "", label: "New Reports" },
  { value: "pending", label: "Pending Reports" },
  { value: "action_taken", label: "Actioned Reports" },
  { value: "dismissed", label: "Dismissed Reports" },
  { value: "escalated", label: "Escalated Reports" },
];

const reasonLabels = {
  sexual_content: "Sexual Content",
  harassment: "Harassment",
  hate_speech: "Hate Speech",
  violence: "Violence",
  spam: "Spam",
  copyright: "Copyright",
  impersonation: "Impersonation",
  other: "Other",
};

function targetTitle(report) {
  if (report.preview?.title) return report.preview.title;
  const target = report.target;
  if (report.targetType === "story") return target?.title || "Story";
  if (report.targetType === "chapter") return target?.title || "Chapter";
  if (report.targetType === "comment") return target?.content || "Comment";
  if (report.targetType === "user") return target?.username || target?.displayName || "User profile";
  return "Reported content";
}

function targetUser(report) {
  if (report.preview?.authorName) return report.preview.authorName;
  const target = report.target;
  return (
    target?.authorId?.username ||
    target?.authorId?.displayName ||
    target?.storyId?.authorId?.username ||
    target?.username ||
    target?.displayName ||
    "Unknown user"
  );
}

export default function ModerationQueue({ embedded = false }) {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const counts = useMemo(
    () => ({
      pending: reports.filter((report) => report.status === "pending").length,
      action_taken: reports.filter((report) => report.status === "action_taken").length,
      dismissed: reports.filter((report) => report.status === "dismissed").length,
      escalated: reports.filter((report) => report.status === "escalated").length,
    }),
    [reports]
  );

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/admin/reports", {
        params: status ? { status } : {},
      });
      setReports(data.reports || []);
    } catch (err) {
      console.error(err.response?.data || err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [status]);

  const act = async (report, action, extra = {}) => {
    setBusyId(`${report._id}:${action}`);
    try {
      await apiClient.patch(`/admin/reports/${report._id}/resolve`, {
        action,
        notes: extra.reason || reasonLabels[report.reason] || report.reason,
        ...extra,
      });
      await loadReports();
    } finally {
      setBusyId("");
    }
  };

  const content = (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-950 text-white">
            <Flag size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-950">Moderation Queue</h2>
            <p className="text-sm font-semibold text-gray-500">
              {counts.pending} pending, {counts.action_taken} actioned, {counts.dismissed} dismissed, {counts.escalated} escalated
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {statuses.map((item) => (
            <button
              key={item.label}
              onClick={() => setStatus(item.value)}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                status === item.value ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-4 text-sm font-bold text-gray-500">
            <Loader2 className="animate-spin" size={18} />
            Loading reports
          </div>
        )}

        {!loading && reports.length === 0 && (
          <p className="rounded-lg bg-gray-50 p-4 text-sm font-semibold text-gray-500">No reports in this view.</p>
        )}

        {!loading &&
          reports.map((report) => (
            <article key={report._id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wide text-orange-600">
                    {report.targetType} report · {report.reportCount || 1} report{(report.reportCount || 1) === 1 ? "" : "s"}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-lg font-black text-gray-950">{targetTitle(report)}</h3>
                  <p className="text-sm font-semibold text-gray-600">
                    By {targetUser(report)} · Reported by {report.preview?.reporterName || report.reporterId?.displayName || report.reporterId?.username || "Unknown"}
                  </p>
                </div>
                <span className="rounded-lg bg-white px-3 py-1 text-xs font-black text-gray-700 ring-1 ring-gray-200">
                  {reasonLabels[report.reason] || report.reason}
                </span>
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_220px]">
                <div className="rounded-lg bg-white p-3 text-sm text-gray-700">
                  <p className="text-xs font-black uppercase tracking-wide text-gray-400">Reported content</p>
                  <p className="mt-1 line-clamp-5 whitespace-pre-wrap">{report.preview?.content || "No preview available."}</p>
                </div>
                <div className="rounded-lg bg-white p-3 text-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-gray-400">Context</p>
                  <p className="mt-1 font-bold text-gray-700">Status: {report.preview?.status || report.status}</p>
                  {report.preview?.authorEmail && <p className="mt-1 truncate text-gray-600">{report.preview.authorEmail}</p>}
                  {report.preview?.metadata?.storyTitle && <p className="mt-1 text-gray-600">Story: {report.preview.metadata.storyTitle}</p>}
                  {report.preview?.metadata?.chapterTitle && <p className="mt-1 text-gray-600">Chapter: {report.preview.metadata.chapterTitle}</p>}
                  {report.preview?.metadata?.roles && <p className="mt-1 text-gray-600">Roles: {report.preview.metadata.roles.join(", ")}</p>}
                </div>
              </div>

              {(report.description || report.details) && (
                <p className="mt-3 rounded-lg bg-orange-50 p-3 text-sm font-semibold text-orange-900">{report.description || report.details}</p>
              )}

              {report.status === "pending" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <ActionButton busy={busyId === `${report._id}:dismiss`} onClick={() => act(report, "dismiss")} label="Dismiss" icon={Archive} />
                  <ActionButton busy={busyId === `${report._id}:warn_user`} onClick={() => act(report, "warn_user")} label="Warn User" icon={ShieldAlert} />
                  <ActionButton busy={busyId === `${report._id}:hide_content`} onClick={() => act(report, "hide_content")} label="Hide Content" icon={EyeOff} />
                  {report.targetType === "comment" && (
                    <ActionButton busy={busyId === `${report._id}:delete_comment`} onClick={() => act(report, "delete_comment")} label="Delete Comment" icon={Trash2} />
                  )}
                  <ActionButton busy={busyId === `${report._id}:suspend_user`} onClick={() => act(report, "suspend_user", { durationDays: 7 })} label="Suspend User" icon={UserX} />
                  <ActionButton busy={busyId === `${report._id}:ban_user`} onClick={() => act(report, "ban_user")} label="Ban User" icon={Ban} />
                  <ActionButton busy={busyId === `${report._id}:escalate`} onClick={() => act(report, "escalate")} label="Escalate" icon={Flag} />
                </div>
              )}
            </article>
          ))}
      </div>
    </section>
  );

  if (embedded) return content;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">{content}</div>
    </main>
  );
}

function ActionButton({ busy, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {busy ? <Loader2 className="animate-spin" size={16} /> : <Icon size={16} />}
      {label}
    </button>
  );
}
