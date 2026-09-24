import bcrypt from "bcryptjs";
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
