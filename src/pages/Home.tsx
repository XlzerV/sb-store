import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Crown } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.get<any>("/products?limit=8").then((d) => setFeatured(d.products || [])).catch(() => {});
    api.get<any[]>("/categories").then(setCategories).catch(() => {});
  }, []);

  return (
    <div>
      <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-secondary/10" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up space-y-8">
              <div className="flex items-center gap-2 text-secondary text-xs tracking-[0.2em] uppercase">
                <Crown size={14} /> Premium Streetwear
              </div>
              <h1 className="font-podium text-display-xl text-white leading-[1.05] tracking-tight">
                STYLE<br />BLADI
              </h1>
              <p className="text-white/40 text-body-lg max-w-md leading-relaxed">
                Premium t-shirts and streetwear crafted for those who refuse to blend in. Bold designs, uncompromising quality.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-primary bg-white text-black hover:bg-white/90 gap-2">
                  SHOP COLLECTION <ArrowUpRight size={16} />
                </Link>
                <Link to="/products" className="btn-outline border-white/20 text-white hover:bg-white/10 gap-2">
                  VIEW LOOKBOOK
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center animate-fade-up [animation-delay:400ms]">
              <div className="relative w-80 h-96">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent rounded-2xl rotate-6" />
                <div className="absolute inset-0 border border-white/10 rounded-2xl -rotate-3" />
                <div className="absolute inset-0 bg-bg-elevated rounded-2xl flex items-center justify-center overflow-hidden">
                  <span className="font-podium text-5xl text-white/5">SB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 pt-16 border-t border-white/5">
            {[{ label: "Premium Quality", desc: "100% combed cotton" }, { label: "Shipping", desc: "To all Algeria" }, { label: "Easy Returns", desc: "14-day return policy" }, { label: "Secure Payment", desc: "Cash on delivery" }].map((stat, i) => (
              <div key={i} className="text-center animate-fade-up" style={{ animationDelay: `${i * 150}ms` }}>
                <p className="text-xs tracking-[0.15em] text-white/60 uppercase">{stat.label}</p>
                <p className="text-sm text-white/30 mt-1">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-20 px-6 sm:px-10 lg:px-16 bg-bg">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-podium text-display-sm text-text">Categories</h2>
              <Link to="/products" className="text-sm text-text-muted hover:text-text transition-colors">View All →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <Link key={cat.id} to={`/products?category=${cat.slug}`} className="group card p-6 text-center hover:border-secondary transition-all animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-14 h-14 mx-auto object-cover rounded-full mb-3 ring-1 ring-white/10" />
                  ) : (
                    <div className={`w-14 h-14 mx-auto rounded-full mb-3 flex items-center justify-center text-lg font-bold ${cat.slug.includes('black') ? 'bg-black ring-1 ring-white/20 text-white/60' : cat.slug.includes('grey') ? 'bg-[#4a4a4a] text-white/60' : 'bg-white/20 text-white/60'}`}>
                      {cat.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-inter text-sm font-medium text-text">{cat.name}</h3>
                  <p className="text-xs text-text-muted mt-1">{cat._count?.products || 0} items</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 px-6 sm:px-10 lg:px-16 bg-bg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-podium text-display-sm text-text">Featured</h2>
            <Link to="/products" className="text-sm text-text-muted hover:text-text transition-colors">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
