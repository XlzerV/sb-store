import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const [wilayas, communes, categories, products] = await Promise.all([
    prisma.wilaya.findMany({ orderBy: { id: "asc" } }),
    prisma.commune.findMany({ orderBy: { id: "asc" } }),
    prisma.category.findMany({ orderBy: { id: "asc" } }),
    prisma.product.findMany({
      include: { images: true, sizes: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    wilayas,
    communes,
    categories,
    products,
  };

  const outPath = path.join(process.cwd(), "prisma", "seed-data.json");
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`Exported to ${outPath}`);
  console.log(`  wilayas: ${wilayas.length}, communes: ${communes.length}, categories: ${categories.length}, products: ${products.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
