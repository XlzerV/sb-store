import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SB-Store | Premium T-Shirts Algeria",
  description:
    "SB-Store - Your premier destination for premium T-shirts in Algeria. Quality fashion, free delivery across all wilayas. أفضل متجر لشراء التيشيرتات الفاخرة في الجزائر.",
  keywords: [
    "T-shirts Algeria",
    "تيشيرتات الجزائر",
    "SB-Store",
    "premium t-shirts",
    "vetements algerie",
    "online shopping algeria",
    "acheter t-shirt algerie",
    "تسوق اون لاين الجزائر",
    "ملابس الجزائر",
    "cash on delivery algeria",
  ],
  openGraph: {
    title: "SB-Store | Premium T-Shirts Algeria",
    description:
      "Premium T-shirts with free delivery across Algeria. Livraison gratuite dans toute l'Algérie.",
    siteName: "SB-Store",
    locale: "fr_DZ",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-invoke-path") || headerList.get("next-url") || "";
  const firstSegment = pathname.split("/")[1] || "";
  const locale = ["en", "fr", "ar"].includes(firstSegment) ? firstSegment : "en";
  const isRtl = locale === "ar";

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sb-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-bg text-text flex flex-col transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
