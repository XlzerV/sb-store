import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    images?: { url: string; order?: number }[];
    sizes?: { size: string }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = [...(product.images || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.url || "/placeholder.svg";
  const hasSale = product.salePrice != null && product.salePrice < product.price;

  return (
    <Link to={`/products/${product.slug}`} className="group card overflow-hidden">
      <div className="aspect-[3/4] bg-bg-muted relative overflow-hidden">
        <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        {hasSale && (
          <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-bold tracking-wider text-white bg-secondary rounded-sm">
            SALE
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-inter text-sm font-medium text-text truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-white">{formatPrice(hasSale ? product.salePrice : product.price)}</span>
          {hasSale && (
            <span className="text-xs text-text-muted line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {product.sizes.slice(0, 4).map((s) => (
              <span key={s.size} className="px-2 py-0.5 text-[10px] uppercase tracking-wider border border-border text-text-muted">
                {s.size}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
