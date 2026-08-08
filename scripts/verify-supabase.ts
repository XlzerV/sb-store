import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("products:", await prisma.product.count());
  console.log("categories:", await prisma.category.count());
  console.log("wilayas:", await prisma.wilaya.count());
  console.log("communes:", await prisma.commune.count());
  console.log("users:", await prisma.user.count());

  const cats = await prisma.category.findMany({ select: { slug: true, image: true } });
  for (const c of cats) console.log("cat:", c.slug, "->", c.image);

  const inStock = await prisma.product.findMany({
    where: { inStock: true },
    select: { name: true, slug: true },
  });
  console.log("inStock products:", inStock.map((p) => p.slug).join(", "));

  const img = await prisma.productImage.findFirst({ select: { url: true } });
  if (img) {
    const res = await fetch(img.url);
    console.log("sample image GET:", res.status, res.headers.get("content-type"), img.url.slice(0, 90));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
