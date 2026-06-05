import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiClient, hasRole } from "../lib/apiClient";

const UserContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) return null;
  const roles = [...new Set((user.roles || (user.role ? [user.role] : [])).map((role) => {
    if (role === "reader" || role === "writer") return "user";
    if (role === "verified_writer") return "verified_author";
    return role;
  }))];
  return {
    ...user,
    roles,
    role: roles.includes("owner")
      ? "owner"
      : roles.includes("admin")
        ? "admin"
      : roles.includes("moderator")
        ? "moderator"
        : "user",
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
    localStorage.setItem("userRole", nextUser.role || "user");
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
      isOwner: hasRole(user, "owner"),
      isAdmin: hasRole(user, "admin") || hasRole(user, "owner"),
      isModerator: hasRole(user, "moderator") || hasRole(user, "admin") || hasRole(user, "owner"),
      isWriter: hasRole(user, "user") || hasRole(user, "verified_author"),
    }),
    [user, loadingUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
export default UserContext;
