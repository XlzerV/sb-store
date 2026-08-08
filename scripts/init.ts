import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const categoryCount = await prisma.category.count();

  if (categoryCount > 0) {
    console.log("Database already seeded — skipping.");
    return;
  }

  console.log("Initializing database...");

  const dataPath = path.join(process.cwd(), "prisma", "seed-data.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  if (data.wilayas?.length) {
    for (const w of data.wilayas) {
      await prisma.wilaya.upsert({
        where: { id: w.id },
        update: {},
        create: {
          id: w.id,
          name: w.name,
          nameAr: w.nameAr,
          nameFr: w.nameFr,
          shippingCost: w.shippingCost,
        },
      });
    }
    console.log(`Seeded ${data.wilayas.length} wilayas`);
  }

  if (data.communes?.length) {
    for (let i = 0; i < data.communes.length; i += 500) {
      const batch = data.communes.slice(i, i + 500);
      await prisma.commune.createMany({
        data: batch.map((c) => ({
          id: c.id,
          name: c.name,
          nameAr: c.nameAr,
          nameFr: c.nameFr,
          wilayaId: c.wilayaId,
        })),
      });
    }
    console.log(`Seeded ${data.communes.length} communes`);
  }

  if (data.categories?.length) {
    for (const c of data.categories) {
      await prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: {
          id: c.id,
          name: c.name,
          nameAr: c.nameAr,
          nameFr: c.nameFr,
          slug: c.slug,
          image: c.image,
        },
      });
    }
    console.log(`Seeded ${data.categories.length} categories`);
  }

  if (data.products?.length) {
    for (const p of data.products) {
      await prisma.product.create({
        data: {
          id: p.id,
          name: p.name,
          nameAr: p.nameAr,
          nameFr: p.nameFr,
          slug: p.slug,
          description: p.description,
          descriptionAr: p.descriptionAr,
          descriptionFr: p.descriptionFr,
          price: p.price,
          salePrice: p.salePrice,
          categoryId: p.categoryId,
          featured: p.featured,
          inStock: p.inStock,
          images: {
            create: p.images.map((img) => ({
              url: img.url,
              alt: img.alt,
              order: img.order,
            })),
          },
          sizes: {
            create: p.sizes.map((s) => ({
              size: s.size,
              stock: s.stock,
            })),
          },
        },
      });
    }
    console.log(`Seeded ${data.products.length} products`);
  }

  const adminEmail = "Samstar@admin.dz";
  const adminPassword = "SB@1946.JSK";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const password = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: { email: adminEmail, password, name: "Admin", role: "ADMIN" },
    });
    console.log(`Admin created: ${adminEmail}`);
  }

  console.log("Initialization completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
