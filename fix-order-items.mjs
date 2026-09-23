import { prisma } from "./lib/prisma.ts";

async function main() {
  console.log("Connecting to database...");

  const before = await prisma.orderItem.count({
    where: {
      productId: {
        not: null,
      },
    },
  });

  console.log(
    `OrderItems with productId before: ${before}`
  );

  const result = await prisma.orderItem.updateMany({
    where: {
      productId: {
        not: null,
      },
    },
    data: {
      productId: null,
    },
  });

  console.log(`Updated: ${result.count}`);

  const after = await prisma.orderItem.count({
    where: {
      productId: {
        not: null,
      },
    },
  });

  console.log(
    `OrderItems with productId after: ${after}`
  );
}

main()
  .catch((error) => {
    console.error("DATABASE ERROR:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });