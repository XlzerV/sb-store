import { Router } from "express";
import { prisma } from "../index";

const router = Router();

function dedupeSizes(sizes: { size: string }[]) {
  const seen = new Set<string>();
  return sizes.filter((s) => {
    if (seen.has(s.size)) return false;
    seen.add(s.size);
    return true;
  });
}

router.get("/", async (req, res) => {
  try {
    const { category, search, page = "1", limit = "12" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const where: any = { inStock: true };
    if (category) where.category = { slug: category };
    if (search) where.name = { contains: search as string };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, images: true, sizes: true },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);
    res.json({
      products: products.map((p) => ({ ...p, sizes: dedupeSizes(p.sizes) })),
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { category: true, images: true, sizes: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, inStock: true },
      include: { images: true, sizes: true },
      take: 4,
    });
    res.json({
      product: { ...product, sizes: dedupeSizes(product.sizes) },
      related: related.map((p) => ({ ...p, sizes: dedupeSizes(p.sizes) })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

export default router;
