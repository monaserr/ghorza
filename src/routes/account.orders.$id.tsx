import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/account/orders/$id")({
  head: () => ({ meta: [{ title: "Order Details — Virtue" }, { name: "robots", content: "noindex" }] }),
  component: OrderDetailPage,
});

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-800",
  paid:      "bg-blue-50 text-blue-800",
  shipped:   "bg-purple-50 text-purple-800",
  delivered: "bg-green-50 text-green-800",
  cancelled: "bg-red-50 text-red-800",
};

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { user, loading: authLoading } = useAuth();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-detail", id],
    enabled: !!user && !!id,
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

  if (authLoading || isLoading) return <div className="pt-32 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!order) return (
    <div className="pt-32 pb-24 px-6 max-w-md mx-auto text-center">
      <h1 className="font-display text-5xl uppercase tracking-tighter mb-4">Order not found</h1>
      <Link to="/account" className="eyebrow border-b border-obsidian pb-1">Back to Account</Link>
    </div>
  );

  const statusClass = STATUS_COLORS[order.status] ?? "bg-obsidian/5 text-obsidian";

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-3xl mx-auto">
      <Link to="/account" className="eyebrow text-muted-foreground hover:text-obsidian block mb-8">← Back to Account</Link>

      <div className="flex flex-wrap justify-between items-start gap-4 mb-10">
        <div>
          <span className="eyebrow text-muted-foreground">Order</span>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter mt-1">{order.order_number}</h1>
          <p className="text-xs text-muted-foreground mt-2">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <span className={`eyebrow px-4 py-2 rounded-sm text-xs ${statusClass}`}>{order.status}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-obsidian/10 p-5">
          <h2 className="eyebrow mb-3">Shipping Address</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {order.full_name}<br />
            {order.address_line1}
            {order.address_line2 ? <><br />{order.address_line2}</> : null}<br />
            {order.city}{order.postal_code ? ` ${order.postal_code}` : ""}<br />
            {order.country}
          </p>
        </div>
        <div className="border border-obsidian/10 p-5">
          <h2 className="eyebrow mb-3">Contact</h2>
          <p className="text-sm text-muted-foreground">{order.email}</p>
          {order.phone && <p className="text-sm text-muted-foreground">{order.phone}</p>}
          <h2 className="eyebrow mt-4 mb-2">Payment</h2>
          <p className="text-sm text-muted-foreground">Cash on Delivery</p>
        </div>
      </div>

      <div className="border border-obsidian/10">
        <div className="p-5 border-b border-obsidian/10">
          <h2 className="eyebrow">Items</h2>
        </div>
        <div className="divide-y divide-obsidian/10">
          {(order.order_items ?? []).map((item: {
            id: string; product_name: string; product_slug: string;
            quantity: number; size: string | null; unit_price: number;
            line_total: number; image_url: string | null;
          }) => (
            <div key={item.id} className="flex gap-4 p-5">
              {item.image_url && (
                <img src={item.image_url} alt={item.product_name} className="w-16 h-20 object-cover bg-stone-soft shrink-0" />
              )}
              <div className="flex-1 flex justify-between items-start gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.size ? `Size ${item.size} · ` : ""}Qty {item.quantity}
                  </p>
                  <p className="text-xs text-muted-foreground">${Number(item.unit_price).toFixed(2)} each</p>
                </div>
                <p className="text-sm font-medium tabular-nums">${Number(item.line_total).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-obsidian/10 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">${Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="tabular-nums">{Number(order.shipping) === 0 ? "Free" : `$${Number(order.shipping).toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-obsidian/10">
            <span>Total</span>
            <span className="tabular-nums">${Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="border border-obsidian/10 p-5 mt-4">
          <h2 className="eyebrow mb-2">Notes</h2>
          <p className="text-sm text-muted-foreground">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
