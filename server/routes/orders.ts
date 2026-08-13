import { Router } from "express";
import { prisma } from "../index";
import { requireAdmin } from "../middleware/auth";

const router = Router();

function clampQuantity(q: unknown): number {
  const n = parseInt(q as string, 10);
  if (!Number.isInteger(n)) return 1;
  return Math.min(Math.max(n, 1), 99);
}

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { items, shippingAddress, wilaya, commune, phone, notes } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Items are required" });
    const productIds = items.map((i: any) => i.productId);
    if (productIds.some((id: any) => typeof id !== "string")) return res.status(400).json({ error: "Invalid items" });
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== productIds.length) return res.status(400).json({ error: "Some products not found" });
    const productMap = new Map(products.map((p) => [p.id, p]));
    const orderItems = items.map((i: any) => {
      const product = productMap.get(i.productId)!;
      return {
        productId: product.id,
        quantity: clampQuantity(i.quantity),
        size: typeof i.size === "string" ? i.size.slice(0, 10) : "M",
        price: product.price,
      };
    });
    const wilayaRecord = await prisma.wilaya.findFirst({ where: { name: wilaya } });
    if (!wilayaRecord) return res.status(404).json({ error: "Wilaya not found" });
    const communeRecord = await prisma.commune.findFirst({ where: { name: commune, wilayaId: wilayaRecord.id } });
    if (!communeRecord) return res.status(404).json({ error: "Commune not found" });
    const total = orderItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
    const shippingCost = wilayaRecord.shippingCost;
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        fullName: typeof shippingAddress === "string" ? shippingAddress.slice(0, 100) : "Admin",
        phone: typeof phone === "string" ? phone.slice(0, 20) : "",
        address: typeof shippingAddress === "string" ? shippingAddress.slice(0, 200) : "",
        wilayaId: wilayaRecord.id,
        communeId: communeRecord.id,
        notes: typeof notes === "string" ? notes.slice(0, 500) || null : null,
        total,
        shippingCost,
        grandTotal: total + shippingCost,
        status: "PENDING",
        items: { create: orderItems },
      },
      include: { items: true },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { product: { include: { images: true } } } },
        wilaya: true,
        commune: true,
      },
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

export default router;
