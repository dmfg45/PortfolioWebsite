import "express-async-errors";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./lib/config.js";
import { authRouter } from "./routes/auth.js";
import { projectsRouter } from "./routes/projects.js";
import { contactRouter } from "./routes/contact.js";
import { contentRouter } from "./routes/content.js";
import { uploadsRouter, UPLOADS_DIR } from "./routes/uploads.js";
import { errorHandler } from "./middleware/errorHandler.js";

const trustProxySetting = /^\d+$/.test(config.TRUST_PROXY) ? Number(config.TRUST_PROXY) : config.TRUST_PROXY;

export function createApp() {
  const app = express();

  app.set("trust proxy", trustProxySetting);

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(compression());
  if (config.NODE_ENV !== "test") {
    app.use(morgan(config.NODE_ENV === "production" ? "combined" : "dev"));
  }
  app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use("/uploads", express.static(UPLOADS_DIR));

  const skipInTests = () => config.NODE_ENV === "test";
  const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, skip: skipInTests });
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, skip: skipInTests });

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api", apiLimiter);
  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/content", contentRouter);
  app.use("/api/uploads", uploadsRouter);

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));
  app.use(errorHandler);

  return app;
}
