import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiClient, hasRole } from "../lib/apiClient";

const UserContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) return null;
  const roles = user.roles || (user.role ? [user.role] : []);
  return {
    ...user,
    roles,
    role: roles.includes("admin") ? "admin" : roles.includes("writer") ? "writer" : "reader",
  };
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => normalizeUser(JSON.parse(localStorage.getItem("user") || "null")));
  const [loadingUser, setLoadingUser] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("expirationTime");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    setUser(null);
  };

  const login = (payload, expiresInSeconds = 7 * 24 * 60 * 60) => {
    const nextUser = normalizeUser(payload.user || payload);
    if (payload.token) localStorage.setItem("token", payload.token);
    localStorage.setItem("user", JSON.stringify(nextUser));
    localStorage.setItem("userId", nextUser.id || nextUser._id || "");
    localStorage.setItem("userRole", nextUser.role || "reader");
    localStorage.setItem("expirationTime", String(Date.now() + expiresInSeconds * 1000));
    setUser(nextUser);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expirationTime = Number(localStorage.getItem("expirationTime") || 0);

    if (!token) return;
    if (expirationTime && Date.now() > expirationTime) {
      logout();
      return;
    }

    setLoadingUser(true);
    apiClient
      .get("/auth/me")
      .then(({ data }) => login({ user: data.user, token }, 7 * 24 * 60 * 60))
      .catch(() => logout())
      .finally(() => setLoadingUser(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      login,
      logout,
      loadingUser,
      isAdmin: hasRole(user, "admin"),
      isWriter: hasRole(user, "writer") || hasRole(user, "verified_writer"),
    }),
    [user, loadingUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
export default UserContext;
