import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { useUser } from "../hooks/useUser";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login, user, isAdmin } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/Home";

  useEffect(() => {
    if (user) navigate(isAdmin ? "/admin-dashboard" : redirectTo);
  }, [user, isAdmin, navigate, redirectTo]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/login", form);
      login(data);
      toast.success("Welcome back to Madal");
      navigate(data.user.roles?.includes("admin") ? "/admin-dashboard" : redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-orange-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-orange-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Madal</p>
        <h1 className="mt-2 text-3xl font-black text-gray-950">Login</h1>
        <p className="mt-2 text-gray-600">Read. Listen. Write Stories.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm font-bold text-gray-700">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              required
            />
          </label>
          <label className="block text-sm font-bold text-gray-700">
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              required
            />
          </label>
          <button
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 px-4 py-3 font-black text-white hover:bg-orange-700 disabled:bg-orange-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          New to Madal?{" "}
          <Link to="/Register" state={{ from: redirectTo }} className="font-bold text-orange-700">
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
