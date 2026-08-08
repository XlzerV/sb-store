import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/lib/CartContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import ConvexClientProvider from "@/lib/ConvexClientProvider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    title: "SB-Store | Premium T-Shirts Algeria",
    description: t("hero_subtitle"),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "fr" | "ar")) {
    notFound();
  }

  const messages = await getMessages();
  const isRtl = locale === "ar";

  return (
    <>
      <NextIntlClientProvider messages={messages}>
        <ConvexClientProvider>
          <ThemeProvider>
            <CartProvider>
              <Header />
              <main className="flex-1 bg-black">{children}</main>
              <Footer locale={locale} />
            </CartProvider>
            <Toaster
              position={isRtl ? "top-left" : "top-right"}
              toastOptions={{
                duration: 3000,
                style: {
                  fontFamily: "Inter, sans-serif",
                  background: "#1a1a1a",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.1)",
                },
              }}
            />
          </ThemeProvider>
        </ConvexClientProvider>
      </NextIntlClientProvider>
    </>
  );
}
