import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/products";
import { resolveImage } from "@/lib/asset-map";

export function ProductCard({ product }: { product: Product }) {
  const img = resolveImage(product.image_url);
  const soldOut = product.stock <= 0;
  return (
    <Link to="/product/$slug" params={{ slug: product.slug }} className="group block">
      <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-stone-soft outline-1 -outline-offset-1 outline-obsidian/5">
        <img
          src={img}
          alt={product.name}
          width={800}
          height={1066}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.is_new && (
          <span className="absolute top-3 left-3 bg-obsidian text-paper px-2 py-1 eyebrow text-[9px]">
            New
          </span>
        )}
        {soldOut && (
          <span className="absolute top-3 right-3 bg-paper text-obsidian px-2 py-1 eyebrow text-[9px]">
            Sold Out
          </span>
        )}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-paper px-3 py-1.5 eyebrow text-[9px]">View Product</span>
          <div className="flex gap-1">
            {product.sizes.slice(0, 3).map((s) => (
              <span key={s} className="bg-paper/90 backdrop-blur px-2 py-1 text-[9px] font-bold">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-start gap-3">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider">{product.name}</h3>
        <p className="text-[12px] font-medium tabular-nums">${product.price}</p>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">
        {product.colors.length} {product.colors.length === 1 ? "color" : "colors"}
      </p>
    </Link>
  );
}
