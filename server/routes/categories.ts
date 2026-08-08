import { Router } from "express";
import { prisma } from "../index";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: { where: { inStock: true } } } } },
      orderBy: { name: "asc" },
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
