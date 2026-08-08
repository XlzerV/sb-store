import { Router } from "express";
import { prisma } from "../index";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { items, shippingAddress, wilaya, commune, phone, notes } = req.body;
    const order = await prisma.order.create({
      data: {
        items: { create: items.map((i: any) => ({ productId: i.productId, quantity: i.quantity, size: i.size, price: i.price })) },
        shippingAddress,
        wilaya,
        commune,
        phone,
        notes,
        total: items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0),
        status: "PENDING",
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
