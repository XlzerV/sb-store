import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<{ user: any }>("/auth/me").then((d) => { if (d.user?.role === "ADMIN") navigate("/admin"); }).catch(() => {});
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post<{ user: any }>("/auth/login", { email, password });
      if (data.user?.role !== "ADMIN") { toast.error("Not authorized"); return; }
      toast.success("Welcome back");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form onSubmit={handleSubmit} className="w-full max-w-sm px-6 space-y-6">
        <div className="text-center">
          <h1 className="flex items-center justify-center gap-3 font-podium text-3xl text-white uppercase tracking-wider"><img src="/sb-logo.jpg" alt="SB" className="h-10 w-10 rounded object-cover" /> SB</h1>
          <p className="text-sm text-white/40 mt-2">Admin Access</p>
        </div>
        <input className="input-field bg-white/5 border-white/10 text-white placeholder-white/30" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input-field bg-white/5 border-white/10 text-white placeholder-white/30" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading} className="btn-secondary w-full">{loading ? "Signing in..." : "Sign In"}</button>
      </form>
    </div>
  );
}
