"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { Loader2, ArrowUpRight } from "lucide-react";

interface Wilaya {
  id: number;
  name: string;
  nameAr: string;
  nameFr: string;
  shippingCost: number;
}

interface Commune {
  id: number;
  name: string;
  nameAr: string;
  nameFr: string;
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const ct = useTranslations("cart");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const { items, total, clearCart } = useCart();

  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    wilayaId: "",
    communeId: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/wilayas")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setWilayas(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (form.wilayaId) {
      fetch(`/api/wilayas/${form.wilayaId}/communes`)
        .then((res) => res.ok ? res.json() : [])
        .then((data) => setCommunes(Array.isArray(data) ? data : []))
        .catch(() => setCommunes([]));
    } else {
      setCommunes([]);
    }
  }, [form.wilayaId]);

  const selectedWilaya = wilayas.find((w) => w.id === parseInt(form.wilayaId));
  const shippingCost = selectedWilaya?.shippingCost ?? 0;

  const isRtl = locale === "ar";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.phone || !form.wilayaId || !form.communeId || !form.address) {
      toast.error("Please fill all required fields");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          wilayaId: parseInt(form.wilayaId),
          communeId: parseInt(form.communeId),
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
          })),
          total,
          shippingCost,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      clearCart();
      router.push(`/${locale}/checkout/success?order=${data.orderNumber}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-28 pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="font-inter text-white/50 text-lg mb-4">{ct("empty")}</p>
          <a
            href={`/${locale}/cart`}
            className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-xs tracking-widest text-white uppercase hover:border-white/60 font-inter"
          >
            {ct("continue")} <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-28 pb-20" dir={isRtl ? "rtl" : "ltr"}>
      <div className="px-6 sm:px-10 lg:px-16">
        <p className="font-inter text-xs tracking-[0.3em] text-white/40 uppercase mb-3">Checkout</p>
        <h1 className="font-podium text-5xl sm:text-6xl text-white uppercase leading-[0.95] mb-12">{t("title")}</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="font-podium text-xl text-white uppercase mb-6">{t("title")}</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block font-inter text-sm font-medium text-white/70 mb-1.5">
                      {t("full_name")} *
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 font-inter focus:outline-none focus:border-white/50 transition-colors"
                      placeholder="Ahmed Benali"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-inter text-sm font-medium text-white/70 mb-1.5">
                      {t("phone")} *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 bg-white/10 border border-white/20 border-r-0 rounded-l-xl text-white/50 font-inter text-sm">+213</span>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/20 rounded-r-xl px-4 py-3 text-sm text-white placeholder-white/30 font-inter focus:outline-none focus:border-white/50 transition-colors"
                        placeholder="555 123 456"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-inter text-sm font-medium text-white/70 mb-1.5">{t("wilaya")} *</label>
                      <select
                        value={form.wilayaId}
                        onChange={(e) => setForm({ ...form, wilayaId: e.target.value, communeId: "" })}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white font-inter focus:outline-none focus:border-white/50 transition-colors"
                        required
                      >
                        <option value="" className="bg-black">{t("select_wilaya")}</option>
                        {wilayas.map((w) => (
                          <option key={w.id} value={w.id} className="bg-black">
                            {isRtl ? w.nameAr : locale === "fr" ? w.nameFr : w.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-inter text-sm font-medium text-white/70 mb-1.5">{t("commune")} *</label>
                      <select
                        value={form.communeId}
                        onChange={(e) => setForm({ ...form, communeId: e.target.value })}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white font-inter focus:outline-none focus:border-white/50 transition-colors disabled:opacity-50"
                        required
                        disabled={!form.wilayaId}
                      >
                        <option value="" className="bg-black">{t("select_commune")}</option>
                        {communes.map((c) => (
                          <option key={c.id} value={c.id} className="bg-black">
                            {isRtl ? c.nameAr : locale === "fr" ? c.nameFr : c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-inter text-sm font-medium text-white/70 mb-1.5">{t("address")} *</label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 font-inter focus:outline-none focus:border-white/50 transition-colors"
                      rows={3}
                      placeholder="Street, house number, landmark..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-inter text-sm font-medium text-white/70 mb-1.5">{t("notes")}</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 font-inter focus:outline-none focus:border-white/50 transition-colors"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-28">
                <h2 className="font-podium text-xl text-white uppercase mb-5">{t("order_summary")}</h2>

                <div className="space-y-3.5 mb-5">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-medium text-white line-clamp-1">{item.name}</p>
                        <p className="font-inter text-xs text-white/40 mt-0.5">Size: {item.size} x{item.quantity}</p>
                        <p className="font-inter text-sm font-bold text-white mt-1">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between font-inter text-sm">
                    <span className="text-white/50">{ct("subtotal")}</span>
                    <span className="text-white">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between font-inter text-sm">
                    <span className="text-white/50">{ct("shipping")}</span>
                    <span className="font-medium text-white">{shippingCost > 0 ? formatPrice(shippingCost) : "—"}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-white/10 pt-2">
                    <span className="font-inter text-white">{ct("total")}</span>
                    <span className="font-inter text-lg text-white">{formatPrice(total + shippingCost)}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <p className="font-inter text-sm font-medium text-white mb-0.5">{t("payment_method")}</p>
                  <p className="font-inter text-xs text-white/50">{t("cash_on_delivery")}</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 w-full mt-5 bg-white text-black px-6 py-3.5 text-xs tracking-widest uppercase font-inter font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 rounded-xl"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {t("place_order")} <ArrowUpRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
