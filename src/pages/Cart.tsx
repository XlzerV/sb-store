import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowUpRight } from "lucide-react";
import { getCart, removeFromCart, updateQuantity, getCartTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/lib/cart";

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => { setItems(getCart()); }, []);

  const update = (id: string, qty: number) => {
    setItems(updateQuantity(id, qty));
    window.dispatchEvent(new Event("cart-update"));
  };

  const remove = (id: string) => {
    setItems(removeFromCart(id));
    window.dispatchEvent(new Event("cart-update"));
  };

  const total = getCartTotal(items);

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center bg-bg">
        <div className="text-center max-w-md">
          <h1 className="font-podium text-display-md text-text mb-4">Your cart is empty</h1>
          <p className="text-text-muted mb-8">Add some pieces to your collection</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            SHOP NOW <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 sm:px-10 lg:px-16 bg-bg">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-podium text-display-md text-text mb-10">Cart ({items.length})</h1>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card p-4 flex gap-4 items-center">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-bg-muted" />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.slug}`} className="font-inter text-sm font-medium text-text hover:text-secondary transition-colors truncate block">
                    {item.name}
                  </Link>
                  <p className="text-xs text-text-muted mt-0.5">Size: {item.size}</p>
                  <p className="text-sm font-semibold text-white mt-1">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => update(item.id, item.quantity - 1)} className="p-1 text-text-muted hover:text-text transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm text-text">{item.quantity}</span>
                  <button onClick={() => update(item.id, item.quantity + 1)} className="p-1 text-text-muted hover:text-text transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <p className="text-sm font-semibold text-white w-20 text-right">{formatPrice(item.price * item.quantity)}</p>
                <button onClick={() => remove(item.id)} className="p-2 text-text-muted hover:text-error transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="card p-6 h-fit lg:sticky lg:top-28">
            <h3 className="font-inter text-sm font-semibold text-text mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-text">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-secondary w-full mt-6 gap-2">
              CHECKOUT <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
