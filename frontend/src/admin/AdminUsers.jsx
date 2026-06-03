import React, { useEffect, useState } from "react";
import { apiClient } from "../lib/apiClient";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const load = () => apiClient.get("/admin/users").then(({ data }) => setUsers(data.users || []));

  useEffect(() => {
    load();
  }, []);

  const suspend = async (id, status) => {
    await apiClient.patch(`/admin/users/${id}/suspend`, { status });
    load();
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black text-gray-950">Users</h1>
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {users.map((user) => (
            <div key={user._id} className="grid gap-3 border-b border-gray-100 p-4 md:grid-cols-[1fr_1fr_160px]">
              <div>
                <p className="font-black">{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <p className="text-sm font-bold text-gray-600">{user.roles?.join(", ")}</p>
              <button
                onClick={() => suspend(user._id, user.status === "active" ? "suspended" : "active")}
                className="rounded-lg bg-gray-950 px-3 py-2 text-sm font-bold text-white"
              >
                {user.status === "active" ? "Suspend" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
