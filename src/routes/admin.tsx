import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Virtue" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading) return <div className="pt-32 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="pt-32 pb-24 px-6 max-w-md mx-auto text-center">
        <h1 className="font-display text-4xl uppercase tracking-tighter mb-4">Forbidden</h1>
        <p className="text-sm text-muted-foreground mb-8">You need admin access to view this page.</p>
        <Link to="/account" className="inline-block bg-obsidian text-paper px-8 py-3 eyebrow hover:bg-cobalt transition-colors">
          Back to Account
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-60 shrink-0 border-r border-obsidian/10 md:min-h-[calc(100vh-7rem)] p-6">
        <h2 className="font-display text-2xl uppercase tracking-tighter mb-6">Admin</h2>
        <nav className="flex md:flex-col gap-2 eyebrow">
          <Link to="/admin/dashboard" activeProps={{ className: "bg-obsidian text-paper" }} className="px-3 py-2 hover:bg-obsidian/5 transition-colors">Dashboard</Link>
          <Link to="/admin" activeOptions={{ exact: true }} activeProps={{ className: "bg-obsidian text-paper" }} className="px-3 py-2 hover:bg-obsidian/5 transition-colors">Products</Link>
          <Link to="/admin/collections" activeProps={{ className: "bg-obsidian text-paper" }} className="px-3 py-2 hover:bg-obsidian/5 transition-colors">Collections</Link>
          <Link to="/admin/orders" activeProps={{ className: "bg-obsidian text-paper" }} className="px-3 py-2 hover:bg-obsidian/5 transition-colors">Orders</Link>
          <Link to="/admin/users" activeProps={{ className: "bg-obsidian text-paper" }} className="px-3 py-2 hover:bg-obsidian/5 transition-colors">Users</Link>
          <Link to="/admin/messages" activeProps={{ className: "bg-obsidian text-paper" }} className="px-3 py-2 hover:bg-obsidian/5 transition-colors">Messages</Link>
        </nav>
      </aside>
      <div className="flex-1 p-6 md:p-10">
        <Outlet />
      </div>
    </div>
  );
}
