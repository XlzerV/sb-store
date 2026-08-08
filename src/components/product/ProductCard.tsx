import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    images: { url: string; alt: string | null }[];
    sizes: { size: string; stock: number }[];
  };
  locale: string;
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const imageUrl = product.images[0]?.url || "/images/placeholder.svg";
  const hasSale = product.salePrice && product.salePrice < product.price;
  const inStock = product.sizes.some((s) => s.stock > 0);

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group relative block bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 hover:border-white/30 hover:bg-white/[0.07]"
      aria-label={product.name}
    >
      <div className="relative aspect-square overflow-hidden bg-black/40">
        <img
          src={imageUrl}
          alt={product.images[0]?.alt || product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {hasSale && (
          <span className="absolute top-3 left-3 bg-white text-black text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest font-inter">
            Sale
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="border border-white/30 text-white/70 text-[10px] font-inter tracking-widest uppercase px-3 py-1.5">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-inter text-sm font-medium text-white/80 group-hover:text-white transition-colors line-clamp-1 mb-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          {hasSale ? (
            <>
              <span className="text-white font-semibold text-sm font-inter">{formatPrice(product.salePrice!)}</span>
              <span className="text-white/40 text-xs line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-white font-semibold text-sm font-inter">{formatPrice(product.price)}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5" role="list" aria-label="Available sizes">
          {product.sizes.map((s) => (
            <span
              key={s.size}
              className={`inline-flex items-center justify-center px-2.5 py-1 rounded text-[10px] font-medium font-inter transition-all ${
                s.stock > 0
                  ? "bg-white/10 text-white/70 border border-white/20"
                  : "bg-white/5 text-white/30 line-through border border-white/10"
              }`}
            >
              {s.size}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
