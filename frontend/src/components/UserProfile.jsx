import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Award, CalendarDays, Heart, Library, Users } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { apiClient, formatCount, madalLogo } from "../lib/apiClient";
import { useUser } from "../hooks/useUser";
import StoryCard from "./StoryCard";

const tabs = ["Stories", "Reading Lists", "About"];
const defaultCover =
  "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=80";

const UserProfile = ({ own = false }) => {
  const { username: routeUsername } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const username = own ? user?.username : routeUsername;
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("Stories");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const currentUserId = user?.id || user?._id;
  const isOwnProfile = Boolean(currentUserId && profile?.id && String(currentUserId) === String(profile.id));

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    apiClient
      .get(`/users/profile/${username}`)
      .then(({ data }) => setProfile(data.profile))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [username]);

  const toggleFollow = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (isOwnProfile) return;

    setBusy(true);
    try {
      if (profile.isFollowing) {
        await apiClient.delete(`/users/${profile.id}/follow`);
      } else {
        await apiClient.post(`/users/${profile.id}/follow`);
      }

      setProfile((current) => ({
        ...current,
        isFollowing: !current.isFollowing,
        followersCount: current.followersCount + (current.isFollowing ? -1 : 1),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Follow action failed");
    } finally {
      setBusy(false);
    }
  };

  if (own && !user) return <Navigate to="/login" replace />;
  if (!username) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Profile not available.</main>;
  if (loading) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Loading profile...</main>;
  if (!profile) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Profile not found.</main>;

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white">
        <div className="relative h-40 bg-gray-950 sm:h-48 lg:h-56">
          <img src={profile.coverUrl || defaultCover} alt={`${profile.displayName} cover`} className="h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-7">
          <div className="relative z-10 -mt-10 flex flex-col gap-5 sm:-mt-12 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar profile={profile} size="large" />
              <div className="rounded-lg bg-white/95 pb-1 pr-4 pt-3 sm:pt-0">
                <h1 className="text-3xl font-black text-gray-950 sm:text-4xl">{profile.displayName}</h1>
                <p className="mt-1 font-semibold text-gray-500">@{profile.username}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {isOwnProfile ? (
                <Link to="/profile/edit" className="rounded-lg bg-orange-600 px-5 py-3 font-black text-white hover:bg-orange-700">
                  Edit Profile
                </Link>
              ) : (
                <button
                  onClick={toggleFollow}
                  disabled={busy}
                  className={`rounded-lg px-5 py-3 font-black ${
                    profile.isFollowing ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-orange-600 text-white hover:bg-orange-700"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {profile.isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-700">{profile.bio || "No bio yet."}</p>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm font-black text-gray-950">
            <SocialStat to={`/user/${profile.username}/followers`} label="Followers" value={profile.followersCount} />
            <SocialStat to={`/user/${profile.username}/following`} label="Following" value={profile.followingCount} />
            <SocialStat label="Likes" value={profile.totalLikes} />
            <SocialStat label="Stories" value={profile.totalStories} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {(profile.achievements || ["New Writer"]).map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-sm font-black text-orange-700">
                <Award size={16} />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-2 overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-black ${
                activeTab === tab ? "border-orange-600 text-orange-700" : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Stories" && (
          <div className="mt-6">
            {profile.publishedStories?.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {profile.publishedStories.map((story) => (
                  <StoryCard key={story._id} story={story} />
                ))}
              </div>
            ) : (
              <Empty text="No public stories yet." />
            )}
          </div>
        )}

        {activeTab === "Reading Lists" && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.readingLists?.length > 0 ? (
              profile.readingLists.map((list) => (
                <Link key={list._id} to={`/reading-lists/${list._id}`} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-orange-200">
                  <p className="text-lg font-black text-gray-950">{list.name}</p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{list.description || "A public Madal reading list."}</p>
                  <p className="mt-4 text-sm font-bold text-orange-700">{formatCount(list.storiesCount || 0)} stories</p>
                </Link>
              ))
            ) : (
              <Empty text="No public reading lists yet." />
            )}
          </div>
        )}

        {activeTab === "About" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-gray-950">About {profile.displayName}</h2>
              <p className="mt-4 text-lg leading-8 text-gray-700">{profile.bio || "This writer has not added a bio yet."}</p>
              <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500">
                <CalendarDays size={16} />
                Joined {new Date(profile.joinedAt).toLocaleDateString()}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <MiniFact icon={Library} label="Stories" value={formatCount(profile.totalStories || 0)} />
                <MiniFact icon={Heart} label="Likes" value={formatCount(profile.totalLikes || 0)} />
                <MiniFact icon={Users} label="Followers" value={formatCount(profile.followersCount || 0)} />
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black text-gray-950">Author Badges</h3>
              <div className="mt-4 space-y-3">
                {(profile.achievements || ["New Writer"]).map((badge) => (
                  <div key={badge} className="flex items-center gap-3 rounded-lg bg-orange-50 p-3 font-bold text-orange-800">
                    <Award size={18} />
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export function Avatar({ profile, size = "small" }) {
  const classes = size === "large" ? "h-24 w-24 border-4 border-white text-3xl shadow-lg sm:h-28 sm:w-28 sm:text-4xl" : "h-9 w-9 text-sm";
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-orange-100 font-black text-orange-700 ${classes}`}>
      {profile?.avatarUrl ? (
        <img src={profile.avatarUrl} alt={profile.displayName || profile.username || "Madal user"} className="h-full w-full object-cover" />
      ) : profile?.displayName || profile?.username ? (
        <span>{String(profile.displayName || profile.username).charAt(0).toUpperCase()}</span>
      ) : (
        <img src={madalLogo} alt="Madal" className="h-full w-full object-cover" />
      )}
    </div>
  );
}

function SocialStat({ label, value, to }) {
  const content = (
    <>
      <span className="text-lg">{formatCount(value || 0)}</span>
      <span className="ml-1 text-gray-500">{label}</span>
    </>
  );
  return to ? <Link to={to} className="hover:text-orange-700">{content}</Link> : <span>{content}</span>;
}

function MiniFact({ icon: Icon, label, value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 font-bold text-gray-700">
      <Icon size={16} className="text-orange-600" />
      {value} {label}
    </div>
  );
}

function Empty({ text }) {
  return <div className="rounded-lg border border-gray-200 bg-white p-8 text-gray-500">{text}</div>;
}

export default UserProfile;
