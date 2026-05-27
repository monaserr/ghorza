import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Product, CollectionRow } from "@/lib/products";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop All — Virtue" },
      { name: "description", content: "Browse the full Virtue collection." },
    ],
  }),
  component: ShopAll,
});

function ShopAll() {
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [search, setSearch] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", true);
      return (data ?? []) as unknown as Product[];
    },
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data } = await supabase.from("collections").select("*").eq("is_active", true).order("sort_order");
      return (data ?? []) as CollectionRow[];
    },
  });

  const filtered = search.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return Number(a.price) - Number(b.price);
    if (sort === "price-desc") return Number(b.price) - Number(a.price);
    return 0;
  });

  return (
    <div className="pt-32 pb-24 px-6 md:px-10">
      <div className="mb-12">
        <span className="eyebrow text-muted-foreground">All Products</span>
        <h1 className="font-display text-6xl md:text-7xl uppercase tracking-tighter mt-3">The Catalog</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-y border-obsidian/10 py-4">
        <div className="flex flex-wrap gap-2">
          <Link to="/shop" className="eyebrow px-4 py-2 bg-obsidian text-paper">All</Link>
          {collections.map((c) => (
            <Link key={c.slug} to="/shop/$collection" params={{ collection: c.slug }}
              className="eyebrow px-4 py-2 border border-obsidian/15 hover:bg-obsidian hover:text-paper transition-colors">
              {c.name}
            </Link>
          ))}
        </div>
        <div className="flex-1 max-w-xs">
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-obsidian/15 px-4 py-2 bg-transparent text-sm focus:outline-none focus:border-obsidian eyebrow"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="eyebrow text-muted-foreground">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}
            className="eyebrow bg-transparent border border-obsidian/15 px-3 py-2 focus:outline-none focus:border-obsidian">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground text-sm py-16 text-center">No products found for "{search}".</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {sorted.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}