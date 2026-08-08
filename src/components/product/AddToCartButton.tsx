"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/lib/CartContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: { url: string }[];
  sizes: { size: string; stock: number }[];
}

export default function AddToCartButton({
  product,
  locale,
}: {
  product: Product;
  locale: string;
}) {
  const t = useTranslations("product");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      size: selectedSize,
      image: product.images[0]?.url || "",
      quantity: 1,
    });

    toast.success("Added to cart!");
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-body-sm font-medium text-text mb-3">{t("sizes")}</h3>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s.size}
              disabled={s.stock === 0}
              onClick={() => setSelectedSize(s.size)}
              className={`px-4 py-2 text-body-sm font-medium rounded-xl transition-all duration-200 ${
                s.stock === 0
                  ? "opacity-30 cursor-not-allowed line-through"
                  : selectedSize === s.size
                  ? "btn-primary btn-sm"
                  : "bg-bg-elevated text-text-muted border border-border hover:border-secondary hover:text-secondary"
              }`}
            >
              {s.size}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleAddToCart}
        disabled={loading || !selectedSize}
        className="btn btn-primary btn-md w-full"
      >
        <ShoppingCart size={18} />
        {t("add_to_cart")}
      </button>
      <p className="text-body-xs text-text-subtle text-center">
        {t("cash_on_delivery")}
      </p>
    </div>
  );
}
