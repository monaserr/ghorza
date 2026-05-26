import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart-context";
import { ProductCard } from "@/components/site/ProductCard";
import { resolveImage } from "@/lib/asset-map";
import type { Product } from "@/lib/products";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — Virtue` }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { add } = useCart();
  const navigate = useNavigate();
  const [size, setSize] = useState<string | null>(null);
  const [colorIdx, setColorIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
      if (error) throw error;
      return data as unknown as Product | null;
    },
  });

  const { data: related = [] } = useQuery({
    queryKey: ["products", "related", slug],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", true).neq("slug", slug).limit(4);
      return (data ?? []) as unknown as Product[];
    },
  });

  if (isLoading) return <div className="pt-32 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-display text-5xl uppercase mb-4">Product not found</h1>
        <Link to="/shop" className="eyebrow border-b border-obsidian pb-1">Back to Shop</Link>
      </div>
    </div>
  );

  const color = product.colors[colorIdx];
  const img = resolveImage(product.image_url);
  const soldOut = product.stock <= 0;

  const handleAdd = () => {
    if (!size) { setError("Select a size first."); return; }
    add({
      productId: product.id, slug: product.slug, name: product.name,
      price: Number(product.price), image: img, size, color: color?.name, quantity: 1,
    });
    setError(null);
    navigate({ to: "/cart" });
  };

  return (
    <div className="pt-28">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="bg-stone-soft aspect-[3/4] lg:aspect-auto lg:min-h-[calc(100vh-7rem)]">
          <img src={img} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="px-6 md:px-12 py-12 lg:py-20 flex flex-col">
          <div className="max-w-md">
            <Link to="/shop" className="eyebrow text-muted-foreground hover:text-obsidian">← Back to Shop</Link>
            <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tighter mt-6">{product.name}</h1>
            <p className="text-2xl font-medium mt-4 tabular-nums">${Number(product.price).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-8">{product.description}</p>

            {product.colors.length > 0 && (
              <div className="mt-10">
                <span className="eyebrow block mb-3">Color — {color?.name}</span>
                <div className="flex gap-2">
                  {product.colors.map((c, i) => (
                    <button key={c.name} type="button" onClick={() => setColorIdx(i)} aria-label={c.name}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${colorIdx === i ? "border-obsidian scale-110" : "border-obsidian/15"}`}
                      style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <span className="eyebrow block mb-3">Size</span>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((s) => (
                  <button key={s} type="button" onClick={() => { setSize(s); setError(null); }}
                    className={`py-3 eyebrow border transition-colors ${size === s ? "bg-obsidian text-paper border-obsidian" : "border-obsidian/15 hover:border-obsidian"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-destructive mt-4">{error}</p>}

            <button onClick={handleAdd} disabled={soldOut}
              className="mt-8 w-full bg-obsidian text-paper py-5 eyebrow hover:bg-cobalt transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {soldOut ? "Sold Out" : "Add to Bag"}
            </button>
          </div>
        </div>
      </div>

      <section className="py-24 px-6 md:px-10">
        <h2 className="font-display text-4xl uppercase tracking-tighter mb-10">You May Also Like</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
