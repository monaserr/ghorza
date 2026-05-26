import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — Virtue" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { detailed, subtotal, setQuantity, remove } = useCart();
  const shipping = subtotal > 0 && subtotal < 200 ? 15 : 0;
  const total = subtotal + shipping;

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-6xl mx-auto">
      <h1 className="font-display text-6xl md:text-7xl uppercase tracking-tighter mb-12">Your Bag</h1>

      {detailed.length === 0 ? (
        <div className="border-t border-obsidian/10 py-24 text-center">
          <p className="text-muted-foreground mb-8">Your bag is empty.</p>
          <Link to="/shop" className="inline-block bg-obsidian text-paper px-10 py-4 eyebrow hover:bg-cobalt transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
          <div className="divide-y divide-obsidian/10 border-y border-obsidian/10">
            {detailed.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex gap-5 py-6">
                <Link to="/product/$slug" params={{ slug: item.slug }} className="shrink-0">
                  <img src={item.image} alt={item.name} className="w-24 h-32 md:w-28 md:h-36 object-cover bg-stone-soft" />
                </Link>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link to="/product/$slug" params={{ slug: item.slug }} className="text-sm font-semibold uppercase tracking-wider hover:text-cobalt">
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">Size {item.size}{item.color ? ` · ${item.color}` : ""}</p>
                    </div>
                    <p className="text-sm font-medium tabular-nums">${item.lineTotal.toFixed(2)}</p>
                  </div>
                  <div className="mt-auto flex justify-between items-center pt-4">
                    <div className="flex items-center border border-obsidian/15">
                      <button onClick={() => setQuantity(item.productId, item.size, item.quantity - 1)} className="px-3 py-2 eyebrow hover:bg-obsidian hover:text-paper" aria-label="Decrease">−</button>
                      <span className="px-4 text-sm tabular-nums">{item.quantity}</span>
                      <button onClick={() => setQuantity(item.productId, item.size, item.quantity + 1)} className="px-3 py-2 eyebrow hover:bg-obsidian hover:text-paper" aria-label="Increase">+</button>
                    </div>
                    <button onClick={() => remove(item.productId, item.size)} className="eyebrow text-muted-foreground hover:text-destructive">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="bg-stone-soft p-6 md:p-8 h-fit lg:sticky lg:top-28">
            <h2 className="eyebrow mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="tabular-nums">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
              {subtotal < 200 && subtotal > 0 && (
                <p className="text-xs text-muted-foreground pt-2">Add ${(200 - subtotal).toFixed(2)} for free shipping.</p>
              )}
            </div>
            <div className="border-t border-obsidian/10 mt-6 pt-6 flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums">${total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="mt-6 block text-center bg-obsidian text-paper py-4 eyebrow hover:bg-cobalt transition-colors">Checkout</Link>
            <Link to="/shop" className="mt-3 block text-center eyebrow text-muted-foreground hover:text-obsidian">Continue Shopping</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
