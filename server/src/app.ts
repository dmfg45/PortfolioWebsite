import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authRouter } from "./routes/auth.js";
import { projectsRouter } from "./routes/projects.js";
import { contactRouter } from "./routes/contact.js";
import { uploadsRouter, UPLOADS_DIR } from "./routes/uploads.js";

const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: CORS_ORIGIN }));
  app.use(express.json({ limit: "100kb" }));
  app.use("/uploads", express.static(UPLOADS_DIR));

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/uploads", uploadsRouter);

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  return app;
}
