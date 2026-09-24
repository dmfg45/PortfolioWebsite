import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, createAdmin, resetDb } from "./helpers.js";

async function loginToken() {
  const { username, password } = await createAdmin();
  const res = await request(app).post("/api/auth/login").send({ username, password });
  return res.body.token as string;
}

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
    const token = await loginToken();
    const submit = await request(app)
      .post("/api/contact")
      .send({ name: "Jane Doe", email: "jane@example.com", message: "Hello there" });
    const id = submit.body.id as string;

    const list = await request(app).get("/api/contact").set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].read).toBe(false);

    const markRead = await request(app)
      .patch(`/api/contact/${id}/read`)
      .set("Authorization", `Bearer ${token}`);
    expect(markRead.status).toBe(200);
    expect(markRead.body.read).toBe(true);

    const del = await request(app).delete(`/api/contact/${id}`).set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(204);

    const listAfter = await request(app).get("/api/contact").set("Authorization", `Bearer ${token}`);
    expect(listAfter.body).toHaveLength(0);
  });
});
