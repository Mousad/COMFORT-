import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const categories = [
  {
    name: "برفيوم حريمي",
    slug: "women-perfume",
    description: "عطور نسائية مميزة",
    image: "",
    isActive: true,
  },
  {
    name: "برفيوم رجالي",
    slug: "men-perfume",
    description: "عطور رجالية فاخرة",
    image: "",
    isActive: true,
  },
  {
    name: "برفيوم 50 ml",
    slug: "perfume-50ml",
    description: "عطور بحجم 50 مل",
    image: "",
    isActive: true,
  },
  {
    name: "Skin Care",
    slug: "skin-care",
    description: "منتجات العناية بالبشرة",
    image: "",
    isActive: true,
  },
  {
    name: "ماستر بوكس حريمي",
    slug: "women-master-box",
    description: "مجموعات عطور نسائية",
    image: "",
    isActive: true,
  },
  {
    name: "ماستر بوكس رجالي",
    slug: "men-master-box",
    description: "مجموعات عطور رجالية",
    image: "",
    isActive: true,
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        description: category.description,
        image: category.image || null,
        isActive: category.isActive,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image || null,
        isActive: category.isActive,
      },
    });
  }

  console.log("✅ Categories seeded successfully");
}

main()
  .catch((error) => {
    console.error("❌ Seed categories error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });