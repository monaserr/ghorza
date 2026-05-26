import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { CollectionRow } from "@/lib/products";

export const Route = createFileRoute("/admin/collections")({ component: AdminCollections });

function AdminCollections() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ id: "", slug: "", name: "", description: "", sort_order: "0", is_active: true });

  const { data: collections = [] } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: async () => {
      const { data } = await supabase.from("collections").select("*").order("sort_order");
      return (data ?? []) as CollectionRow[];
    },
  });

  const reset = () => setForm({ id: "", slug: "", name: "", description: "", sort_order: "0", is_active: true });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      slug: form.slug.trim(), name: form.name.trim(),
      description: form.description || null, sort_order: Number(form.sort_order),
      is_active: form.is_active,
    };
    const res = form.id
      ? await supabase.from("collections").update(payload).eq("id", form.id)
      : await supabase.from("collections").insert(payload);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(form.id ? "Updated." : "Created.");
    reset();
    qc.invalidateQueries({ queryKey: ["admin-collections"] });
    qc.invalidateQueries({ queryKey: ["collections"] });
  };

  const edit = (c: CollectionRow) => setForm({ id: c.id, slug: c.slug, name: c.name, description: c.description ?? "", sort_order: String(c.sort_order), is_active: c.is_active });

  const remove = async (c: CollectionRow) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    const { error } = await supabase.from("collections").delete().eq("id", c.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted.");
    qc.invalidateQueries({ queryKey: ["admin-collections"] });
  };

  return (
    <div>
      <h1 className="font-display text-4xl uppercase tracking-tighter mb-8">Collections</h1>

      <form onSubmit={save} className="grid md:grid-cols-2 gap-4 border border-obsidian/15 p-6 mb-10 bg-stone-soft">
        <h2 className="eyebrow md:col-span-2">{form.id ? "Edit Collection" : "New Collection"}</h2>
        <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Input label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
        <Input label="Sort Order" type="number" value={form.sort_order} onChange={(v) => setForm({ ...form, sort_order: v })} />
        <label className="flex items-center gap-2 cursor-pointer mt-7">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          <span className="eyebrow">Active</span>
        </label>
        <div className="md:col-span-2">
          <label className="eyebrow block mb-2">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-obsidian/15 px-3 py-2 bg-paper min-h-20 focus:outline-none focus:border-obsidian" />
        </div>
        <div className="md:col-span-2 flex gap-3">
          <button type="submit" className="eyebrow bg-obsidian text-paper px-6 py-3 hover:bg-cobalt transition-colors">Save</button>
          {form.id && <button type="button" onClick={reset} className="eyebrow border border-obsidian/15 px-6 py-3">Cancel</button>}
        </div>
      </form>

      <div className="border border-obsidian/10">
        <table className="w-full text-sm">
          <thead className="bg-obsidian/5 eyebrow">
            <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Slug</th><th className="text-left p-3">Order</th><th className="text-left p-3">Active</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-obsidian/10">
            {collections.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-xs text-muted-foreground">{c.slug}</td>
                <td className="p-3 tabular-nums">{c.sort_order}</td>
                <td className="p-3 text-xs">{c.is_active ? "Yes" : "No"}</td>
                <td className="p-3 text-right">
                  <button onClick={() => edit(c)} className="eyebrow text-cobalt mr-3">Edit</button>
                  <button onClick={() => remove(c)} className="eyebrow text-destructive">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-obsidian/15 px-3 py-2 bg-paper focus:outline-none focus:border-obsidian" />
    </div>
  );
}
