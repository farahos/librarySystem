import { env } from "./env.js";

const defaultOrigins = [
  "https://librarysystem-r0al.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:62708",
  "http://127.0.0.1:62708",
];

export const allowedOrigins = [...new Set([...defaultOrigins, ...env.clientOrigins])];

export const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
