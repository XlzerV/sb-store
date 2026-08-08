import { Router } from "express";
import { prisma } from "../index";

const router = Router();

router.post("/calculate-shipping", async (req, res) => {
  try {
    const { wilayaId } = req.body;
    const wilaya = await prisma.wilaya.findUnique({ where: { id: wilayaId } });
    if (!wilaya) return res.status(404).json({ error: "Wilaya not found" });
    res.json({ shippingCost: wilaya.shippingCost, wilaya: wilaya.name });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate shipping" });
  }
});

router.post("/place-order", async (req, res) => {
  try {
    const { items, fullName, address, wilayaId, commune, phone, notes } = req.body;
    if (!items?.length) return res.status(400).json({ error: "Cart is empty" });
    if (!fullName || !phone || !address || !wilayaId || !commune) return res.status(400).json({ error: "Missing required fields" });
    const [wilaya, communeRecord] = await Promise.all([
      prisma.wilaya.findUnique({ where: { id: parseInt(wilayaId) } }),
      prisma.commune.findFirst({ where: { name: commune, wilayaId: parseInt(wilayaId) } }),
    ]);
    if (!wilaya) return res.status(404).json({ error: "Wilaya not found" });
    if (!communeRecord) return res.status(404).json({ error: "Commune not found" });
    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));
    const orderItems = items.map((i: any) => {
      const product = productMap.get(i.productId);
      return { productId: i.productId, quantity: i.quantity, size: i.size, price: product?.price || i.price };
    });
    const subtotal = orderItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
    const shippingCost = wilaya.shippingCost;
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        fullName,
        phone,
        address,
        wilayaId: wilaya.id,
        communeId: communeRecord.id,
        notes: notes || null,
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
