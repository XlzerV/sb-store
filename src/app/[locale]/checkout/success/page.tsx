import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "checkout" });

  return (
    <div className="container py-24 text-center max-w-lg mx-auto">
      <CheckCircle size={80} className="mx-auto text-success mb-6" />
      <h1 className="text-display-sm text-text mb-4">{t("success_title")}</h1>
      <p className="text-text-muted text-body-lg mb-6">{t("success_message")}</p>

      {sp.order && (
        <div className="bg-bg-muted rounded-2xl p-5 mb-10">
          <p className="text-body-sm text-text-muted">{t("order_number")}</p>
          <p className="text-heading-md font-bold text-text">{sp.order}</p>
        </div>
      )}

      <Link
        href={`/${locale}/products`}
        className="btn btn-secondary btn-md"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
