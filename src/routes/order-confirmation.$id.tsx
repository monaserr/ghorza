import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/order-confirmation/$id")({
  head: () => ({ meta: [{ title: "Order Confirmed — Virtue" }, { name: "robots", content: "noindex" }] }),
  component: OrderConfirmationPage,
});

function OrderConfirmationPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="pt-32 text-center text-sm text-muted-foreground">Loading…</div>;

  if (!order) return (
    <div className="pt-32 pb-24 px-6 max-w-md mx-auto text-center">
      <h1 className="font-display text-5xl uppercase tracking-tighter mb-4">Order not found</h1>
      <Link to="/" className="eyebrow border-b border-obsidian pb-1">Back to Home</Link>
    </div>
  );

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-full bg-obsidian/5 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-obsidian" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <span className="eyebrow text-muted-foreground block mb-3">Order Confirmed</span>
        <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tighter">Thank You</h1>
        <p className="text-muted-foreground text-sm mt-4">
          Your order <span className="text-obsidian font-semibold">{order.order_number}</span> has been placed successfully.
        </p>
      </div>

      <div className="border border-obsidian/10 p-6 md:p-8 space-y-6">
        <div>
          <h2 className="eyebrow mb-4">Order Summary</h2>
          <div className="space-y-3">
            {(order.order_items ?? []).map((item: {
              id: string; product_name: string; quantity: number;
              size: string | null; unit_price: number; line_total: number; image_url: string | null;
            }) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.product_name} × {item.quantity}
                  {item.size ? ` (${item.size})` : ""}
                </span>
                <span className="tabular-nums">${Number(item.line_total).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-obsidian/10 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="tabular-nums">{Number(order.shipping) === 0 ? "Free" : `$${Number(order.shipping).toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-obsidian/10">
              <span>Total</span>
              <span className="tabular-nums">${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-obsidian/10 pt-6">
          <h2 className="eyebrow mb-3">Shipping To</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {order.full_name}<br />
            {order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ""}<br />
            {order.city}{order.postal_code ? ` ${order.postal_code}` : ""}, {order.country}
          </p>
        </div>

        <div className="border-t border-obsidian/10 pt-6">
          <h2 className="eyebrow mb-2">Payment Method</h2>
          <p className="text-sm text-muted-foreground">Cash on Delivery — payment collected upon receipt.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        {user && (
          <Link to="/account" className="flex-1 text-center bg-obsidian text-paper py-4 eyebrow hover:bg-cobalt transition-colors">
            View All Orders
          </Link>
        )}
        <Link to="/shop" className="flex-1 text-center border border-obsidian/15 py-4 eyebrow hover:bg-obsidian hover:text-paper transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
