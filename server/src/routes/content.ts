import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { DEFAULT_SITE_CONTENT, SITE_CONTENT_KEYS, type SiteContentKey } from "../lib/siteContent.js";

export const contentRouter = Router();

const updateSchema = z
  .object(
    Object.fromEntries(SITE_CONTENT_KEYS.map((key) => [key, z.string().max(2000).optional()])) as Record<
      SiteContentKey,
      z.ZodOptional<z.ZodString>
    >,
  )
  .strict();

// Public: read the current site copy, falling back to defaults for any
// value that hasn't been customized yet.
contentRouter.get("/", async (_req, res) => {
  const rows = await prisma.siteContent.findMany();
  const content: Record<string, string> = { ...DEFAULT_SITE_CONTENT };
  for (const row of rows) {
    if (SITE_CONTENT_KEYS.includes(row.key as SiteContentKey)) {
      content[row.key] = row.value;
    }
  }
  res.json(content);
});

// Admin: update one or more content fields.
contentRouter.put("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const entries = Object.entries(parsed.data).filter(([, value]) => value !== undefined) as [string, string][];

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.siteContent.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );

  const rows = await prisma.siteContent.findMany();
  const content: Record<string, string> = { ...DEFAULT_SITE_CONTENT };
  for (const row of rows) {
    if (SITE_CONTENT_KEYS.includes(row.key as SiteContentKey)) {
      content[row.key] = row.value;
    }
  }
  res.json(content);
});
