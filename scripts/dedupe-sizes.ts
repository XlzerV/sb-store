import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, name: true } });
  let totalDeleted = 0;
  for (const p of products) {
    const sizes = await prisma.productSize.findMany({ where: { productId: p.id }, orderBy: { id: "asc" } });
    const keep = new Map<string, string>();
    for (const s of sizes) {
      if (!keep.has(s.size)) keep.set(s.size, s.id);
    }
    const deleteIds = sizes.filter((s) => s.id !== keep.get(s.size)).map((s) => s.id);
    if (deleteIds.length) {
      const r = await prisma.productSize.deleteMany({ where: { id: { in: deleteIds } } });
      totalDeleted += r.count;
      console.log(`${p.name}: removed ${r.count} duplicate size row(s)`);
    }
  }
  console.log(`Done. Total duplicate rows removed: ${totalDeleted}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
