import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { useUser } from "../hooks/useUser";

export function notificationText(notification) {
  const payload = notification.payload || {};
  const actor = notification.actorId?.displayName || notification.actorId?.username || "Someone";

  if (notification.type === "new_follower") return `${actor} followed you.`;
  if (notification.type === "story_like") return `Your story "${payload.storyTitle || "a story"}" received a new like.`;
  if (notification.type === "chapter_comment") return `New comment on ${payload.chapterTitle || "a chapter"}.`;
  if (notification.type === "new_chapter") return `${actor} published ${payload.chapterTitle || "a new chapter"}.`;
  if (notification.type === "verification_approved") return "Your writer verification was approved.";
  if (notification.type === "verification_rejected") return "Your writer verification was rejected.";
  if (notification.type === "featured_story") return "Your story was featured on Madal.";
  return "New notification from Madal.";
}

export function notificationLink(notification) {
  const payload = notification.payload || {};
  if (notification.type === "chapter_comment" && payload.storyId && payload.chapterNumber) {
    return `/read/${payload.storyId}/${payload.chapterNumber}#comments`;
  }
  if (payload.storyId && payload.chapterNumber) return `/read/${payload.storyId}/${payload.chapterNumber}`;
  if (payload.storySlug) return `/story/${payload.storySlug}`;
  if (notification.type === "new_follower" && notification.actorId?.username) return `/user/${notification.actorId.username}`;
  return "/notifications";
}

const NotificationsPage = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiClient
      .get("/notifications", { params: { limit: 100 } })
      .then(({ data }) => setNotifications(data.notifications || []))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || notifications.length === 0) return;
    apiClient.patch("/notifications/read", { ids: notifications.filter((item) => !item.read).map((item) => item._id) }).catch(() => {});
  }, [user, notifications]);

  if (!user) return <Navigate to="/login" replace />;
  if (loading) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Loading notifications...</main>;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-3xl">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Madal</p>
          <h1 className="mt-2 text-3xl font-black text-gray-950">Notifications</h1>
        </div>

        <div className="mt-6 space-y-3">
          {notifications.map((notification) => (
            <Link
              key={notification._id}
              to={notificationLink(notification)}
              className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                <Bell size={18} />
              </span>
              <div>
                <p className="font-bold text-gray-950">{notificationText(notification)}</p>
                <p className="mt-1 text-sm font-semibold text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
              </div>
            </Link>
          ))}
          {notifications.length === 0 && <div className="rounded-lg border border-gray-200 bg-white p-8 text-gray-500">No notifications yet.</div>}
        </div>
      </section>
    </main>
  );
};

export default NotificationsPage;
