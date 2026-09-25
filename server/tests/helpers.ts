import bcrypt from "bcryptjs";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

export const app = createApp();

export async function resetDb() {
  await prisma.contactMessage.deleteMany();
  await prisma.project.deleteMany();
  await prisma.adminUser.deleteMany();
}

export async function createAdmin(username = "admin", password = "test-password-123") {
  const passwordHash = await bcrypt.hash(password, 4);
  await prisma.adminUser.create({ data: { username, passwordHash } });
  return { username, password };
}

/**
 * Returns a supertest agent that is logged in as a freshly-created admin.
 * The agent keeps the session cookie from /login for subsequent requests,
 * mirroring how the browser carries the httpOnly cookie automatically.
 */
export async function loginAgent() {
  const { username, password } = await createAdmin();
  const agent = request.agent(app);
  await agent.post("/api/auth/login").send({ username, password });
  return agent;
}
