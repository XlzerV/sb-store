import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { ensureStorageBucket, saveImage } from "../server/lib/storage";

const prisma = new PrismaClient();

interface DirMapping {
  localDir: string;
  urlPrefix: string;
}

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_KEY are required.");
    process.exit(1);
  }

  await ensureStorageBucket();
  console.log("Storage bucket ready.");

  const dirs: DirMapping[] = [
    {
      localDir: process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads"),
      urlPrefix: "/uploads/",
    },
    {
      localDir: path.join(process.cwd(), "public", "images", "products"),
      urlPrefix: "/images/products/",
    },
  ];

  const mapping = new Map<string, string>();
  let uploaded = 0;

  for (const { localDir, urlPrefix } of dirs) {
    if (!fs.existsSync(localDir)) continue;
    for (const file of fs.readdirSync(localDir)) {
      const localPath = path.join(localDir, file);
      if (!fs.statSync(localPath).isFile()) continue;
      const buffer = fs.readFileSync(localPath);
      const ext = path.extname(file).toLowerCase();
      const contentType =
        ext === ".svg" ? "image/svg+xml" : ext === ".png" ? "image/png" : "image/jpeg";
      const url = await saveImage(file, buffer, contentType);
      mapping.set(`${urlPrefix}${file}`, url);
      uploaded++;
    }
  }

  console.log(`Uploaded ${uploaded} files to Supabase Storage.`);

  let updatedCategories = 0;
  const categories = await prisma.category.findMany({ select: { id: true, image: true } });
  for (const c of categories) {
    if (c.image && mapping.has(c.image)) {
      await prisma.category.update({ where: { id: c.id }, data: { image: mapping.get(c.image) } });
      updatedCategories++;
    }
  }

  let updatedImages = 0;
  const images = await prisma.productImage.findMany({ select: { id: true, url: true } });
  for (const img of images) {
    if (img.url && mapping.has(img.url)) {
      await prisma.productImage.update({ where: { id: img.id }, data: { url: mapping.get(img.url) } });
      updatedImages++;
    }
  }

  console.log(`Rewrote ${updatedCategories} category images and ${updatedImages} product images.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
