import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const projectsRouter = Router();

const projectInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().min(1),
  link: z.string().url().optional().or(z.literal("")),
  order: z.number().int().optional(),
});

// Public: list projects for the portfolio gallery
projectsRouter.get("/", async (_req, res) => {
  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });
  res.json(projects);
});

// Admin: create a project
projectsRouter.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = projectInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const project = await prisma.project.create({
    data: { ...parsed.data, link: parsed.data.link || null },
  });
  res.status(201).json(project);
});

// Admin: update a project
projectsRouter.put("/:id", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = projectInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { ...parsed.data, link: parsed.data.link || null },
    });
    res.json(project);
  } catch {
    res.status(404).json({ error: "Project not found" });
  }
});

// Admin: delete a project
projectsRouter.delete("/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Project not found" });
  }
});
