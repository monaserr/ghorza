import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/products";
import heroImg from "@/assets/hero-model.jpg";
import collectionImg from "@/assets/collection-concrete.jpg";
import fabricImg from "@/assets/product-fabric.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Virtue — Modern Staples" },
      { name: "description", content: "Drop 04 is live. Modern streetwear staples." },
      { property: "og:title", content: "Virtue — Modern Staples" },
      { property: "og:description", content: "Drop 04 is live." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: featured = [] } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(4);
      if (error) throw error;
      return data as unknown as Product[];
    },
  });

  return (
    <div>
      <section className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden bg-obsidian">
        <img src={heroImg} alt="Model wearing oversized grey hoodie" className="absolute inset-0 w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/20 via-transparent to-obsidian/30" />
        <div className="relative z-10 text-center text-paper px-6 animate-fade-up">
          <span className="eyebrow text-paper/70 block mb-6">Drop 04 — Live Now</span>
          <h1 className="font-display text-[18vw] md:text-[12vw] leading-[0.85] uppercase font-extrabold mb-10">
            Modern<br />Staples
          </h1>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="px-8 py-4 bg-paper text-obsidian eyebrow hover:bg-cobalt hover:text-paper transition-colors">Shop All</Link>
            <Link to="/shop/$collection" params={{ collection: "drop-04" }} className="px-8 py-4 border border-paper/30 text-paper eyebrow hover:bg-paper hover:text-obsidian transition-colors">Drop 04</Link>
          </div>
        </div>
        <Link to="/shop/$collection" params={{ collection: "drop-04" }} className="hidden lg:block absolute bottom-16 right-10 w-60 p-5 bg-paper shadow-2xl rotate-6 hover:rotate-0 transition-transform duration-700">
          <img src={fabricImg} alt="Technical fabric" className="w-full aspect-square object-cover mb-4" />
          <p className="eyebrow text-[9px] mb-1">New Drop</p>
          <p className="text-[12px] text-muted-foreground">Technical Series v.01</p>
        </Link>
      </section>

      <div className="border-y border-obsidian/10 py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 pr-12 shrink-0">
              <span className="font-display text-4xl uppercase">New Arrivals</span>
              <span className="text-cobalt">✦</span>
              <span className="font-display text-4xl uppercase">Drop 04 Live</span>
              <span className="text-cobalt">✦</span>
              <span className="font-display text-4xl uppercase">Free Shipping Over $200</span>
              <span className="text-cobalt">✦</span>
            </div>
          ))}
        </div>
      </div>

      <section className="py-24 md:py-32 px-6 md:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <h2 className="font-display text-5xl md:text-6xl uppercase tracking-tighter">Essential Edit</h2>
          <Link to="/shop" className="eyebrow border-b border-obsidian pb-1 hover:text-cobalt hover:border-cobalt transition-colors">View All Products</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-obsidian py-24 md:py-32 px-6 md:px-10 text-paper">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-7xl mx-auto">
          <div className="lg:col-span-7">
            <img src={collectionImg} alt="Two models in urban plaza" className="w-full aspect-[4/3] object-cover" />
          </div>
          <div className="lg:col-span-5">
            <span className="eyebrow text-paper/40 mb-4 block">Collection 04</span>
            <h2 className="font-display text-6xl md:text-7xl uppercase leading-tight mb-8">Concrete<br />Liturgy</h2>
            <p className="text-paper/60 max-w-sm mb-10 leading-relaxed text-sm">
              An exploration of urban camouflage and structured silhouettes.
            </p>
            <Link to="/shop/$collection" params={{ collection: "drop-04" }} className="inline-block px-10 py-5 border border-paper/30 eyebrow hover:bg-paper hover:text-obsidian transition-colors">
              Explore Collection
            </Link>
          </div>
        </div>
      </section>
    <section className="py-24 md:py-32 px-6 md:px-10 bg-stone-soft">
      <div className="max-w-xl mx-auto text-center">
        <span className="eyebrow text-muted-foreground block mb-4">Stay in the loop</span>
        <h2 className="font-display text-5xl md:text-6xl uppercase tracking-tighter mb-4">Join the List</h2>
        <p className="text-sm text-muted-foreground mb-10">Early access to drops, exclusive edits, and nothing else.</p>
        <NewsletterForm />
      </div>
    </section>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to Supabase newsletter table or email provider
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="eyebrow text-muted-foreground">
        You're on the list. ✦
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 border border-obsidian/15 px-4 py-3 bg-transparent text-sm focus:outline-none focus:border-obsidian"
      />
      <button
        type="submit"
        className="bg-obsidian text-paper px-8 py-3 eyebrow hover:bg-cobalt transition-colors whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  );
}
