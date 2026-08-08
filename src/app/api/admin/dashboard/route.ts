import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [totalSales, totalOrders, pendingOrders, totalProducts, recentOrders] = await Promise.all([
      prisma.order.aggregate({ _sum: { grandTotal: true }, where: { status: { not: "CANCELLED" } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count(),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true, wilaya: true },
      }),
    ]);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: twelveMonthsAgo }, status: { not: "CANCELLED" } },
      select: { grandTotal: true, createdAt: true },
    });

    const salesByMonthMap = new Map<string, { total: number; count: number }>();
    for (const order of orders) {
      const key = `${order.createdAt!.getFullYear()}-${String(order.createdAt!.getMonth() + 1).padStart(2, "0")}`;
      const existing = salesByMonthMap.get(key) || { total: 0, count: 0 };
      existing.total += order.grandTotal;
      existing.count += 1;
      salesByMonthMap.set(key, existing);
    }

    const salesByMonth = Array.from(salesByMonthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, { total, count }]) => ({ month, total, count }));

    return NextResponse.json({
      totalSales: totalSales._sum.grandTotal || 0,
      totalOrders,
      pendingOrders,
      totalProducts,
      recentOrders,
      salesByMonth,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
