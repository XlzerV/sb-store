import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { createDelivery } from "@/lib/yalidine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, wilayaId, communeId, address, notes, items, shippingCost } = body;

    if (!fullName || !phone || !wilayaId || !communeId || !address || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const wilaya = parseInt(wilayaId);
    const commune = parseInt(communeId);
    if (isNaN(wilaya) || wilaya < 1 || isNaN(commune) || commune < 1) {
      return NextResponse.json({ error: "Invalid wilaya or commune" }, { status: 400 });
    }

    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, salePrice: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let computedTotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }
      const unitPrice = product.salePrice ?? product.price;
      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty < 1) {
        return NextResponse.json({ error: `Invalid quantity for ${item.productId}` }, { status: 400 });
      }
      computedTotal += unitPrice * qty;
      orderItems.push({
        productId: product.id,
        size: String(item.size ?? ""),
        quantity: qty,
        price: unitPrice,
      });
    }

    const ship = typeof shippingCost === "number" && shippingCost >= 0 ? shippingCost : 0;
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        fullName,
        phone,
        wilayaId: wilaya,
        communeId: commune,
        address,
        notes,
        total: computedTotal,
        shippingCost: ship,
        grandTotal: computedTotal + ship,
        status: "PENDING",
        items: { create: orderItems },
      },
    });

    if (process.env.YALIDINE_API_KEY) {
      const cleanPhone = phone.replace(/\D/g, "");
      const yalidinePhone = cleanPhone.startsWith("213")
        ? `+${cleanPhone}`
        : `+213${cleanPhone.replace(/^0+/, "")}`;

      const delivery = await createDelivery({
        id: order.id,
        order_number: orderNumber,
        total: computedTotal + ship,
        status: "PENDING",
        address: {
          wilaya_id: wilaya,
          commune_id: commune,
          address,
          full_name: fullName,
          phone: yalidinePhone,
        },
        items: orderItems.map((item) => ({
          name: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      if (delivery?.id) {
        await prisma.order.update({
          where: { id: order.id },
          data: { yalidineId: delivery.id },
        });
      }
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
