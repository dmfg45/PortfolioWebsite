import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { authRouter } from "./routes/auth.js";
import { projectsRouter } from "./routes/projects.js";
import { contactRouter } from "./routes/contact.js";
import { uploadsRouter, UPLOADS_DIR } from "./routes/uploads.js";
import { errorHandler } from "./middleware/errorHandler.js";

const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

// Number of reverse-proxy hops in front of the app (e.g. the nginx container
// in docker-compose) so express-rate-limit and req.ip see the real client IP
// instead of the proxy's.
const TRUST_PROXY = process.env.TRUST_PROXY ?? "1";
const trustProxySetting = /^\d+$/.test(TRUST_PROXY) ? Number(TRUST_PROXY) : TRUST_PROXY;

export function createApp() {
  const app = express();

  app.set("trust proxy", trustProxySetting);

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(compression());
  if (process.env.NODE_ENV !== "test") {
    app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  }
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
  app.use(errorHandler);

  return app;
}
