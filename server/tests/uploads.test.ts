import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, loginAgent, resetDb } from "./helpers.js";
import { UPLOADS_DIR } from "../src/routes/uploads.js";

// A minimal valid 1x1 transparent PNG.
const PNG_BUFFER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

describe("Uploads API", () => {
  beforeEach(resetDb);
  afterAll(() => {
    fs.rmSync(UPLOADS_DIR, { recursive: true, force: true });
  });

  it("rejects uploads without auth", async () => {
    const res = await request(app).post("/api/uploads").attach("file", PNG_BUFFER, "test.png");
    expect(res.status).toBe(401);
  });

  it("rejects non-image files", async () => {
    const agent = await loginAgent();
    const res = await agent.post("/api/uploads").attach("file", Buffer.from("not an image"), "test.txt");
    expect(res.status).toBe(400);
  });

  it("accepts an image upload and serves it back", async () => {
    const agent = await loginAgent();
    const upload = await agent.post("/api/uploads").attach("file", PNG_BUFFER, "test.png");
    expect(upload.status).toBe(201);
    expect(upload.body.url).toMatch(/^\/uploads\/.+\.png$/);

    const served = await request(app).get(upload.body.url);
    expect(served.status).toBe(200);
  });

  it("downscales a large image to the max width", async () => {
    const largeImage = await sharp({
      create: { width: 2400, height: 1200, channels: 3, background: { r: 100, g: 150, b: 200 } },
    })
      .jpeg()
      .toBuffer();

    const agent = await loginAgent();
    const upload = await agent.post("/api/uploads").attach("file", largeImage, "large.jpg");
    expect(upload.status).toBe(201);

    const savedPath = path.join(UPLOADS_DIR, path.basename(upload.body.url));
    const metadata = await sharp(savedPath).metadata();
    expect(metadata.width).toBe(1600);
    expect(metadata.height).toBe(800);
  });

  it("does not upscale an image smaller than the max width", async () => {
    const smallImage = await sharp({
      create: { width: 200, height: 100, channels: 3, background: { r: 10, g: 20, b: 30 } },
    })
      .png()
      .toBuffer();

    const agent = await loginAgent();
    const upload = await agent.post("/api/uploads").attach("file", smallImage, "small.png");
    expect(upload.status).toBe(201);

    const savedPath = path.join(UPLOADS_DIR, path.basename(upload.body.url));
    const metadata = await sharp(savedPath).metadata();
    expect(metadata.width).toBe(200);
    expect(metadata.height).toBe(100);
  });
});
