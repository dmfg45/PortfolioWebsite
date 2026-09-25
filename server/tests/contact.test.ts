import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, loginAgent, resetDb } from "./helpers.js";

describe("Contact API", () => {
  beforeEach(resetDb);

  it("accepts a valid contact submission without auth", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Jane Doe", email: "jane@example.com", message: "Hello there" });
    expect(res.status).toBe(201);
    expect(typeof res.body.id).toBe("string");
  });

  it("rejects an invalid email", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Jane Doe", email: "not-an-email", message: "Hello there" });
    expect(res.status).toBe(400);
  });

  it("blocks listing messages without auth", async () => {
    const res = await request(app).get("/api/contact");
    expect(res.status).toBe(401);
  });

  it("lets an admin list, mark read, and delete messages", async () => {
    const agent = await loginAgent();
    const submit = await request(app)
      .post("/api/contact")
      .send({ name: "Jane Doe", email: "jane@example.com", message: "Hello there" });
    const id = submit.body.id as string;

    const list = await agent.get("/api/contact");
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].read).toBe(false);

    const markRead = await agent.patch(`/api/contact/${id}/read`);
    expect(markRead.status).toBe(200);
    expect(markRead.body.read).toBe(true);

    const del = await agent.delete(`/api/contact/${id}`);
    expect(del.status).toBe(204);

    const listAfter = await agent.get("/api/contact");
    expect(listAfter.body).toHaveLength(0);
  });
});
