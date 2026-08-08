import { Router } from "express";
import { prisma } from "../index";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/dashboard", requireAdmin, async (_req, res) => {
  try {
    const [totalOrders, pendingOrders, totalProducts, totalSales] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count(),
      prisma.order.aggregate({ _sum: { grandTotal: true } }),
    ]);
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    });
    res.json({ totalSales: totalSales._sum.grandTotal || 0, totalOrders, pendingOrders, totalProducts, recentOrders });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

router.get("/products", requireAdmin, async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, images: true, sizes: true, _count: { select: { orderItems: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/products/:id", requireAdmin, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true, images: true, sizes: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.post("/products", requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, price, salePrice, categoryId, sizes, images, inStock, featured } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        categoryId,
        inStock: inStock ?? true,
        featured: featured ?? false,
        sizes: { create: (sizes || []).map((s: string) => ({ size: s })) },
        images: { create: (images || []).map((url: string, i: number) => ({ url, order: i })) },
      },
      include: { category: true, images: true, sizes: true },
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/products/:id", requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, price, salePrice, categoryId, sizes, images, inStock, featured } = req.body;
    await prisma.productSize.deleteMany({ where: { productId: req.params.id } });
    await prisma.productImage.deleteMany({ where: { productId: req.params.id } });
    const data: any = { name, slug, description, price: parseFloat(price) };
    if (salePrice) data.salePrice = parseFloat(salePrice);
    if (categoryId) data.categoryId = categoryId;
    if (inStock !== undefined) data.inStock = inStock;
    if (featured !== undefined) data.featured = featured;
    data.sizes = { create: (sizes || []).map((s: string) => ({ size: s })) };
    data.images = { create: (images || []).map((url: string, i: number) => ({ url, order: i })) };
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { category: true, images: true, sizes: true },
    });
    res.json(product);
  } catch (err: any) {
    console.error("Update product error:", err?.message || err);
    res.status(500).json({ error: err?.message || "Failed to update product" });
  }
});

router.delete("/products/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.productImage.deleteMany({ where: { productId: req.params.id } });
    await prisma.productSize.deleteMany({ where: { productId: req.params.id } });
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ ok: true, hidden: false });
  } catch (err: any) {
    if (err?.code === "P2003") {
      await prisma.product.update({ where: { id: req.params.id }, data: { inStock: false } });
      return res.json({ ok: true, hidden: true });
    }
    res.status(500).json({ error: "Failed to delete product" });
  }
});

router.get("/orders", requireAdmin, async (req, res) => {
  try {
    const { status, page = "1" } = req.query;
    const where: any = {};
    if (status) where.status = status;
    const orders = await prisma.order.findMany({
      where,
      include: { items: { include: { product: { include: { images: true } } } }, wilaya: true, commune: true },
      orderBy: { createdAt: "desc" },
      skip: (parseInt(page as string) - 1) * 20,
      take: 20,
    });
    const total = await prisma.order.count({ where });
    res.json({ orders, total, page: parseInt(page as string), totalPages: Math.ceil(total / 20) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.put("/orders/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
