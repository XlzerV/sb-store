"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "badge-warning",
  CONFIRMED: "badge-success",
  SHIPPED: "badge-purple",
  DELIVERED: "badge-info",
  CANCELLED: "badge-error",
};

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOrders = () => {
    fetch("/api/admin/orders")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setOrders(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [router]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(`Order updated to ${status}`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-bg-elevated border-b border-border">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SB-Store" className="h-7 w-auto" />
            <span className="font-semibold text-text">Admin</span>
          </div>
          <nav className="flex items-center gap-1">
            {adminNav.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  href === "/admin/orders"
                    ? "bg-bg-muted text-text"
                    : "text-text-muted hover:text-text hover:bg-bg-muted"
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="container py-8">
        <h1 className="text-heading-md text-text mb-6">Orders</h1>

        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="card overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-body-sm font-semibold text-text min-w-[80px]">{order.orderNumber}</span>
                  <span className="text-body-sm text-text-muted min-w-[120px]">{order.fullName}</span>
                  <span className={`badge ${statusColors[order.status] || "badge"}`}>
                    {order.status}
                  </span>
                  <span className="text-body-sm font-semibold text-text">{formatPrice(order.grandTotal)}</span>
                  <span className="text-body-xs text-text-subtle">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                {expanded === order.id ? <ChevronUp size={16} className="text-text-subtle" /> : <ChevronDown size={16} className="text-text-subtle" />}
              </button>

              {expanded === order.id && (
                <div className="border-t border-border px-4 py-4 grid grid-cols-2 gap-6 text-body-sm">
                  <div className="space-y-3">
                    <div>
                      <span className="text-caption text-text-subtle">Customer</span>
                      <p className="text-text font-medium mt-0.5">{order.fullName}</p>
                      <p className="text-text-muted">+213{order.phone}</p>
                    </div>
                    <div>
                      <span className="text-caption text-text-subtle">Shipping Address</span>
                      <p className="text-text mt-0.5">
                        {order.wilaya?.name || `Wilaya ${order.wilayaId}`}
                        {order.commune?.name ? `, ${order.commune.name}` : ""}
                      </p>
                      <p className="text-text-muted">{order.address}</p>
                    </div>
                    {order.notes && (
                      <div>
                        <span className="text-caption text-text-subtle">Notes</span>
                        <p className="text-text-muted mt-0.5">{order.notes}</p>
                      </div>
                    )}
                    {order.yalidineId && (
                      <div>
                        <span className="text-caption text-text-subtle">Yalidine ID</span>
                        <p className="text-text-muted mt-0.5 font-mono text-body-xs">{order.yalidineId}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-caption text-text-subtle">Items</span>
                      <div className="mt-1 space-y-1.5">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <span className="text-text">{item.product?.name || "Product"}</span>
                            <span className="text-text-muted text-body-xs">
                              {item.size} x{item.quantity} = <span className="font-medium text-text">{formatPrice(item.price * item.quantity)}</span>
                            </span>
                          </div>
                        ))}
                        {(!order.items || order.items.length === 0) && (
                          <span className="text-text-subtle">No items</span>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-border pt-2 space-y-1">
                      <div className="flex justify-between text-text-muted">
                        <span>Subtotal</span>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                      <div className="flex justify-between text-text-muted">
                        <span>Shipping</span>
                        <span>{formatPrice(order.shippingCost)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-text">
                        <span>Grand Total</span>
                        <span>{formatPrice(order.grandTotal)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-caption text-text-subtle">Status</span>
                      <div className="mt-1 flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="input text-xs px-3 py-1.5 w-auto"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && (
            <div className="card text-center py-16 text-text-muted text-body-sm">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
