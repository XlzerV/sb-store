import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-black/50 border-t border-white/5 py-16 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link to="/" className="font-podium text-2xl font-bold uppercase tracking-wider text-white">VANGUARD</Link>
          <p className="mt-4 text-sm text-white/40 max-w-md leading-relaxed">
            Premium streetwear crafted in Algeria. Every piece tells a story of urban culture and contemporary design.
          </p>
        </div>
        <div>
          <h4 className="text-xs tracking-widest text-white/60 uppercase mb-4">Quick Links</h4>
          <div className="flex flex-col gap-2">
            <Link to="/products" className="text-sm text-white/40 hover:text-white transition-colors">Shop</Link>
            <Link to="/cart" className="text-sm text-white/40 hover:text-white transition-colors">Cart</Link>
          </div>
        </div>
        <div>
          <h4 className="text-xs tracking-widest text-white/60 uppercase mb-4">Contact</h4>
          <p className="text-sm text-white/40">+213 779 95 39 35</p>
          <p className="text-sm text-white/40 mt-1">sam.star.free@gmail.com</p>
          <p className="text-sm text-white/40 mt-1">Algeria</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/30">&copy; 2025 VANGUARD. All rights reserved.</p>
      </div>
    </footer>
  );
}
