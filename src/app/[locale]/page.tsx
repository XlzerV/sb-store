import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { Truck, ShieldCheck, RotateCcw, HeadphonesIcon, ChevronRight, ArrowUpRight, Award, Crown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";
async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { featured: true, inStock: true },
      include: { images: { orderBy: { order: "asc" }, take: 1 }, sizes: true, category: true },
      take: 8,
    });
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({ include: { _count: { select: { products: true } } } });
  } catch {
    return [];
  }
}

const categoryImages: Record<string, string> = {
  "grey-tshirts": "/images/products/Gemini_Generated_Image_jdmgv1jdmgv1jdmg (1) - Copie.png",
  "black-tshirts": "/images/products/Gemini_Generated_Image_hkscjehkscjehksc - Copie.png",
  "white-tshirts": "/images/products/Gemini_Generated_Image_ga28g7ga28g7ga28 - Copie.png",
};

const categoryGradients: Record<string, string> = {
  "grey-tshirts": "from-gray-800/70 via-gray-900/40 to-transparent",
  "black-tshirts": "from-black/70 via-black/40 to-transparent",
  "white-tshirts": "from-gray-700/70 via-gray-800/40 to-transparent",
};

const features = [
  { icon: Truck, key: "free_shipping" },
  { icon: ShieldCheck, key: "secure_payment" },
  { icon: RotateCcw, key: "easy_return" },
  { icon: HeadphonesIcon, key: "support" },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const products = await getFeaturedProducts();
  const categories = await getCategories();

  return (
    <div className="bg-black">
      <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
        <Image
          src="/images/products/Gemini_Generated_Image_ga28g7ga28g7ga28 - Copie.png"
          alt="SB-Store hero"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex flex-1 items-center px-6 sm:px-10 lg:px-16">
            <div className="w-full max-w-3xl">
              <div className="animate-fade-up flex items-center gap-2 mb-6 lg:mb-8">
                <Crown className="h-4 w-4 text-white/60" />
                <span className="font-inter text-xs tracking-[0.3em] text-white/60 uppercase sm:text-sm">
                  Premium T-Shirts Algeria
                </span>
              </div>

              <h1 className="animate-fade-up-delay-1 font-podium text-[clamp(2.8rem,8vw,7rem)] leading-[0.92] tracking-tight text-white uppercase">
                <div>Style.</div>
                <div>Comfort.</div>
                <div>Dominate.</div>
              </h1>

              <p className="animate-fade-up-delay-2 mt-6 max-w-md font-inter text-sm leading-relaxed text-white/60 sm:text-base lg:mt-8">
                Premium cotton t-shirts crafted in Algeria.<br />
                Clean design. Uncompromising quality.{" "}
                <span className="font-bold text-white">Wear the edge.</span>
              </p>

              <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap items-center gap-4 sm:gap-6 lg:mt-10">
                <Link
                  href={`/${locale}/products`}
                  className="group flex items-center gap-2 bg-white px-5 py-3 text-[11px] tracking-widest text-black uppercase transition-colors hover:bg-neutral-200 sm:px-7 sm:py-4 sm:text-xs font-inter font-semibold"
                >
                  SHOP COLLECTION
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

                <div className="hidden items-center gap-3 sm:flex">
                  <Award className="h-8 w-8 text-white/40" />
                  <div>
                    <p className="text-xs tracking-wider text-white/50 uppercase font-inter">Premium Quality</p>
                    <p className="text-xs tracking-wider text-white/50 uppercase font-inter">Algeria-Made</p>
                  </div>
                </div>
              </div>

              <div className="animate-fade-up-delay-4 mt-8 flex flex-wrap gap-6 sm:mt-10 sm:gap-12 lg:mt-14 lg:gap-16">
                {[
                  { value: "5K+", label: "Happy Customers" },
                  { value: "100%", label: "Satisfaction" },
                  { value: "48H", label: "Fast Delivery" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-inter text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[9px] tracking-widest text-white/40 uppercase font-inter sm:text-xs">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-black border-b border-white/10">
        <div className="px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, key }, i) => (
              <div key={key} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Icon className="text-white/70" size={20} />
                </div>
                <p className="text-sm font-medium text-white/70 font-inter">{t(key)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-20 md:py-28 bg-black">
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="text-center mb-14">
              <p className="font-inter text-xs tracking-[0.3em] text-white/40 uppercase mb-3">Collections</p>
              <h2 className="font-podium text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-[0.95]">
                Shop by Category
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((cat, i) => {
                const img = categoryImages[cat.slug];
                const gradient = categoryGradients[cat.slug] || "from-black/70 via-black/40 to-transparent";
                return (
                  <Link
                    key={cat.id}
                    href={`/${locale}/products?category=${cat.slug}`}
                    className="group relative h-80 md:h-96 rounded-2xl overflow-hidden border border-white/10"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    {img && (
                      <Image
                        src={img}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-t ${gradient}`} />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <h3 className="font-podium text-white text-2xl md:text-3xl mb-1 uppercase">{cat.name}</h3>
                      <p className="text-white/50 text-sm font-inter">{cat._count.products} products</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="py-20 md:py-28 bg-black/95 border-t border-white/5">
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="font-inter text-xs tracking-[0.3em] text-white/40 uppercase mb-3">Featured</p>
                <h2 className="font-podium text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-[0.95]">
                  Best Sellers
                </h2>
              </div>
              <Link
                href={`/${locale}/products`}
                className="group hidden sm:flex items-center gap-1.5 border border-white/30 px-5 py-2.5 text-[10px] tracking-widest text-white uppercase transition-all hover:border-white/60 hover:bg-white/10 font-inter"
              >
                VIEW ALL
                <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <ProductCard product={product} locale={locale} />
                </div>
              ))}
            </div>
            <div className="text-center mt-10 sm:hidden">
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center gap-1.5 border border-white/30 px-5 py-2.5 text-[10px] tracking-widest text-white uppercase hover:border-white/60 font-inter"
              >
                VIEW ALL <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
