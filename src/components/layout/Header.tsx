"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Menu, X, Globe, ArrowUpRight } from "lucide-react";
import { useCart } from "@/lib/CartContext";

const languages = [
  { code: "en", label: "EN", dir: "ltr" },
  { code: "fr", label: "FR", dir: "ltr" },
  { code: "ar", label: "AR", dir: "rtl" },
];

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/products`, label: t("products") },
    { href: `/${locale}/about`, label: "Studio" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16 lg:py-6">
          <Link
            href={`/${locale}`}
            className="font-podium text-xl sm:text-2xl font-bold uppercase tracking-wider text-white"
          >
            SB-STORE
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-inter text-sm tracking-widest uppercase transition-colors ${
                  pathname === link.href ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/cart`}
              className="relative p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center px-1 text-[9px] font-bold text-white bg-secondary rounded-full">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            <div className="hidden md:flex items-center gap-1 border border-white/20 rounded-full px-3 py-1.5">
              {languages.map((lang) => (
                <Link
                  key={lang.code}
                  href={`/${lang.code}`}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                    lang.code === locale ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  {lang.label}
                </Link>
              ))}
            </div>

            <Link
              href={`/${locale}/products`}
              className="hidden sm:flex items-center gap-1.5 border border-white/30 px-4 py-2 text-[10px] tracking-widest text-white uppercase transition-all hover:border-white/60 hover:bg-white/10"
            >
              SHOP NOW
              <ArrowUpRight className="h-3 w-3" />
            </Link>

            <button
              className="md:hidden p-2 text-white/70 hover:text-white"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label={mobileMenu ? "Close menu" : "Open menu"}
            >
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenu && (
        <div className="fixed inset-0 z-40 flex flex-col bg-black/95 backdrop-blur-sm px-6 py-5 sm:px-10 lg:px-16 animate-fade-in">
          <div className="flex items-center justify-between py-5">
            <Link href={`/${locale}`} className="font-podium text-2xl font-bold uppercase tracking-wider text-white">
              SB-STORE
            </Link>
            <button onClick={() => setMobileMenu(false)}>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-8">
            {links.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-podium text-4xl uppercase text-white transition-all duration-500 sm:text-5xl hover:text-white/70"
                style={{
                  animationDelay: `${i * 80}ms`,
                }}
                onClick={() => setMobileMenu(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/${locale}/products`}
              className="flex items-center gap-2 border border-white/30 px-6 py-3 text-xs tracking-widest text-white uppercase transition-all hover:border-white/60 hover:bg-white/10"
              onClick={() => setMobileMenu(false)}
            >
              SHOP NOW
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
