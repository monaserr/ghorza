import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/products";
import { resolveImage } from "@/lib/asset-map";

export const Route = createFileRoute("/admin/")({
  component: AdminProducts,
});

type FormState = {
  slug: string; name: string; description: string; price: string;
  compare_at_price: string; image_url: string; category: string;
  sizes: string; colors: string; stock: string;
  is_active: boolean; is_featured: boolean; is_new: boolean;
};

const emptyForm: FormState = {
  slug: "", name: "", description: "", price: "", compare_at_price: "",
  image_url: "", category: "unisex", sizes: "S, M, L, XL",
  colors: '[{"name":"Black","hex":"#0a0a0a"}]', stock: "0",
  is_active: true, is_featured: false, is_new: false,
};

function toForm(p: Product): FormState {
  return {
    slug: p.slug, name: p.name, description: p.description ?? "",
    price: String(p.price), compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
    image_url: p.image_url ?? "", category: p.category,
    sizes: p.sizes.join(", "), colors: JSON.stringify(p.colors),
    stock: String(p.stock), is_active: p.is_active, is_featured: p.is_featured, is_new: p.is_new,
  };
}

function AdminProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Product[];
    },
  });

  const startNew = () => { setForm(emptyForm); setEditing("new"); };
  const startEdit = (p: Product) => { setForm(toForm(p)); setEditing(p); };
  const cancel = () => { setEditing(null); setForm(emptyForm); };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("products").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("products").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally { setUploading(false); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedColors;
      try { parsedColors = JSON.parse(form.colors); } catch { throw new Error("Colors must be valid JSON, e.g. [{\"name\":\"Black\",\"hex\":\"#000\"}]"); }
      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        description: form.description || null,
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        image_url: form.image_url || null,
        category: form.category,
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: parsedColors,
        stock: Number(form.stock),
        is_active: form.is_active,
        is_featured: form.is_featured,
        is_new: form.is_new,
      };
      if (editing === "new") {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Product created.");
      } else if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Product updated.");
      }
      cancel();
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product deleted.");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-4xl uppercase tracking-tighter">Products</h1>
        <button onClick={startNew} className="eyebrow bg-obsidian text-paper px-5 py-3 hover:bg-cobalt transition-colors">+ New Product</button>
      </div>

      {editing && (
        <form onSubmit={save} className="border border-obsidian/15 p-6 mb-10 grid gap-4 bg-stone-soft">
          <h2 className="eyebrow">{editing === "new" ? "Create Product" : `Edit ${form.name}`}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Input label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required />
            <Input label="Price" type="number" step="0.01" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
            <Input label="Compare-at Price (optional)" type="number" step="0.01" value={form.compare_at_price} onChange={(v) => setForm({ ...form, compare_at_price: v })} />
            <Input label="Stock" type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} required />
            <div>
              <label className="eyebrow block mb-2">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-obsidian/15 px-3 py-2 bg-paper focus:outline-none focus:border-obsidian">
                <option value="unisex">Unisex</option><option value="men">Men</option><option value="women">Women</option>
              </select>
            </div>
            <Input label="Sizes (comma-separated)" value={form.sizes} onChange={(v) => setForm({ ...form, sizes: v })} />
            <Input label="Colors (JSON)" value={form.colors} onChange={(v) => setForm({ ...form, colors: v })} />
          </div>
          <div>
            <label className="eyebrow block mb-2">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-obsidian/15 px-3 py-2 bg-paper min-h-24 focus:outline-none focus:border-obsidian" />
          </div>
          <div>
            <label className="eyebrow block mb-2">Image</label>
            <div className="flex gap-3 items-center">
              {form.image_url && <img src={resolveImage(form.image_url)} alt="" className="w-16 h-20 object-cover bg-paper" />}
              <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="text-xs" />
              <input type="text" placeholder="or paste URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="flex-1 border border-obsidian/15 px-3 py-2 bg-paper focus:outline-none focus:border-obsidian text-xs" />
            </div>
          </div>
          <div className="flex gap-6 flex-wrap text-xs">
            <Check label="Active" checked={form.is_active} onChange={(v) => setForm({ ...form, is_active: v })} />
            <Check label="Featured" checked={form.is_featured} onChange={(v) => setForm({ ...form, is_featured: v })} />
            <Check label="New" checked={form.is_new} onChange={(v) => setForm({ ...form, is_new: v })} />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="eyebrow bg-obsidian text-paper px-6 py-3 hover:bg-cobalt transition-colors">Save</button>
            <button type="button" onClick={cancel} className="eyebrow border border-obsidian/15 px-6 py-3 hover:bg-obsidian hover:text-paper transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <div className="border border-obsidian/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-obsidian/5 eyebrow">
              <tr><th className="text-left p-3">Image</th><th className="text-left p-3">Name</th><th className="text-left p-3">Price</th><th className="text-left p-3">Stock</th><th className="text-left p-3">Status</th><th className="p-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-obsidian/10">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-3"><img src={resolveImage(p.image_url)} alt="" className="w-12 h-16 object-cover bg-stone-soft" /></td>
                  <td className="p-3"><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.slug}</div></td>
                  <td className="p-3 tabular-nums">${Number(p.price).toFixed(2)}</td>
                  <td className="p-3 tabular-nums">{p.stock}</td>
                  <td className="p-3 text-xs">{p.is_active ? "Active" : "Hidden"}{p.is_featured ? " · Featured" : ""}{p.is_new ? " · New" : ""}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => startEdit(p)} className="eyebrow text-cobalt mr-3">Edit</button>
                    <button onClick={() => remove(p)} className="eyebrow text-destructive">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", step, required }: { label: string; value: string; onChange: (v: string) => void; type?: string; step?: string; required?: boolean }) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <input type={type} step={step} required={required} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-obsidian/15 px-3 py-2 bg-paper focus:outline-none focus:border-obsidian" />
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="eyebrow">{label}</span>
    </label>
  );
}
