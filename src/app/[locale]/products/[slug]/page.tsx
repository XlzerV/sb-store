import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import AddToCartButton from "@/components/product/AddToCartButton";

async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        sizes: true,
        category: true,
      },
    });
    if (product && !product.inStock) return null;
    return product;
  } catch {
    return null;
  }
}

async function getRelatedProducts(categoryId: string, productId: string) {
  try {
    return await prisma.product.findMany({
      where: { categoryId, id: { not: productId }, inStock: true },
      include: { images: { take: 1, orderBy: { order: "asc" } }, sizes: true },
      take: 4,
    });
  } catch {
    return [];
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "product" });
  const product = await getProduct(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);
  const hasSale = product.salePrice && product.salePrice < product.price;

  return (
    <div className="container py-8 md:py-14">
      <div className="grid md:grid-cols-2 gap-8 md:gap-14">
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-bg-muted border border-border">
            <img
              src={product.images[0]?.url || "/images/placeholder.svg"}
              alt={product.images[0]?.alt || product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.alt || ""}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-transparent hover:border-secondary cursor-pointer transition-colors"
                />
              ))}
            </div>
          )}
        </div>

        <div className="md:sticky md:top-24 md:self-start">
          <p className="text-caption text-text-muted mb-2">{product.category.name}</p>
          <h1 className="text-display-sm text-text mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            {hasSale ? (
              <>
                <span className="text-display-sm text-secondary font-bold">
                  {formatPrice(product.salePrice!)}
                </span>
                <span className="text-heading-md text-text-subtle line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-display-sm text-text font-bold">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="text-text-muted text-body-sm leading-relaxed mb-8">{product.description}</p>

          <div className="border-t border-border pt-6">
            <AddToCartButton product={product} locale={locale} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 md:mt-24">
          <h2 className="text-heading-lg text-text mb-6">{t("related")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((r) => (
              <a
                key={r.id}
                href={`/${locale}/products/${r.slug}`}
                className="group card card-hover"
              >
                <div className="aspect-square bg-bg-muted overflow-hidden rounded-t-xl">
                  <img
                    src={r.images[0]?.url || "/images/placeholder.svg"}
                    alt={r.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <p className="text-body-sm font-medium text-text group-hover:text-secondary transition-colors line-clamp-1">{r.name}</p>
                  <p className="text-secondary font-semibold text-body-sm mt-1">{formatPrice(r.price)}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
