"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowLeft, ArrowUpRight } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const t = useTranslations("cart");
  const params = useParams();
  const locale = params.locale as string;
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-28 pb-20 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-white/20 mb-5" />
          <h1 className="font-podium text-4xl text-white uppercase mb-2">{t("empty")}</h1>
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center gap-2 mt-6 border border-white/30 px-6 py-3 text-xs tracking-widest text-white uppercase hover:border-white/60 hover:bg-white/10 font-inter"
          >
            {t("empty_cta")} <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-28 pb-20">
      <div className="px-6 sm:px-10 lg:px-16">
        <p className="font-inter text-xs tracking-[0.3em] text-white/40 uppercase mb-3">Cart</p>
        <h1 className="font-podium text-5xl sm:text-6xl text-white uppercase leading-[0.95] mb-12">{t("title")}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-4"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-black/40 shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-inter text-sm font-medium text-white">{item.name}</h3>
                  <p className="font-inter text-xs text-white/40 mt-0.5">Size: {item.size}</p>
                  <p className="font-inter text-sm font-semibold text-white mt-1.5">{formatPrice(item.price)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.productId, item.size)}
                    className="text-white/30 hover:text-white transition-colors p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center border border-white/20 rounded-xl overflow-hidden">
                    <button
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateQuantity(item.productId, item.size, item.quantity - 1);
                        }
                      }}
                      className="px-3 py-1.5 text-white/50 hover:bg-white/10 font-inter text-sm transition-colors"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 font-inter font-medium text-sm min-w-[2rem] text-center border-x border-white/20 text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="px-3 py-1.5 text-white/50 hover:bg-white/10 font-inter text-sm transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
            <h2 className="font-podium text-xl text-white uppercase mb-5">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between font-inter text-sm">
                <span className="text-white/50">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
                <span className="font-medium text-white">{formatPrice(total)}</span>
              </div>

              <div className="border-t border-white/10 pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span className="font-inter text-white">{t("total")}</span>
                  <span className="font-inter text-lg font-bold text-white">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <Link
              href={`/${locale}/checkout`}
              className="flex items-center justify-center gap-2 w-full mt-6 bg-white text-black px-6 py-3.5 text-xs tracking-widest uppercase font-inter font-semibold hover:bg-neutral-200 transition-colors"
            >
              {t("checkout")} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href={`/${locale}/products`}
              className="flex items-center justify-center gap-1.5 w-full mt-3 text-white/50 hover:text-white text-xs tracking-widest uppercase font-inter transition-colors"
            >
              <ArrowLeft size={14} />
              {t("continue")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
