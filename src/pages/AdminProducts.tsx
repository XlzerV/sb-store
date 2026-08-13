import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, LogOut, X, Check, Upload } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice, slugify } from "@/lib/utils";
import toast from "react-hot-toast";

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL", "3XL"];

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get<{ user: any }>("/auth/me").then((d) => { if (d.user?.role !== "ADMIN") navigate("/admin/login"); }).catch(() => navigate("/admin/login"));
    api.get<any[]>("/admin/products").then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = async () => { await api.post("/auth/logout"); navigate("/admin/login"); };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name, slug: p.slug, price: p.price.toString(), salePrice: p.salePrice?.toString() || "",
      description: p.description || "", inStock: p.inStock, featured: p.featured ?? false,
      categoryId: p.categoryId, sizes: p.sizes?.map((s: any) => s.size) || [],
      images: p.images || [],
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const toggleEditSize = (s: string) => {
    setEditForm((f: any) => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x: string) => x !== s) : [...f.sizes, s] }));
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await api.upload<{ url: string }>("/upload", file);
      setEditForm((f: any) => ({ ...f, images: [...f.images, { url: data.url, order: f.images.length }] }));
      toast.success("Image uploaded");
    } catch (err: any) { toast.error(err.message || "Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const saveEdit = async (id: string) => {
    try {
      await api.put(`/admin/products/${id}`, {
        name: editForm.name,
        slug: editForm.slug || slugify(editForm.name),
        description: editForm.description || "",
        price: parseFloat(editForm.price),
        salePrice: editForm.salePrice ? parseFloat(editForm.salePrice) : null,
        categoryId: editForm.categoryId,
        inStock: editForm.inStock,
        featured: editForm.featured ?? false,
        sizes: editForm.sizes || [],
        images: (editForm.images || []).map((i: any) => i.url || i),
      });
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...editForm, price: parseFloat(editForm.price) } : p));
      setEditingId(null);
      toast.success("Product updated");
    } catch (err: any) { toast.error(err.message || "Failed to update"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await api.delete<{ ok: boolean; hidden?: boolean }>(`/admin/products/${id}`);
      if (res.hidden) {
        setProducts((p) => p.map((x) => x.id === id ? { ...x, inStock: false } : x));
        toast.success("Product hidden (has existing orders)");
      } else {
        setProducts((p) => p.filter((x) => x.id !== id));
        toast.success("Product deleted");
      }
    } catch (err: any) { toast.error(err.message || "Failed to delete"); }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <aside className="fixed top-0 left-0 h-full w-56 bg-[#0a0a0a] border-r border-white/10 p-6 hidden md:flex flex-col">
        <h2 className="flex items-center gap-2 font-podium text-lg text-white uppercase tracking-wider mb-8"><img src="/sb-logo.jpg" alt="SB" className="h-7 w-7 rounded object-cover" /> SB</h2>
        <nav className="flex flex-col gap-1">
          <Link to="/admin" className="px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg">Dashboard</Link>
          <Link to="/admin/products" className="px-4 py-2 text-sm text-white bg-white/5 rounded-lg">Products</Link>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-white/30 hover:text-white mt-auto"><LogOut size={14} /> Logout</button>
      </aside>
      <div className="md:ml-56">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a] md:hidden">
          <Link to="/admin" className="flex items-center gap-2 font-podium text-sm uppercase text-white"><img src="/sb-logo.jpg" alt="SB" className="h-6 w-6 rounded object-cover" /> SB</Link>
          <div className="flex items-center gap-3">
            <Link to="/admin/products" className="px-3 py-1 text-xs text-white/60 border border-white/10 rounded-full">Products</Link>
            <button onClick={handleLogout} className="text-xs text-white/30 hover:text-white"><LogOut size={14} /></button>
          </div>
        </header>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-podium text-2xl text-white uppercase">Products</h1>
            <Link to="/admin/products/new" className="flex items-center gap-2 bg-secondary text-white px-4 py-2 text-sm rounded-lg hover:bg-white hover:text-black"><Plus size={16} /> Add Product</Link>
          </div>
        {loading ? (
          <div className="animate-pulse space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-lg" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-white/30 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="pb-3 pr-4">Product</th><th className="pb-3 pr-4">Price</th><th className="pb-3 pr-4">Sizes</th><th className="pb-3 pr-4">Stock</th><th className="pb-3"></th>
              </tr></thead>
              <tbody>
                {products.map((p) => (
                  editingId === p.id ? (
                    <tr key={p.id} className="border-b border-white/5 bg-white/5">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded overflow-hidden bg-white/5 flex-shrink-0">
                            <img src={editForm.images?.[0]?.url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 cursor-pointer">
                              <Upload size={12} className="text-white" />
                              <input type="file" accept="image/*" onChange={handleEditImageUpload} className="hidden" disabled={uploading} />
                            </label>
                          </div>
                          <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value, slug: slugify(e.target.value) })} className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded text-sm w-40" />
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded text-sm w-24" min="0" />
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {SIZE_OPTIONS.map((s) => (
                            <button key={s} type="button" onClick={() => toggleEditSize(s)} className={`px-2 py-0.5 text-xs rounded border ${editForm.sizes?.includes(s) ? "border-secondary bg-secondary/20 text-white" : "border-white/20 text-white/50"}`}>{s}</button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <select value={editForm.inStock ? "true" : "false"} onChange={(e) => setEditForm({ ...editForm, inStock: e.target.value === "true" })} className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded text-xs">
                          <option value="true">In Stock</option>
                          <option value="false">Out</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => saveEdit(p.id)} className="text-green-400 hover:text-green-300"><Check size={16} /></button>
                          <button onClick={cancelEdit} className="text-red-400/60 hover:text-red-400"><X size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={p.id} className="border-b border-white/5">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0]?.url || "/placeholder.svg"} alt="" className="w-10 h-10 object-cover rounded bg-white/5" />
                          <span className="text-white/80">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-white/60">{formatPrice(p.price)}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {p.sizes?.map((s: any) => <span key={s.size} className="px-2 py-0.5 text-[10px] border border-white/10 text-white/50 rounded">{s.size}</span>)}
                        </div>
                      </td>
                      <td className="py-3 pr-4">{p.inStock ? <span className="text-green-400 text-xs">In Stock</span> : <span className="text-red-400 text-xs">Out</span>}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(p)} className="text-xs text-blue-400/60 hover:text-blue-400">Edit</button>
                          <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400/60 hover:text-red-400">Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
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
