import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, createAdmin, loginAgent, resetDb } from "./helpers.js";

describe("POST /api/auth/login", () => {
  beforeEach(resetDb);

  it("sets an httpOnly session cookie for valid credentials", async () => {
    const { username, password } = await createAdmin();

    const res = await request(app).post("/api/auth/login").send({ username, password });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    const cookie = res.headers["set-cookie"]?.[0];
    expect(cookie).toContain("token=");
    expect(cookie).toContain("HttpOnly");
  });

  it("rejects an unknown username", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "nobody", password: "whatever" });
    expect(res.status).toBe(401);
    expect(res.headers["set-cookie"]).toBeUndefined();
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

describe("GET /api/auth/me", () => {
  beforeEach(resetDb);

  it("returns 401 when there is no session", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns authenticated:true for a logged-in session", async () => {
    const agent = await loginAgent();
    const res = await agent.get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ authenticated: true });
  });
});

describe("POST /api/auth/logout", () => {
  beforeEach(resetDb);

  it("clears the session so subsequent requests are unauthenticated", async () => {
    const agent = await loginAgent();
    expect((await agent.get("/api/auth/me")).status).toBe(200);

    const logout = await agent.post("/api/auth/logout");
    expect(logout.status).toBe(200);

    expect((await agent.get("/api/auth/me")).status).toBe(401);
  });
});
