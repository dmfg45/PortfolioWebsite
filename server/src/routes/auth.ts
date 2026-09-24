import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { JWT_SECRET } from "../lib/env.js";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS, sessionCookieOptions } from "../lib/session.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const { username, password } = parsed.data;
  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: SESSION_MAX_AGE_MS / 1000 });
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions);
  res.json({ success: true });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { ...sessionCookieOptions, maxAge: undefined });
  res.json({ success: true });
});

authRouter.get("/me", requireAuth, (_req: AuthedRequest, res) => {
  res.json({ authenticated: true });
});
