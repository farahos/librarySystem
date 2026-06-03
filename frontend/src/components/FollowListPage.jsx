import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { Avatar } from "./UserProfile";

const FollowListPage = ({ type }) => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/users/profile/${username}`)
      .then(async ({ data }) => {
        setProfile(data.profile);
        const endpoint = type === "followers" ? `/users/${data.profile.id}/followers` : `/users/${data.profile.id}/following`;
        const response = await apiClient.get(endpoint);
        const rows = type === "followers" ? response.data.followers || [] : response.data.following || [];
        setItems(rows);
      })
      .catch(() => {
        setProfile(null);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [username, type]);

  if (loading) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Loading...</main>;
  if (!profile) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Profile not found.</main>;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-3xl">
        <Link to={`/user/${profile.username}`} className="text-sm font-bold text-orange-700">Back to profile</Link>
        <h1 className="mt-3 text-3xl font-black capitalize text-gray-950">{type}</h1>
        <p className="mt-2 text-gray-600">@{profile.username}</p>

        <div className="mt-6 space-y-3">
          {items.map((item) => {
            const person = type === "followers" ? item.followerId : item.followeeId;
            if (!person) return null;
            return (
              <Link
                key={item._id}
                to={`/user/${person.username}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md"
              >
                <Avatar profile={person} />
                <div>
                  <p className="font-black text-gray-950">{person.displayName || person.username}</p>
                  <p className="text-sm font-semibold text-gray-500">@{person.username}</p>
                </div>
              </Link>
            );
          })}
          {items.length === 0 && <div className="rounded-lg border border-gray-200 bg-white p-8 text-gray-500">No {type} yet.</div>}
        </div>
      </section>
    </main>
  );
};

export default FollowListPage;
