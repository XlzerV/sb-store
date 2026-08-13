import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowUpRight, Check, Minus, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { addToCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get<any>(`/products/${slug}`)
      .then((d) => {
        setProduct(d.product);
        setRelated(d.related || []);
        if (d.product?.sizes?.length) setSelectedSize(d.product.sizes[0].size);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error("Select a size"); return; }
    const img = [...(product.images || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))[0]?.url || "";
    addToCart({ productId: product.id, name: product.name, price: product.price, size: selectedSize, quantity, image: img, slug: product.slug });
    window.dispatchEvent(new Event("cart-update"));
    toast.success("Added to cart");
  };

  if (loading) return <div className="min-h-screen pt-28 px-6 bg-bg flex items-center justify-center"><div className="animate-pulse text-text-muted">Loading...</div></div>;

  if (!product) return <div className="min-h-screen pt-28 px-6 bg-bg flex items-center justify-center"><p className="text-text-muted">Product not found</p></div>;

  const image = [...(product.images || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))[0]?.url || "/placeholder.svg";
  const hasSale = product.salePrice != null && product.salePrice < product.price;
  const sizes = Array.from(new Map((product.sizes || []).map((s: any) => [s.size, s])).values());

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 sm:px-10 lg:px-16 bg-bg">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          <div className="aspect-[3/4] bg-bg-muted rounded-2xl overflow-hidden">
            <img src={image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-6">
            {product.category && (
              <Link to={`/products?category=${product.category.slug}`} className="text-xs tracking-widest text-text-muted uppercase hover:text-text transition-colors">
                {product.category.name}
              </Link>
            )}
            <h1 className="font-podium text-display-md text-text">{product.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-white">{formatPrice(hasSale ? product.salePrice : product.price)}</span>
              {hasSale && <span className="text-lg text-text-muted line-through">{formatPrice(product.price)}</span>}
            </div>
            {product.description && <p className="text-text-muted leading-relaxed">{product.description}</p>}

            {sizes.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-text-muted">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s: any) => (
                    <button key={s.size} onClick={() => setSelectedSize(s.size)} className={`px-5 py-2.5 text-sm border rounded-lg transition-all ${selectedSize === s.size ? "border-secondary bg-secondary/10 text-white" : "border-border text-text-muted hover:text-text"}`}>
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-text-muted hover:text-text"><Minus size={16} /></button>
                <span className="w-12 text-center text-text">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-text-muted hover:text-text"><Plus size={16} /></button>
              </div>
              <button onClick={handleAddToCart} className="btn-secondary flex-1 gap-2">
                ADD TO CART <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="border-t border-border pt-6 space-y-3 text-sm text-text-muted">
              <div className="flex items-center gap-2"><Check size={14} className="text-success" /> Shipping to all Algeria</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-success" /> 14-day easy returns</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-success" /> Cash on delivery</div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-podium text-display-sm text-text mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
