import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes, scryptSync } from "node:crypto";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL غير موجود في .env");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("ADMIN_EMAIL و ADMIN_PASSWORD مطلوبان");
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");

await prisma.admin.upsert({
  where: {
    email: email.toLowerCase(),
  },
  update: {
    passwordHash: `${salt}:${hash}`,
    isActive: true,
  },
  create: {
    email: email.toLowerCase(),
    passwordHash: `${salt}:${hash}`,
    name: "Admin",
    isActive: true,
  },
});

console.log(`Admin created/updated: ${email.toLowerCase()}`);

await prisma.$disconnect();