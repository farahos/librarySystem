import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { useUser } from "../hooks/useUser";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    asWriter: true,
  });
  const [loading, setLoading] = useState(false);
  const { login, user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/Home";

  useEffect(() => {
    if (user) navigate(redirectTo);
  }, [user, navigate, redirectTo]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/signup", {
        username: form.username,
        email: form.email,
        password: form.password,
        asWriter: form.asWriter,
      });
      login(data);
      toast.success("Welcome to Madal");
      navigate(redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-orange-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-orange-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Join Madal</p>
        <h1 className="mt-2 text-3xl font-black text-gray-950">Create Account</h1>
        <p className="mt-2 text-gray-600">The home of Somali storytelling.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {["username", "email", "password", "confirmPassword"].map((field) => (
            <label key={field} className="block text-sm font-bold capitalize text-gray-700">
              {field === "confirmPassword" ? "Confirm password" : field}
              <input
                type={field.includes("password") || field.includes("Password") ? "password" : field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                required
              />
            </label>
          ))}

          <label className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-3 text-sm font-bold text-gray-700">
            Register as writer
            <input
              type="checkbox"
              checked={form.asWriter}
              onChange={(event) => setForm((current) => ({ ...current, asWriter: event.target.checked }))}
              className="h-4 w-4 accent-orange-600"
            />
          </label>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 px-4 py-3 font-black text-white hover:bg-orange-700 disabled:bg-orange-300"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already registered?{" "}
          <Link to="/login" state={{ from: redirectTo }} className="font-bold text-orange-700">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
