import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const activeCategory = searchParams.get("category") || "";

  useEffect(() => {
    api.get<any[]>("/categories").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    api.get<any>(`/products?${params.toString()}`)
      .then((d) => setProducts(d.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 sm:px-10 lg:px-16 bg-bg">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="font-podium text-display-md text-text">Products</h1>
          <p className="text-text-muted mt-2">Premium streetwear collection</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          <a href="/products" className={`px-4 py-2 text-xs tracking-wider uppercase rounded-full border transition-all ${!activeCategory ? "bg-secondary text-white border-secondary" : "border-border text-text-muted hover:text-text"}`}>
            All
          </a>
          {categories.map((cat) => (
            <a key={cat.id} href={`/products?category=${cat.slug}`} className={`px-4 py-2 text-xs tracking-wider uppercase rounded-full border transition-all ${activeCategory === cat.slug ? "bg-secondary text-white border-secondary" : "border-border text-text-muted hover:text-text"}`}>
              {cat.name}
            </a>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[3/4] bg-bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-bg-muted rounded w-3/4" />
                  <div className="h-4 bg-bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
