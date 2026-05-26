import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-obsidian/10 p-6">
      <p className="eyebrow text-muted-foreground mb-2">{label}</p>
      <p className="font-display text-4xl uppercase tracking-tighter">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-2">{sub}</p>}
    </div>
  );
}

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        supabase.from("orders").select("id, total, status, created_at"),
        supabase.from("products").select("id, is_active, stock"),
        supabase.from("profiles").select("id, created_at"),
      ]);

      const orders = ordersRes.data ?? [];
      const products = productsRes.data ?? [];
      const users = usersRes.data ?? [];

      const revenue = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((acc, o) => acc + Number(o.total), 0);

      const pending = orders.filter((o) => o.status === "pending").length;
      const activeProducts = products.filter((p) => p.is_active).length;
      const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

      // Orders in the last 7 days
      const week = new Date();
      week.setDate(week.getDate() - 7);
      const recentOrders = orders.filter((o) => new Date(o.created_at) > week).length;

      return { revenue, pending, activeProducts, lowStock, totalOrders: orders.length, recentOrders, totalUsers: users.length };
    },
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, full_name, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  return (
    <div>
      <h1 className="font-display text-4xl uppercase tracking-tighter mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Revenue" value={`$${(stats?.revenue ?? 0).toFixed(0)}`} sub="All non-cancelled orders" />
        <StatCard label="Pending Orders" value={stats?.pending ?? 0} sub="Awaiting action" />
        <StatCard label="Active Products" value={stats?.activeProducts ?? 0} sub={stats?.lowStock ? `${stats.lowStock} low stock` : undefined} />
        <StatCard label="Customers" value={stats?.totalUsers ?? 0} sub={`${stats?.recentOrders ?? 0} orders this week`} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="eyebrow">Recent Orders</h2>
          <Link to="/admin/orders" className="eyebrow text-cobalt text-xs">View All →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="border border-obsidian/10">
            <table className="w-full text-sm">
              <thead className="bg-obsidian/5 eyebrow">
                <tr>
                  <th className="text-left p-3">Order</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian/10">
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="p-3 font-medium">{o.order_number}</td>
                    <td className="p-3 text-muted-foreground">{o.full_name}</td>
                    <td className="p-3 tabular-nums">${Number(o.total).toFixed(2)}</td>
                    <td className="p-3"><span className="eyebrow bg-obsidian/5 px-2 py-1 text-[10px]">{o.status}</span></td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
