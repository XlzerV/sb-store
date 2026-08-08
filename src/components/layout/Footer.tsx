import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram, ArrowUpRight } from "lucide-react";

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  return (
    <footer className="bg-black border-t border-white/10" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="px-6 sm:px-10 lg:px-16 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-10">
          <div className="md:col-span-2">
            <Link href={`/${locale}`} className="font-podium text-2xl font-bold uppercase tracking-wider text-white">
              SB-STORE
            </Link>
            <p className="mt-4 text-white/50 text-sm font-inter leading-relaxed max-w-sm">
              Premium T-shirts crafted in Algeria. Bold design. Uncompromising quality. Delivered to your door.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white" aria-label="Facebook">
                <Facebook size={15} />
              </a>
              <a href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white" aria-label="Instagram">
                <Instagram size={15} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-inter text-xs tracking-widest text-white/40 uppercase mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { href: `/${locale}`, label: nav("home") },
                { href: `/${locale}/products`, label: nav("products") },
                { href: `/${locale}/about`, label: "About" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1 text-white/60 hover:text-white text-sm font-inter transition-colors"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-inter text-xs tracking-widest text-white/40 uppercase mb-5">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-white/60 font-inter">
                <Phone size={14} className="shrink-0 text-white/40" /> +213 779 95 39 35
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60 font-inter">
                <Mail size={14} className="shrink-0 text-white/40" /> sam.star.free@gmail.com
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60 font-inter">
                <MapPin size={14} className="shrink-0 text-white/40" /> Algiers, Algeria
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 font-inter">
            &copy; {new Date().getFullYear()} SB-Store. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
