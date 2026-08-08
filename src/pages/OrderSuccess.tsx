import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get<any>(`/orders/${id}`)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen pt-28 px-6 bg-bg flex items-center justify-center"><div className="animate-pulse text-text-muted">Loading...</div></div>;

  if (!order) return <div className="min-h-screen pt-28 px-6 bg-bg flex items-center justify-center"><p className="text-text-muted">Order not found</p></div>;

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-bg flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6">
        <CheckCircle size={48} className="text-success mx-auto" />
        <h1 className="font-podium text-display-md text-text">Order Placed!</h1>
        <p className="text-text-muted">Thank you for your order. We'll confirm via SMS.</p>
        <div className="card p-6 text-left space-y-3">
          <div className="flex justify-between text-sm"><span className="text-text-muted">Order</span><span className="text-text font-mono">#{order.id.slice(0, 8)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-text-muted">Total</span><span className="text-text font-semibold">{formatPrice(order.total)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-text-muted">Status</span><span className="text-yellow-400 text-xs uppercase tracking-wider">{order.status}</span></div>
          <div className="flex justify-between text-sm"><span className="text-text-muted">Delivery</span><span className="text-text">{order.wilaya?.name}, {order.commune?.name}</span></div>
        </div>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          CONTINUE SHOPPING <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
