import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  CONFIRMED: "bg-blue-500/10 text-blue-400",
  SHIPPED: "bg-purple-500/10 text-purple-400",
  DELIVERED: "bg-green-500/10 text-green-400",
  CANCELLED: "bg-red-500/10 text-red-400",
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get<{ user: any }>("/auth/me").then((d) => { if (d.user?.role !== "ADMIN") navigate("/admin/login"); setUser(d.user); }).catch(() => navigate("/admin/login"));
    fetchOrders();
  }, [navigate, filter]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    navigate("/admin/login");
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : "";
      const data = await api.get<any>(`/admin/orders${params}`);
      setOrders(data.orders || []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      fetchOrders();
    } catch { alert("Failed to update"); }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <aside className="fixed top-0 left-0 h-full w-56 bg-[#0a0a0a] border-r border-white/10 p-6 hidden md:flex flex-col">
        <h2 className="font-podium text-lg text-white uppercase tracking-wider mb-8">VANGUARD</h2>
        <nav className="flex flex-col gap-1">
          <Link to="/admin" className="px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg">Dashboard</Link>
          <Link to="/admin/orders" className="px-4 py-2 text-sm text-white bg-white/5 rounded-lg">Orders</Link>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-white/30 hover:text-white mt-auto">
          <LogOut size={14} /> Logout
        </button>
      </aside>
      <div className="md:ml-56">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a] md:hidden">
          <Link to="/admin" className="font-podium text-sm uppercase text-white">VANGUARD</Link>
          <div className="flex items-center gap-3">
            <Link to="/admin/orders" className="px-3 py-1 text-xs text-white/60 border border-white/10 rounded-full">Orders</Link>
            <button onClick={handleLogout} className="text-xs text-white/30 hover:text-white"><LogOut size={14} /></button>
          </div>
        </header>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-podium text-2xl text-white uppercase">Orders</h1>
            <div className="flex flex-wrap gap-2">
              {["", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 text-xs rounded-full border transition-all ${filter === s ? "bg-secondary text-white border-secondary" : "border-white/10 text-white/40 hover:text-white"}`}>
                  {s || "ALL"}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-lg" />)}</div>
          ) : orders.length === 0 ? (
            <p className="text-white/30 text-center py-12">No orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-white/30 text-xs uppercase tracking-wider border-b border-white/10">
                  <th className="pb-3 pr-4">Order</th><th className="pb-3 pr-4">Customer</th><th className="pb-3 pr-4">Total</th><th className="pb-3 pr-4">Status</th><th className="pb-3 pr-4">Date</th><th className="pb-3"></th>
                </tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-white/5">
                      <td className="py-3 pr-4 text-white/70 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                      <td className="py-3 pr-4">
                        <p className="text-white/80">{o.phone}</p>
                        <p className="text-white/30 text-xs">{o.wilaya?.name}, {o.commune?.name}</p>
                      </td>
                      <td className="py-3 pr-4 text-white font-medium">{formatPrice(o.grandTotal)}</td>
                      <td className="py-3 pr-4">
                        <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className={`text-xs px-2 py-1 rounded-full border-none bg-transparent cursor-pointer ${statusColors[o.status] || "text-white/40"}`}>
                          {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-3 pr-4 text-white/30 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">{o.items?.length || 0} items</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
