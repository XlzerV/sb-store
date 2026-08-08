"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, ArrowUpRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) router.replace("/admin");
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast.success("Welcome back!");
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-podium text-3xl text-white uppercase tracking-wider">SB-Store</h1>
          <p className="font-inter text-sm text-white/40 mt-2">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-inter text-sm font-medium text-white/70 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 font-inter focus:outline-none focus:border-white/50 transition-colors"
              placeholder="admin@sb-store.dz"
              required
            />
          </div>
          <div>
            <label className="block font-inter text-sm font-medium text-white/70 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 font-inter focus:outline-none focus:border-white/50 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-white text-black px-6 py-3.5 text-xs tracking-widest uppercase font-inter font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 rounded-xl"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            LOGIN <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
