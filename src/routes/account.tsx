import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Account — Virtue" }, { name: "robots", content: "noindex" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading, isAdmin, refreshRole, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const claimAdmin = async () => {
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error) { toast.error(error.message); return; }
    if (data) { toast.success("You're now an admin."); await refreshRole(); }
    else toast.info("An admin already exists.");
  };

  if (loading || !user) return <div className="pt-32 text-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-12">
        <div>
          <span className="eyebrow text-muted-foreground">Signed in as</span>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter mt-2">
            {profile?.full_name || user.email}
          </h1>
          {profile?.full_name && (
            <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
          )}
        </div>
        <button onClick={signOut} className="eyebrow border border-obsidian/15 px-4 py-2 hover:bg-obsidian hover:text-paper transition-colors">
          Sign Out
        </button>
      </div>

      <div className="flex gap-3 mb-12">
        {isAdmin ? (
          <Link to="/admin" className="eyebrow bg-cobalt text-paper px-5 py-3">Open Admin Dashboard</Link>
        ) : (
          <button onClick={claimAdmin} className="eyebrow border border-obsidian/15 px-5 py-3 hover:bg-obsidian hover:text-paper transition-colors">
            Claim Admin (first user only)
          </button>
        )}
      </div>

      <h2 className="eyebrow mb-6">Your Orders</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border border-obsidian/10 p-5">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className="eyebrow bg-obsidian/5 px-3 py-1">{o.status}</span>
                  <p className="text-sm font-medium tabular-nums">${Number(o.total).toFixed(2)}</p>
                  <Link to="/account/orders/$id" params={{ id: o.id }} className="eyebrow text-cobalt text-xs hover:underline">View Details →</Link>
                </div>
              </div>
              <ul className="mt-3 text-xs text-muted-foreground space-y-1">
                {(o.order_items ?? []).map((it: { id: string; product_name: string; quantity: number; size: string | null }) => (
                  <li key={it.id}>{it.product_name} × {it.quantity}{it.size ? ` (${it.size})` : ""}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
