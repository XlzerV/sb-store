import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowUpRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

async function getProducts(searchParams: { category?: string; search?: string }) {
  try {
    const where: any = {};
    if (searchParams.category) {
      const cat = await prisma.category.findUnique({ where: { slug: searchParams.category } });
      if (cat) where.categoryId = cat.id;
    }
    if (searchParams.search) {
      where.name = { contains: searchParams.search, mode: "insensitive" };
    }
    return await prisma.product.findMany({
      where,
      include: { images: { orderBy: { order: "asc" }, take: 1 }, sizes: true, category: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany();
  } catch {
    return [];
  }
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "nav" });
  const products = await getProducts(sp);
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-black pt-28 pb-20">
      <div className="px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-inter text-xs tracking-[0.3em] text-white/40 uppercase mb-3">Catalog</p>
            <h1 className="font-podium text-5xl sm:text-6xl lg:text-7xl text-white uppercase leading-[0.95]">
              Products
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href={`/${locale}/products`}
            className={`font-inter text-xs tracking-widest uppercase px-5 py-2.5 border transition-all ${
              !sp.category
                ? "bg-white text-black border-white"
                : "text-white/60 border-white/20 hover:text-white hover:border-white/40"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${locale}/products?category=${cat.slug}`}
              className={`font-inter text-xs tracking-widest uppercase px-5 py-2.5 border transition-all ${
                sp.category === cat.slug
                  ? "bg-white text-black border-white"
                  : "text-white/60 border-white/20 hover:text-white hover:border-white/40"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-white/40 font-inter text-lg">No products found</p>
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center gap-1.5 mt-4 border border-white/30 px-5 py-2.5 text-[10px] tracking-widest text-white uppercase hover:border-white/60 font-inter"
            >
              VIEW ALL <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <ProductCard product={product} locale={locale} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
