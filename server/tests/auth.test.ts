import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, createAdmin, resetDb } from "./helpers.js";

describe("POST /api/auth/login", () => {
  beforeEach(resetDb);

  it("returns a token for valid credentials", async () => {
    const { username, password } = await createAdmin();

    const res = await request(app).post("/api/auth/login").send({ username, password });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
  });

  it("rejects an unknown username", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "nobody", password: "whatever" });
    expect(res.status).toBe(401);
  });

  it("rejects an incorrect password", async () => {
    const { username } = await createAdmin();
    const res = await request(app).post("/api/auth/login").send({ username, password: "wrong-password" });
    expect(res.status).toBe(401);
  });

  it("rejects a missing password", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "admin" });
    expect(res.status).toBe(400);
  });
});
