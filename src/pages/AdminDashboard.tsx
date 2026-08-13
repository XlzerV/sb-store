import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DollarSign, ShoppingBag, Clock, Package, LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

interface DashboardData {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  recentOrders: any[];
}

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get<{ user: any }>("/auth/me").then((d) => {
      if (d.user?.role !== "ADMIN") { navigate("/admin/login"); return; }
      setUser(d.user);
    }).catch(() => navigate("/admin/login"));
    api.get<DashboardData>("/admin/dashboard").then(setData).catch(() => setError(true));
  }, [navigate]);

  const [error, setError] = useState(false);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    navigate("/admin/login");
  };

  if (error) return <div className="min-h-screen bg-black flex items-center justify-center"><p className="text-red-400">Failed to load dashboard. <button onClick={() => window.location.reload()} className="underline">Retry</button></p></div>;
  if (!data) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-pulse text-white/30">Loading...</div></div>;

  const stats = [
    { icon: DollarSign, label: "Total Sales", value: formatPrice(data.totalSales), color: "text-green-400" },
    { icon: ShoppingBag, label: "Orders", value: data.totalOrders.toString(), color: "text-blue-400" },
    { icon: Clock, label: "Pending", value: data.pendingOrders.toString(), color: "text-yellow-400" },
    { icon: Package, label: "Products", value: data.totalProducts.toString(), color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <aside className="fixed top-0 left-0 h-full w-56 bg-[#0a0a0a] border-r border-white/10 p-6 hidden md:flex flex-col">
        <h2 className="flex items-center gap-2 font-podium text-lg text-white uppercase tracking-wider mb-8"><img src="/sb-logo.jpg" alt="SB" className="h-7 w-7 rounded object-cover" /> SB</h2>
        <nav className="flex flex-col gap-1">
          {adminNav.map((item) => (
            <Link key={item.href} to={item.href} className={`px-4 py-2 text-sm rounded-lg transition-colors ${item.href === "/admin" ? "text-white bg-white/5" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-white/30 hover:text-white mt-auto">
          <LogOut size={14} /> Logout
        </button>
      </aside>

      <div className="md:ml-56">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a]">
          <div className="flex md:hidden items-center gap-2">
            <Link to="/admin" className="flex items-center gap-2 font-podium text-sm uppercase text-white"><img src="/sb-logo.jpg" alt="SB" className="h-6 w-6 rounded object-cover" /> SB</Link>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            {adminNav.map((item) => (
              <Link key={item.href} to={item.href} className="px-3 py-1 text-xs text-white/60">{item.label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/40">{user?.email}</span>
            <button onClick={handleLogout} className="text-xs text-white/30 hover:text-white md:hidden"><LogOut size={14} /></button>
          </div>
        </header>

        <div className="p-6">
          <h1 className="font-podium text-2xl text-white uppercase mb-6">Dashboard</h1>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#0f1320] border border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <stat.icon size={18} className={stat.color} />
                  <span className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0f1320] border border-white/10 rounded-xl p-6">
            <h2 className="font-inter text-sm font-semibold text-white mb-4">Recent Orders</h2>
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-white/30">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-white/30 text-xs uppercase tracking-wider">
                      <th className="pb-3 pr-4">Order</th>
                      <th className="pb-3 pr-4">Items</th>
                      <th className="pb-3 pr-4">Total</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order: any) => (
                      <tr key={order.id} className="border-t border-white/5">
                        <td className="py-3 pr-4 text-white/70">#{order.id.slice(0, 8)}</td>
                        <td className="py-3 pr-4 text-white/50">{order.items?.length || 0} items</td>
                        <td className="py-3 pr-4 text-white font-medium">{formatPrice(order.grandTotal)}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${order.status === "PENDING" ? "bg-yellow-500/10 text-yellow-400" : order.status === "CONFIRMED" ? "bg-blue-500/10 text-blue-400" : order.status === "DELIVERED" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-white/30 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
