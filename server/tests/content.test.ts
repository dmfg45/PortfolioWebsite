import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, loginAgent, resetDb } from "./helpers.js";
import { DEFAULT_SITE_CONTENT } from "../src/lib/siteContent.js";

describe("Content API", () => {
  beforeEach(resetDb);

  it("returns default content publicly when nothing is customized", async () => {
    const res = await request(app).get("/api/content");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(DEFAULT_SITE_CONTENT);
  });

  it("rejects updates without auth", async () => {
    const res = await request(app).put("/api/content").send({ heroHeading: "Hacked" });
    expect(res.status).toBe(401);
  });

  it("rejects unknown fields", async () => {
    const agent = await loginAgent();
    const res = await agent.put("/api/content").send({ notARealField: "x" });
    expect(res.status).toBe(400);
  });

  it("lets an admin update content and the public endpoint reflects it", async () => {
    const agent = await loginAgent();
    const update = await agent.put("/api/content").send({ heroHeading: "Hello World", aboutHeading: "Skills" });
    expect(update.status).toBe(200);
    expect(update.body.heroHeading).toBe("Hello World");
    expect(update.body.aboutHeading).toBe("Skills");
    // Untouched fields keep their default.
    expect(update.body.heroSubheading).toBe(DEFAULT_SITE_CONTENT.heroSubheading);

    const publicRead = await request(app).get("/api/content");
    expect(publicRead.body.heroHeading).toBe("Hello World");
  });
});
