import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("Set ADMIN_PASSWORD in your .env before seeding");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });
  console.log(`Admin user "${username}" is ready.`);

  const sampleProjects = [
    {
      title: "Studio",
      description: "Creative studio work and brand exploration.",
      imageUrl: "/images/studio.png",
      order: 1,
    },
    {
      title: "App Development",
      description: "Mobile and web applications built end to end.",
      imageUrl: "/images/apps-development.png",
      order: 2,
    },
    {
      title: "Photography",
      description: "A selection of photography projects.",
      imageUrl: "/images/photography.png",
      order: 3,
    },
    {
      title: "Ideas",
      description: "Concepts and prototypes in progress.",
      imageUrl: "/images/idea.png",
      order: 4,
    },
  ];

  for (const project of sampleProjects) {
    const existing = await prisma.project.findFirst({ where: { title: project.title } });
    if (!existing) {
      await prisma.project.create({ data: project });
    }
  }
  console.log("Sample projects ready.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
