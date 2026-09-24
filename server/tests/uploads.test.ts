import fs from "node:fs";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, createAdmin, resetDb } from "./helpers.js";
import { UPLOADS_DIR } from "../src/routes/uploads.js";

// A minimal valid 1x1 transparent PNG.
const PNG_BUFFER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

async function loginToken() {
  const { username, password } = await createAdmin();
  const res = await request(app).post("/api/auth/login").send({ username, password });
  return res.body.token as string;
}

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
    const token = await loginToken();
    const res = await request(app)
      .post("/api/uploads")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("not an image"), "test.txt");
    expect(res.status).toBe(400);
  });

  it("accepts an image upload and serves it back", async () => {
    const token = await loginToken();
    const upload = await request(app)
      .post("/api/uploads")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", PNG_BUFFER, "test.png");
    expect(upload.status).toBe(201);
    expect(upload.body.url).toMatch(/^\/uploads\/.+\.png$/);

    const served = await request(app).get(upload.body.url);
    expect(served.status).toBe(200);
  });
});
