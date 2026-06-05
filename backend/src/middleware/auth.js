import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
import { hasAnyRole, normalizeRoles } from "../utils/roles.js";

export async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.sub).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ message: "User is not active" });
    }

    user.roles = normalizeRoles(user.roles);

    if (user.status === "suspended" && user.discipline?.suspension?.endDate && user.discipline.suspension.endDate <= new Date()) {
      user.status = "active";
      user.discipline.suspension = undefined;
      await user.save();
    }

    if (user.status === "banned") {
      return res.status(401).json({ message: "User is not active" });
    }

    req.auth = decoded;
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

export function requireActiveForPlatformAction(req, res, next) {
  if (req.user?.status === "suspended") {
    return res.status(403).json({ message: "Account is suspended for this action" });
  }
  if (req.user?.status === "banned") {
    return res.status(403).json({ message: "Account is banned" });
  }
  next();
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.token;

  if (!token) return next();

  jwt.verify(token, env.jwtSecret, async (err, decoded) => {
    if (!err && decoded?.sub) {
      const user = await User.findById(decoded.sub).select("-passwordHash");
      if (user) user.roles = normalizeRoles(user.roles);
      req.auth = decoded;
      req.user = user;
    }
    next();
  });
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!hasAnyRole(req.user, allowedRoles)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}
