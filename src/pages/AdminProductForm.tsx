import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, LogOut, Plus, X, Upload } from "lucide-react";
import { api } from "@/lib/api";
import { slugify } from "@/lib/utils";

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", price: "", salePrice: "",
    categoryId: "", inStock: true, featured: false,
  });
  const [sizes, setSizes] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL", "3XL"];

  useEffect(() => {
    api.get<{ user: any }>("/auth/me").then((d) => { if (d.user?.role !== "ADMIN") navigate("/admin/login"); setUser(d.user); }).catch(() => navigate("/admin/login"));
    api.get<any[]>("/categories").then(setCategories).catch(() => {});
    if (isEdit) {
      api.get<any>(`/admin/products/${id}`).then((p) => {
        setForm({
          name: p.name, slug: p.slug, description: p.description || "",
          price: p.price.toString(), salePrice: p.salePrice?.toString() || "",
          categoryId: p.categoryId, inStock: p.inStock, featured: p.featured,
        });
        setSizes(p.sizes?.map((s: any) => s.size) || []);
        setImages(p.images?.map((i: any) => i.url) || []);
      }).catch(() => { toast.error("Failed to load product"); navigate("/admin/products"); });
    }
  }, [id, isEdit, navigate]);

  const handleLogout = async () => { await api.post("/auth/logout"); navigate("/admin/login"); };

  const toggleSize = (s: string) => {
    setSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const addImageUrl = () => {
    const url = imageInput.trim();
    if (url && !images.includes(url)) setImages([...images, url]);
    setImageInput("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await api.upload<{ url: string }>("/upload", file);
      setImages((prev) => [...prev, data.url]);
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId) { toast.error("Name, price, and category required"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.price,
        salePrice: form.salePrice || null,
        slug: form.slug || slugify(form.name),
        sizes,
        images,
      };
      if (isEdit) {
        await api.put(`/admin/products/${id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/admin/products", payload);
        toast.success("Product created");
      }
      navigate("/admin/products");
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <aside className="fixed top-0 left-0 h-full w-56 bg-[#0a0a0a] border-r border-white/10 p-6 hidden md:flex flex-col">
        <h2 className="font-podium text-lg text-white uppercase tracking-wider mb-8">VANGUARD</h2>
        <nav className="flex flex-col gap-1">
          <button onClick={() => navigate("/admin")} className="px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg text-left">Dashboard</button>
          <button onClick={() => navigate("/admin/products")} className="px-4 py-2 text-sm text-white bg-white/5 rounded-lg text-left">Products</button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-white/30 hover:text-white mt-auto"><LogOut size={14} /> Logout</button>
      </aside>
      <div className="md:ml-56">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a] md:hidden">
          <button onClick={() => navigate("/admin/products")} className="flex items-center gap-2 text-sm text-white/60"><ArrowLeft size={14} /> Products</button>
          <button onClick={handleLogout} className="text-xs text-white/30 hover:text-white"><LogOut size={14} /></button>
        </header>
        <div className="p-6 max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate("/admin/products")} className="text-white/30 hover:text-white hidden md:block"><ArrowLeft size={20} /></button>
            <h1 className="font-podium text-2xl text-white uppercase">{isEdit ? "Edit Product" : "New Product"}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#0f1320] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-inter text-sm font-semibold text-white">Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 block mb-1">Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} className="input-field bg-white/5 border-white/10 text-white placeholder-white/30 w-full" required />
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field bg-white/5 border-white/10 text-white placeholder-white/30 w-full" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field bg-white/5 border-white/10 text-white placeholder-white/30 w-full" />
              </div>
            </div>

            <div className="bg-[#0f1320] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-inter text-sm font-semibold text-white">Pricing</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 block mb-1">Price (DZD) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field bg-white/5 border-white/10 text-white placeholder-white/30 w-full" required min="0" />
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1">Sale Price (DZD)</label>
                  <input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className="input-field bg-white/5 border-white/10 text-white placeholder-white/30 w-full" min="0" />
                </div>
              </div>
            </div>

            <div className="bg-[#0f1320] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-inter text-sm font-semibold text-white">Category & Status</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-white/40 block mb-1">Category *</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-field bg-white/5 border-white/10 text-white w-full" required>
                    <option value="">Select</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1">Status</label>
                  <select value={form.inStock ? "true" : "false"} onChange={(e) => setForm({ ...form, inStock: e.target.value === "true" })} className="input-field bg-white/5 border-white/10 text-white w-full">
                    <option value="true">In Stock</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1">Featured</label>
                  <select value={form.featured ? "true" : "false"} onChange={(e) => setForm({ ...form, featured: e.target.value === "true" })} className="input-field bg-white/5 border-white/10 text-white w-full">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1320] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-inter text-sm font-semibold text-white">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => toggleSize(s)} className={`px-4 py-2 text-sm rounded-lg border transition-all ${sizes.includes(s) ? "border-secondary bg-secondary/10 text-white" : "border-white/10 text-white/50 hover:text-white hover:border-white/30"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0f1320] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-inter text-sm font-semibold text-white">Images</h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:border-white/30 cursor-pointer transition-all">
                  <Upload size={16} />
                  {uploading ? "Uploading..." : "Upload File"}
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                </label>
                <span className="text-xs text-white/20">or</span>
                <div className="flex items-center gap-2 flex-1">
                  <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())} placeholder="Paste image URL..." className="input-field bg-white/5 border-white/10 text-white placeholder-white/30 flex-1" />
                  <button type="button" onClick={addImageUrl} className="bg-white/10 text-white/70 px-3 py-2 rounded-lg text-sm hover:bg-white/20"><Plus size={16} /></button>
                </div>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((url, i) => (
                    <div key={i} className="relative group aspect-square bg-white/5 rounded-lg overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="bg-secondary text-white px-6 py-3 rounded-lg text-sm hover:bg-white hover:text-black transition-colors disabled:opacity-50">
                {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
              </button>
              <button type="button" onClick={() => navigate("/admin/products")} className="text-sm text-white/30 hover:text-white">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
