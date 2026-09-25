import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, loginAgent, resetDb } from "./helpers.js";

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
    const agent = await loginAgent();
    const res = await agent.post("/api/projects").send({ title: "" });
    expect(res.status).toBe(400);
  });

  it("allows an authenticated admin to create, update and delete a project", async () => {
    const agent = await loginAgent();

    const create = await agent
      .post("/api/projects")
      .send({ title: "Test Project", description: "Desc", imageUrl: "/images/test.png", order: 1 });
    expect(create.status).toBe(201);
    const id = create.body.id as string;

    const listed = await request(app).get("/api/projects");
    expect(listed.body).toHaveLength(1);
    expect(listed.body[0].title).toBe("Test Project");

    const update = await agent.put(`/api/projects/${id}`).send({ title: "Updated Title" });
    expect(update.status).toBe(200);
    expect(update.body.title).toBe("Updated Title");

    const del = await agent.delete(`/api/projects/${id}`);
    expect(del.status).toBe(204);

    const listedAfter = await request(app).get("/api/projects");
    expect(listedAfter.body).toHaveLength(0);
  });

  it("rejects an invalid or forged session cookie", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Cookie", "token=not-a-real-token")
      .send({ title: "Test", description: "Desc", imageUrl: "/images/test.png" });
    expect(res.status).toBe(401);
  });
});
