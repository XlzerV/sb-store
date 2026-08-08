import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowUpRight, CreditCard } from "lucide-react";
import { getCart, clearCart, getCartTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import type { CartItem } from "@/lib/cart";

export default function Checkout() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [form, setForm] = useState({ fullName: "", phone: "", address: "", wilayaId: "", commune: "", notes: "" });

  useEffect(() => {
    const cart = getCart();
    if (cart.length === 0) { navigate("/cart"); return; }
    setItems(cart);
    api.get<any[]>("/admin/wilayas").then(setWilayas).catch(() => {});
  }, [navigate]);

  const handleWilayaChange = async (wilayaId: string) => {
    setForm({ ...form, wilayaId, commune: "" });
    if (!wilayaId) { setCommunes([]); setShippingCost(0); return; }
    try {
      const data = await api.post<any>("/checkout/calculate-shipping", { wilayaId: parseInt(wilayaId) });
      setShippingCost(data.shippingCost);
      const com = await api.get<any[]>(`/admin/wilayas/${wilayaId}/communes`);
      setCommunes(com || []);
    } catch { setShippingCost(0); }
  };

  const subtotal = getCartTotal(items);
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.address || !form.wilayaId || !form.commune) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const order = await api.post<any>("/checkout/place-order", {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size, price: i.price })),
        fullName: form.fullName,
        address: form.address,
        wilayaId: form.wilayaId,
        commune: form.commune,
        phone: form.phone,
        notes: form.notes,
      });
      clearCart();
      window.dispatchEvent(new Event("cart-update"));
      toast.success("Order placed successfully!");
      navigate(`/order/${order.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 sm:px-10 lg:px-16 bg-bg">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-podium text-display-md text-text mb-10">Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-6">
              <div className="card p-6 space-y-4">
                <h3 className="font-inter text-sm font-semibold text-text">Contact</h3>
                <input className="input-field" placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                <input className="input-field" type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="card p-6 space-y-4">
                <h3 className="font-inter text-sm font-semibold text-text">Delivery</h3>
                <select className="input-field" value={form.wilayaId} onChange={(e) => handleWilayaChange(e.target.value)} required>
                  <option value="">Select Wilaya</option>
                  {wilayas.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <select className="input-field" value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} required disabled={communes.length === 0}>
                  <option value="">Select Commune</option>
                  {communes.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <textarea className="input-field" rows={3} placeholder="Full Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                <input className="input-field" placeholder="Order Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <CreditCard size={16} />
                  <span>Payment on delivery (cash/EDahabia)</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="card p-6 lg:sticky lg:top-28 space-y-4">
                <h3 className="font-inter text-sm font-semibold text-text">Order Summary</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-12 h-12 object-cover rounded bg-bg-muted" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text truncate">{item.name}</p>
                      <p className="text-xs text-text-muted">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <p className="text-sm text-text">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-text-muted"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-text-muted"><span>Shipping</span><span>{shippingCost > 0 ? formatPrice(shippingCost) : "—"}</span></div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold text-text"><span>Total</span><span>{formatPrice(total)}</span></div>
                </div>
                <button type="submit" className="btn-secondary w-full gap-2">
                  PLACE ORDER <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
