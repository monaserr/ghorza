import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Product, CollectionRow } from "@/lib/products";

export const Route = createFileRoute("/shop/$collection")({
  head: ({ params }) => ({
    meta: [{ title: `${params.collection.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — Virtue` }],
  }),
  component: CollectionPage,
});

function CollectionPage() {
  const { collection: slug } = Route.useParams();

  const { data: collection } = useQuery({
    queryKey: ["collection", slug],
    queryFn: async () => {
      const { data } = await supabase.from("collections").select("*").eq("slug", slug).maybeSingle();
      return data as CollectionRow | null;
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["collection-products", slug],
    queryFn: async () => {
      if (slug === "men" || slug === "women") {
        const { data } = await supabase.from("products").select("*").eq("is_active", true).in("category", [slug, "unisex"]);
        return (data ?? []) as unknown as Product[];
      }
      // Read product ids from product_collections
      const { data: pc } = await supabase.from("product_collections").select("product_id, collections!inner(slug)").eq("collections.slug", slug);
      const ids = (pc ?? []).map((r) => r.product_id);
      if (ids.length === 0) return [];
      const { data } = await supabase.from("products").select("*").eq("is_active", true).in("id", ids);
      return (data ?? []) as unknown as Product[];
    },
  });

  return (
    <div className="pt-32 pb-24 px-6 md:px-10">
      <div className="mb-12">
        <Link to="/shop" className="eyebrow text-muted-foreground hover:text-obsidian">← All Products</Link>
        <h1 className="font-display text-6xl md:text-7xl uppercase tracking-tighter mt-4">
          {collection?.name ?? slug}
        </h1>
        {collection?.description && <p className="text-muted-foreground text-sm mt-3 max-w-md">{collection.description}</p>}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground text-sm">No products in this collection yet.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}
