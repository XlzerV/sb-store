"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

interface SizeEntry { size: string; stock: number }

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit modal
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editSalePrice, setEditSalePrice] = useState("");
  const [editSizes, setEditSizes] = useState<SizeEntry[]>([]);
  const [editImages, setEditImages] = useState("");
  const [editUploading, setEditUploading] = useState(false);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", description: "", price: "", salePrice: "", categoryId: "" });
  const [addSizes, setAddSizes] = useState<SizeEntry[]>([{ size: "S", stock: 0 }, { size: "M", stock: 0 }, { size: "L", stock: 0 }, { size: "XL", stock: 0 }, { size: "XXL", stock: 0 }, { size: "XXXL", stock: 0 }]);
  const [addImages, setAddImages] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => {
        if (res.status === 401) { router.push("/admin/login"); return null; }
        return res.json();
      })
      .then((data) => {
        if (data) setProducts(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(r => r.ok ? r.json() : [])
      .then(cats => setCategories(cats || []))
      .catch(() => {});
  }, []);

  const openEdit = (product: any) => {
    setEditProduct(product);
    setEditName(product.name || "");
    setEditPrice(product.price.toString());
    setEditSalePrice(product.salePrice?.toString() || "");
    setEditSizes(
      ["S", "M", "L", "XL", "XXL", "XXXL"].map(size => {
        const existing = product.sizes?.find((s: any) => s.size === size);
        return { size, stock: existing?.stock ?? 0 };
      })
    );
    setEditImages((product.images || []).map((i: any) => i.url).join("\n"));
  };

  const saveEdit = async () => {
    if (!editProduct) return;
    setSaving(true);
    try {
      const images = editImages ? editImages.split("\n").map(u => u.trim()).filter(Boolean) : [];
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editProduct.id,
          name: editName,
          price: parseFloat(editPrice),
          salePrice: editSalePrice ? parseFloat(editSalePrice) : null,
          images,
          sizes: editSizes,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      setEditProduct(null);
      toast.success("Product updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.price || !addForm.categoryId) {
      toast.error("Please fill name, price, and category");
      return;
    }
    setSaving(true);
    try {
      const images = addImages ? addImages.split("\n").map(u => u.trim()).filter(Boolean) : [];
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          description: addForm.description,
          price: parseFloat(addForm.price),
          salePrice: addForm.salePrice ? parseFloat(addForm.salePrice) : null,
          categoryId: addForm.categoryId,
          sizes: addSizes.filter(s => s.stock > 0),
          images,
        }),
      });
      if (!res.ok) throw new Error("Failed to create product");
      const created = await res.json();
      setProducts((prev) => [created, ...prev]);
      setShowAdd(false);
      setAddForm({ name: "", description: "", price: "", salePrice: "", categoryId: "" });
      setAddImages("");
      setAddSizes([{ size: "S", stock: 0 }, { size: "M", stock: 0 }, { size: "L", stock: 0 }, { size: "XL", stock: 0 }, { size: "XXL", stock: 0 }, { size: "XXXL", stock: 0 }]);
      toast.success("Product created");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-bg-elevated border-b border-border">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SB-Store" className="h-7 w-auto" />
            <span className="font-semibold text-text">Admin</span>
          </div>
          <nav className="flex items-center gap-1">
            {adminNav.map(({ href, label }) => (
              <a key={href} href={href} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${href === "/admin/products" ? "bg-bg-muted text-text" : "text-text-muted hover:text-text hover:bg-bg-muted"}`}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-heading-md text-text">Products</h1>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm flex items-center gap-2">
            <Plus size={16} /> Add Product
          </button>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3.5 text-caption text-text-subtle">Product</th>
                <th className="text-left px-4 py-3.5 text-caption text-text-subtle">Category</th>
                <th className="text-left px-4 py-3.5 text-caption text-text-subtle">Price</th>
                <th className="text-left px-4 py-3.5 text-caption text-text-subtle">Sizes</th>
                <th className="text-left px-4 py-3.5 text-caption text-text-subtle">Sold</th>
                <th className="text-right px-4 py-3.5 text-caption text-text-subtle">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-bg-muted overflow-hidden border border-border">
                        <img src={product.images?.[0]?.url || "/images/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-body-sm font-medium text-text">{product.name}</p>
                        <p className="text-body-xs text-text-muted">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-body-sm text-text-muted">{product.category?.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="text-body-sm font-medium text-text">{formatPrice(product.price)}</span>
                    {product.salePrice && <span className="text-body-xs text-text-subtle line-through ml-1">{formatPrice(product.salePrice)}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {product.sizes?.map((s: any) => <span key={s.id} className="badge badge-muted">{s.size}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-body-sm text-text-muted">{product._count?.orderItems || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(product)} className="text-text-subtle hover:text-secondary p-1.5 transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id} className="text-text-subtle hover:text-error p-1.5 transition-colors disabled:opacity-30"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <div className="text-center py-16 text-text-muted text-body-sm">No products yet</div>}
        </div>
      </div>

      {/* Edit Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center overflow-y-auto py-8">
          <div className="card p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-text">Edit Product</h2>
              <button onClick={() => setEditProduct(null)} className="text-text-subtle hover:text-text transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-body-xs font-medium text-text-muted mb-1.5">Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-xs font-medium text-text-muted mb-1.5">Price (DZD)</label>
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-body-xs font-medium text-text-muted mb-1.5">Sale Price</label>
                  <input type="number" value={editSalePrice} onChange={(e) => setEditSalePrice(e.target.value)} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-body-xs font-medium text-text-muted mb-1.5">Sizes (stock &gt; 0 will be included)</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {editSizes.map((s, i) => (
                    <div key={s.size}>
                      <label className="text-caption text-text-muted block mb-0.5">{s.size}</label>
                      <input type="number" min="0" value={s.stock} onChange={(e) => { const next = [...editSizes]; next[i] = { ...s, stock: parseInt(e.target.value) || 0 }; setEditSizes(next); }} className="input text-center" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-body-xs font-medium text-text-muted mb-1.5">Images</label>
                <div className="flex gap-2 mb-2">
                  <button type="button" disabled={editUploading} onClick={async () => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.multiple = true;
                    input.onchange = async () => {
                      if (!input.files?.length) return;
                      setEditUploading(true);
                      const urls: string[] = [];
                      for (const f of Array.from(input.files)) {
                        const fd = new FormData();
                        fd.append("file", f);
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (data.url) urls.push(data.url);
                      }
                      setEditImages((prev) => (prev ? prev + "\n" : "") + urls.join("\n"));
                      setEditUploading(false);
                    };
                    input.click();
                  }} className="btn btn-secondary btn-sm">
                    {editUploading ? "Uploading..." : "Upload Images"}
                  </button>
                </div>
                <textarea value={editImages} onChange={(e) => setEditImages(e.target.value)} className="input" rows={3} placeholder="Image URLs, one per line" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditProduct(null)} className="btn btn-ghost btn-md flex-1">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="btn btn-primary btn-md flex-1">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center overflow-y-auto py-8">
          <div className="card p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-text">Add Product</h2>
              <button onClick={() => setShowAdd(false)} className="text-text-subtle hover:text-text transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-body-xs font-medium text-text-muted mb-1.5">Name *</label>
                <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-body-xs font-medium text-text-muted mb-1.5">Description</label>
                <textarea value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} className="input" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-xs font-medium text-text-muted mb-1.5">Price (DZD) *</label>
                  <input type="number" value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="block text-body-xs font-medium text-text-muted mb-1.5">Sale Price</label>
                  <input type="number" value={addForm.salePrice} onChange={(e) => setAddForm({ ...addForm, salePrice: e.target.value })} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-body-xs font-medium text-text-muted mb-1.5">Category *</label>
                <select value={addForm.categoryId} onChange={(e) => setAddForm({ ...addForm, categoryId: e.target.value })} className="input" required>
                  <option value="">Select category</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-body-xs font-medium text-text-muted mb-1.5">Sizes (stock &gt; 0 will be included)</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {addSizes.map((s, i) => (
                    <div key={s.size}>
                      <label className="text-caption text-text-muted block mb-0.5">{s.size}</label>
                      <input type="number" min="0" value={s.stock} onChange={(e) => { const newSizes = [...addSizes]; newSizes[i] = { ...s, stock: parseInt(e.target.value) || 0 }; setAddSizes(newSizes); }} className="input text-center" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-body-xs font-medium text-text-muted mb-1.5">Images</label>
                <div className="flex gap-2 mb-2">
                  <button type="button" disabled={uploading} onClick={async () => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.multiple = true;
                    input.onchange = async () => {
                      if (!input.files?.length) return;
                      setUploading(true);
                      const urls: string[] = [];
                      for (const f of Array.from(input.files)) {
                        const fd = new FormData();
                        fd.append("file", f);
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (data.url) urls.push(data.url);
                      }
                      setAddImages((prev) => (prev ? prev + "\n" : "") + urls.join("\n"));
                      setUploading(false);
                    };
                    input.click();
                  }} className="btn btn-secondary btn-sm">
                    {uploading ? "Uploading..." : "Upload Images"}
                  </button>
                </div>
                <textarea value={addImages} onChange={(e) => setAddImages(e.target.value)} className="input" rows={3} placeholder="Or paste image URLs, one per line" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="btn btn-ghost btn-md flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-md flex-1">{saving ? "Creating..." : "Create Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}