import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { config } from "../lib/config.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const contactRouter = Router();

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
});

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skip: () => config.NODE_ENV === "test",
});

// Public: submit a contact message
contactRouter.post("/", submitLimiter, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const created = await prisma.contactMessage.create({ data: parsed.data });
  res.status(201).json({ id: created.id });
});

// Admin: list messages
contactRouter.get("/", requireAuth, async (_req: AuthedRequest, res) => {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  res.json(messages);
});

// Admin: mark message as read
contactRouter.patch("/:id/read", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json(message);
  } catch {
    res.status(404).json({ error: "Message not found" });
  }
});

// Admin: delete message
contactRouter.delete("/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Message not found" });
  }
});
