import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, ArrowUpRight } from "lucide-react";
import { getCart } from "@/lib/cart";

export default function Header() {
  const pathname = useLocation().pathname;
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  if (pathname.startsWith("/admin")) return null;

  useEffect(() => {
    const update = () => setItemCount(getCart().reduce((s, i) => s + i.quantity, 0));
    update();
    window.addEventListener("storage", update);
    window.addEventListener("cart-update", update);
    return () => { window.removeEventListener("storage", update); window.removeEventListener("cart-update", update); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/10" : "bg-transparent"}`}>
        <div className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16 lg:py-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center border border-secondary/50 bg-secondary/10">
              <span className="font-podium text-xs text-secondary tracking-tight">SB</span>
            </div>
            <div className="relative h-7 overflow-hidden">
              <span className={`absolute top-0 left-0 font-podium text-xl sm:text-2xl font-bold uppercase tracking-wider text-white transition-all duration-500 ${scrolled ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}>SB</span>
              <span className={`absolute top-0 left-0 font-podium text-xl sm:text-2xl font-bold uppercase tracking-wider text-white transition-all duration-500 ${scrolled ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>Style Bladi</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link key={link.href} to={link.href} className={`font-inter text-sm tracking-widest uppercase transition-colors ${pathname === link.href ? "text-white" : "text-white/60 hover:text-white"}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative p-2 text-white/70 hover:text-white transition-colors" aria-label="Cart">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center px-1 text-[9px] font-bold text-white bg-secondary rounded-full">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            <Link to="/products" className="hidden sm:flex items-center gap-1.5 border border-white/30 px-4 py-2 text-[10px] tracking-widest text-white uppercase transition-all hover:border-white/60 hover:bg-white/10">
              SHOP NOW
              <ArrowUpRight className="h-3 w-3" />
            </Link>

            <button className="md:hidden p-2 text-white/70 hover:text-white" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenu && (
        <div className="fixed inset-0 z-40 flex flex-col bg-black/95 backdrop-blur-sm px-6 py-5 animate-fade-in">
          <div className="flex items-center justify-between py-5">
            <Link to="/" className="font-podium text-2xl font-bold uppercase tracking-wider text-white">Style Bladi</Link>
            <button onClick={() => setMobileMenu(false)}><X className="h-6 w-6 text-white" /></button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-8">
            {links.map((link, i) => (
              <Link key={link.href} to={link.href} className="font-podium text-4xl uppercase text-white transition-all sm:text-5xl hover:text-white/70" onClick={() => setMobileMenu(false)}>
                {link.label}
              </Link>
            ))}
            <Link to="/products" className="flex items-center gap-2 border border-white/30 px-6 py-3 text-xs tracking-widest text-white uppercase" onClick={() => setMobileMenu(false)}>
              SHOP NOW <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
