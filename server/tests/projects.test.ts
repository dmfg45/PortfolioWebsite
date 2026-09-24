import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, createAdmin, resetDb } from "./helpers.js";

async function loginToken() {
  const { username, password } = await createAdmin();
  const res = await request(app).post("/api/auth/login").send({ username, password });
  return res.body.token as string;
}

describe("Projects API", () => {
  beforeEach(resetDb);

  it("lists projects publicly without auth", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("rejects creating a project without auth", async () => {
    const res = await request(app).post("/api/projects").send({
      title: "Test",
      description: "Desc",
      imageUrl: "/images/test.png",
    });
    expect(res.status).toBe(401);
  });

  it("rejects creating a project with an invalid body", async () => {
    const token = await loginToken();
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "" });
    expect(res.status).toBe(400);
  });

  it("allows an authenticated admin to create, update and delete a project", async () => {
    const token = await loginToken();

    const create = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test Project", description: "Desc", imageUrl: "/images/test.png", order: 1 });
    expect(create.status).toBe(201);
    const id = create.body.id as string;

    const listed = await request(app).get("/api/projects");
    expect(listed.body).toHaveLength(1);
    expect(listed.body[0].title).toBe("Test Project");

    const update = await request(app)
      .put(`/api/projects/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" });
    expect(update.status).toBe(200);
    expect(update.body.title).toBe("Updated Title");

    const del = await request(app).delete(`/api/projects/${id}`).set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(204);

    const listedAfter = await request(app).get("/api/projects");
    expect(listedAfter.body).toHaveLength(0);
  });

  it("rejects an invalid or expired token", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", "Bearer not-a-real-token")
      .send({ title: "Test", description: "Desc", imageUrl: "/images/test.png" });
    expect(res.status).toBe(401);
  });
});
