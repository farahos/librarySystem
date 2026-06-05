import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const configDir = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(configDir, "../../../.env") });
dotenv.config({ path: resolve(configDir, "../../.env"), override: true });

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 8000,
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/madal_dev",
  jwtSecret: process.env.JWT_SECRET || "dev",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigins: (process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
