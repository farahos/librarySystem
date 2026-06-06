import React, { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, UserCog } from "lucide-react";
import { apiClient } from "../lib/apiClient";

export default function OwnerControls() {
  const [staff, setStaff] = useState({ owner: null, admins: [], moderators: [] });
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: staffData }, { data: userData }] = await Promise.all([
        apiClient.get("/admin/owner-controls"),
        apiClient.get("/admin/users", { params: query.trim() ? { search: query.trim(), limit: 25 } : { limit: 25 } }),
      ]);
      setStaff(staffData);
      setUsers(userData.users || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const setRole = async (user, role, enabled) => {
    await apiClient.patch(`/admin/users/${user._id}/role`, { role, enabled });
    load();
  };

  const transferOwnership = async (user) => {
    if (!window.confirm(`Transfer ownership to ${user.username}?`)) return;
    await apiClient.patch(`/admin/users/${user._id}/transfer-ownership`, {
      reason: "Manual ownership transfer from owner controls",
    });
    load();
  };

  const candidates = useMemo(
    () => users.filter((user) => !user.roles?.includes("owner")),
    [users]
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-wide text-orange-600">Owner</p>
        <h1 className="mt-2 text-4xl font-black text-gray-950">Owner Controls</h1>
        <p className="mt-2 text-sm font-semibold text-gray-500">Manage platform staff and ownership.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <StaffSection title="Admins" icon={ShieldCheck} users={staff.admins} role="admin" onRole={setRole} />
          <StaffSection title="Moderators" icon={UserCog} users={staff.moderators} role="moderator" onRole={setRole} />
        </div>

        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-gray-950">Promote Existing User</h2>
          <label className="relative mt-4 block">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users by name or email"
              className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-3 text-sm font-semibold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </label>

          <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
            {loading && <p className="p-4 text-sm font-bold text-gray-500">Loading users...</p>}
            {!loading &&
              candidates.map((user) => (
                <div key={user._id} className="grid gap-3 border-b border-gray-100 p-4 lg:grid-cols-[1fr_220px_360px]">
                  <UserSummary user={user} />
                  <RoleBadges roles={user.roles} />
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setRole(user, "moderator", true)} className="rounded-lg bg-gray-950 px-3 py-2 text-sm font-black text-white">
                      Promote to Moderator
                    </button>
                    <button onClick={() => setRole(user, "admin", true)} className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-black text-white">
                      Promote to Admin
                    </button>
                    <button onClick={() => transferOwnership(user)} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-black text-white">
                      Transfer Ownership
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function StaffSection({ icon: Icon, onRole, role, title, users }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
          <Icon size={20} />
        </span>
        <h2 className="text-xl font-black text-gray-950">{title}</h2>
      </div>
      <div className="mt-4 space-y-3">
        {users.length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm font-bold text-gray-500">No {title.toLowerCase()} yet.</p>}
        {users.map((user) => (
          <div key={user._id} className="rounded-lg border border-gray-100 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <UserSummary user={user} />
              <button
                onClick={() => onRole(user, role, false)}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-black text-gray-800 hover:bg-red-50 hover:text-red-700"
              >
                Remove Role
              </button>
            </div>
            <RoleBadges roles={user.roles} />
          </div>
        ))}
      </div>
    </section>
  );
}

function UserSummary({ user }) {
  return (
    <div>
      <p className="font-black text-gray-950">{user.displayName || user.username}</p>
      <p className="text-sm font-semibold text-gray-500">@{user.username}</p>
      <p className="text-sm text-gray-500">{user.email}</p>
      <p className="mt-1 text-xs font-bold text-gray-400">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  );
}

function RoleBadges({ roles = [] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {roles.map((role) => (
        <span key={role} className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-black text-gray-700">
          {role}
        </span>
      ))}
    </div>
  );
}
