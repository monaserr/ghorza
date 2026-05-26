import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status updated.");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  return (
    <div>
      <h1 className="font-display text-4xl uppercase tracking-tighter mb-8">Orders</h1>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border border-obsidian/10 p-5">
              <div className="flex flex-wrap justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-sm">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                  <p className="text-xs mt-1">{o.full_name} · {o.email}{o.phone ? ` · ${o.phone}` : ""}</p>
                  <p className="text-xs text-muted-foreground">{o.address_line1}, {o.city}, {o.country}</p>
                </div>
                <div className="text-right">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="eyebrow border border-obsidian/15 px-3 py-1 bg-paper text-xs focus:outline-none">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <p className="text-base font-semibold mt-2 tabular-nums">${Number(o.total).toFixed(2)}</p>
                </div>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 border-t border-obsidian/10 pt-3">
                {(o.order_items ?? []).map((it: { id: string; product_name: string; quantity: number; size: string | null; line_total: number }) => (
                  <li key={it.id} className="flex justify-between">
                    <span>{it.product_name} × {it.quantity}{it.size ? ` (${it.size})` : ""}</span>
                    <span className="tabular-nums">${Number(it.line_total).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
