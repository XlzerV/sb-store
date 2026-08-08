"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  TrendingUp,
  LogOut,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatPrice } from "@/lib/utils";

interface DashboardData {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  recentOrders: any[];
  salesByMonth: { month: string; total: number; count: number }[];
}

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setData(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Sales",
      value: data ? formatPrice(data.totalSales) : "0 DZD",
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      label: "Total Orders",
      value: data ? String(data.totalOrders ?? 0) : "0",
      icon: ShoppingBag,
      color: "bg-blue-500",
    },
    {
      label: "Pending Orders",
      value: data ? String(data.pendingOrders ?? 0) : "0",
      icon: Clock,
      color: "bg-amber-500",
    },
    {
      label: "Total Products",
      value: data ? String(data.totalProducts ?? 0) : "0",
      icon: Package,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-bg-elevated border-b border-border">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SB-Store" className="h-7 w-auto" />
            <span className="font-semibold text-text">Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-1">
              {adminNav.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    href === "/admin"
                      ? "bg-bg-muted text-text"
                      : "text-text-muted hover:text-text hover:bg-bg-muted"
                  }`}
                >
                  {label}
                </a>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-text-subtle hover:text-secondary transition-colors"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-text-subtle">{stat.label}</p>
                  <p className="text-heading-lg text-text mt-1.5">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="text-white" size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="font-semibold text-body mb-5 flex items-center gap-2 text-text">
              <TrendingUp size={18} className="text-secondary" /> Sales Overview
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.salesByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="var(--secondary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-body mb-5 flex items-center gap-2 text-text">
              <ShoppingBag size={18} className="text-secondary" /> Recent Orders
            </h2>
            <div className="space-y-2">
              {data?.recentOrders?.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-bg-muted rounded-xl"
                >
                  <div>
                    <p className="text-body-sm font-medium text-text">{order.orderNumber}</p>
                    <p className="text-body-xs text-text-muted">{order.fullName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-body-sm text-text">{formatPrice(order.grandTotal)}</p>
                    <span
                      className={`badge ${
                        order.status === "PENDING"
                          ? "badge-warning"
                          : order.status === "DELIVERED"
                          ? "badge-success"
                          : "badge"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {(!data?.recentOrders || data.recentOrders.length === 0) && (
                <p className="text-text-muted text-center py-8 text-body-sm">No orders yet</p>
              )}
            </div>
            <a
              href="/admin/orders"
              className="block text-center text-caption font-medium text-secondary hover:text-secondary/80 mt-4 transition-colors"
            >
              View all orders
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
