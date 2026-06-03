import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";

export async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.sub).select("-passwordHash");

    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "User is not active" });
    }

    req.auth = decoded;
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.token;

  if (!token) return next();

  jwt.verify(token, env.jwtSecret, async (err, decoded) => {
    if (!err && decoded?.sub) {
      req.auth = decoded;
      req.user = await User.findById(decoded.sub).select("-passwordHash");
    }
    next();
  });
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    if (!allowedRoles.some((role) => roles.includes(role))) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}
