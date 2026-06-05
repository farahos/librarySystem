import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { useUser } from "../hooks/useUser";

const roles = ["", "user", "verified_author", "moderator", "admin", "owner"];
const statuses = ["", "active", "warned", "suspended", "banned"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [openId, setOpenId] = useState("");
  const [loading, setLoading] = useState(true);
  const { isOwner } = useUser();

  const params = useMemo(
    () => ({
      ...(query.trim() ? { search: query.trim() } : {}),
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
    }),
    [query, role, status]
  );

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/admin/users", { params });
      setUsers(data.users || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [params]);

  const discipline = async (user, action, durationDays) => {
    await apiClient.patch(`/admin/users/${user._id}/discipline`, {
      action,
      durationDays,
      reason: action === "restore" ? "Account restored by admin" : "Platform safety action",
    });
    setOpenId("");
    load();
  };

  const setRoleEnabled = async (user, targetRole, enabled) => {
    await apiClient.patch(`/admin/users/${user._id}/role`, { role: targetRole, enabled });
    setOpenId("");
    load();
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black text-gray-950">Users</h1>

        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <label className="relative block">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search users by username, email, or display name"
                className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-3 text-sm font-semibold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-3 text-sm font-bold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              {statuses.map((item) => (
                <option key={item || "all-status"} value={item}>
                  {item ? item : "All statuses"}
                </option>
              ))}
            </select>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-3 text-sm font-bold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              {roles.map((item) => (
                <option key={item || "all-roles"} value={item}>
                  {item ? item : "All roles"}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mt-6 overflow-visible rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="grid border-b border-gray-100 px-4 py-3 text-xs font-black uppercase tracking-wide text-gray-500 lg:grid-cols-[1fr_1fr_120px_160px]">
            <span>User</span>
            <span>Roles</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loading && <p className="p-5 text-sm font-bold text-gray-500">Loading users...</p>}
          {!loading && users.length === 0 && <p className="p-5 text-sm font-bold text-gray-500">No users found.</p>}

          {!loading &&
            users.map((user) => {
              const isVerified = user.roles?.includes("verified_author") || user.verification?.status === "approved";
              const isModerator = user.roles?.includes("moderator");
              return (
                <div key={user._id} className="grid items-center gap-4 border-b border-gray-100 px-4 py-4 lg:grid-cols-[1fr_1fr_120px_160px]">
                  <div className="min-w-0">
                    <p className="truncate font-black text-gray-950">{user.displayName || user.username}</p>
                    <p className="truncate text-sm font-semibold text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(user.roles || ["user"]).map((item) => (
                      <span key={item} className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-black text-gray-700">
                        {item}
                      </span>
                    ))}
                  </div>
                  <span className="rounded-lg bg-gray-100 px-3 py-2 text-center text-sm font-black capitalize text-gray-700">
                    {user.status}
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setOpenId(openId === user._id ? "" : user._id)}
                      className="inline-flex w-full items-center justify-between rounded-lg bg-gray-950 px-4 py-2 text-sm font-black text-white"
                    >
                      Actions
                      <ChevronDown size={16} />
                    </button>
                    {openId === user._id && (
                      <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                        <ActionLink to={`/user/${user.username}`} label="View profile" />
                        <ActionLink to={`/Books?authorId=${user._id}`} label="View stories" />
                        <ActionButton label="Warn" onClick={() => discipline(user, "warn")} />
                        <ActionButton label="Suspend" onClick={() => discipline(user, "suspend", 7)} />
                        <ActionButton label="Ban" danger onClick={() => discipline(user, "ban")} />
                        <ActionButton label="Restore" onClick={() => discipline(user, "restore")} />
                        {isOwner && (
                          <ActionButton
                            label={isModerator ? "Remove Moderator" : "Promote Moderator"}
                            onClick={() => setRoleEnabled(user, "moderator", !isModerator)}
                          />
                        )}
                        <ActionButton
                          label={isVerified ? "Remove Verification" : "Verify Author"}
                          onClick={() => setRoleEnabled(user, "verified_author", !isVerified)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </section>
      </div>
    </main>
  );
}

function ActionButton({ danger = false, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full px-4 py-2 text-left text-sm font-bold hover:bg-gray-50 ${danger ? "text-red-700" : "text-gray-800"}`}
    >
      {label}
    </button>
  );
}

function ActionLink({ label, to }) {
  return (
    <Link to={to} className="block px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50">
      {label}
    </Link>
  );
}
