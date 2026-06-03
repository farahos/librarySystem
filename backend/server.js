import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { corsOptions } from "./src/config/cors.js";
import { connectDb } from "./src/config/db.js";
import { env } from "./src/config/env.js";
import routes from "./src/routes/index.js";

const app = express();

app.use(cors(corsOptions));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "madal-backend",
    slogan: "Read. Listen. Write Stories.",
  });
});

app.use("/api/v1", routes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

connectDb()
  .then(() => {
    app.listen(env.port, () => console.log(`Madal backend running on port ${env.port}`));
  })
  .catch((err) => {
    console.error("Mongo connect error", err);
    process.exit(1);
  });

export default app;
