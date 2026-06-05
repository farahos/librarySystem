import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
import { normalizeRoles } from "../utils/roles.js";

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  displayName: user.displayName,
  bio: user.bio,
  roles: normalizeRoles(user.roles || []),
  avatarUrl: user.avatarUrl,
  coverUrl: user.coverUrl,
  verification: user.verification,
});

const signToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      roles: normalizeRoles(user.roles || []),
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

export async function signup(req, res) {
  try {
    const { username, email, password, displayName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const roles = ["user"];
    const user = await User.create({ username, email, passwordHash, displayName, roles });

    res.status(201).json({ user: publicUser(user), token: signToken(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash || "");
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    if (user.status === "banned") return res.status(403).json({ message: "Account is banned" });

    user.lastLoginAt = new Date();
    await user.save();

    res.json({ user: publicUser(user), token: signToken(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    const ok = await bcrypt.compare(currentPassword, user.passwordHash || "");
    if (!ok) return res.status(401).json({ message: "Current password is incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
