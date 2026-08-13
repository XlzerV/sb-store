import { Router } from "express";
import { prisma } from "../index";

const router = Router();

const MAX_QUANTITY = 99;

function clampQuantity(q: unknown): number {
  const n = parseInt(q as string, 10);
  if (!Number.isInteger(n)) return 1;
  return Math.min(Math.max(n, 1), MAX_QUANTITY);
}

router.post("/calculate-shipping", async (req, res) => {
  try {
    const { wilayaId } = req.body;
    const id = parseInt(wilayaId, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid wilaya" });
    const wilaya = await prisma.wilaya.findUnique({ where: { id } });
    if (!wilaya) return res.status(404).json({ error: "Wilaya not found" });
    res.json({ shippingCost: wilaya.shippingCost, wilaya: wilaya.name });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate shipping" });
  }
});

router.post("/place-order", async (req, res) => {
  try {
    const { items, fullName, address, wilayaId, commune, phone, notes } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Cart is empty" });
    if (typeof fullName !== "string" || typeof phone !== "string" || typeof address !== "string") {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!/^[0-9+\s-]{7,20}$/.test(phone.trim())) {
      return res.status(400).json({ error: "Invalid phone number" });
    }
    const wilayaIdNum = parseInt(wilayaId, 10);
    if (!Number.isInteger(wilayaIdNum)) return res.status(400).json({ error: "Invalid wilaya" });
    const [wilaya, communeRecord] = await Promise.all([
      prisma.wilaya.findUnique({ where: { id: wilayaIdNum } }),
      prisma.commune.findFirst({ where: { name: commune, wilayaId: wilayaIdNum } }),
    ]);
    if (!wilaya) return res.status(404).json({ error: "Wilaya not found" });
    if (!communeRecord) return res.status(404).json({ error: "Commune not found" });

    const productIds = items.map((i: any) => i.productId);
    if (productIds.some((id: any) => typeof id !== "string")) {
      return res.status(400).json({ error: "Invalid cart" });
    }
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== productIds.length) {
      return res.status(400).json({ error: "Some products are no longer available" });
    }
    const outOfStock = products.find((p) => !p.inStock);
    if (outOfStock) return res.status(400).json({ error: `${outOfStock.name} is out of stock` });

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

    const subtotal = orderItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
    const shippingCost = wilaya.shippingCost;
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        fullName: fullName.trim().slice(0, 100),
        phone: phone.trim().slice(0, 20),
        address: address.trim().slice(0, 200),
        wilayaId: wilaya.id,
        communeId: communeRecord.id,
        notes: typeof notes === "string" ? notes.slice(0, 500) || null : null,
        shippingCost,
        total: subtotal,
        grandTotal: subtotal + shippingCost,
        status: "PENDING",
        items: { create: orderItems },
      },
      include: { items: { include: { product: { include: { images: true } } } }, wilaya: true, commune: true },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to place order" });
  }
});

export default router;
