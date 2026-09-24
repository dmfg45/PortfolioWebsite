import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./helpers.js";

describe("Error handling", () => {
  it("returns JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });

  it("returns a JSON 400 for malformed request bodies", async () => {
    const res = await request(app)
      .post("/api/contact")
      .set("Content-Type", "application/json")
      .send("{not valid json");
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });
});
