export const roles = ["user", "verified_author", "moderator", "admin", "owner"];

export function normalizeRoles(input = []) {
  const mapped = input.map((role) => {
    if (role === "reader" || role === "writer") return "user";
    if (role === "verified_writer") return "verified_author";
    return role;
  });
  const nextRoles = [...new Set(mapped.filter((role) => roles.includes(role)))];
  return nextRoles.length > 0 ? nextRoles : ["user"];
}

export function hasAnyRole(user, allowed = []) {
  const userRoles = normalizeRoles(user?.roles || []);
  return allowed.some((role) => userRoles.includes(role));
}

export function highestRole(user) {
  const userRoles = normalizeRoles(user?.roles || []);
  return ["owner", "admin", "moderator", "verified_author", "user"].find((role) => userRoles.includes(role)) || "user";
}
