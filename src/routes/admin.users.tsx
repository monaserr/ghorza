import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

type ProfileRow = { id: string; full_name: string | null; created_at: string };
type RoleRow = { user_id: string; role: "admin" | "customer" };

function AdminUsers() {
  const qc = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name, created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProfileRow[];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("user_id, role");
      return (data ?? []) as RoleRow[];
    },
  });

  const toggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    if (currentlyAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) { toast.error(error.message); return; }
      toast.success("Admin removed.");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) { toast.error(error.message); return; }
      toast.success("Admin granted.");
    }
    qc.invalidateQueries({ queryKey: ["admin-roles"] });
  };

  const isAdminUser = (uid: string) => roles.some((r) => r.user_id === uid && r.role === "admin");

  return (
    <div>
      <h1 className="font-display text-4xl uppercase tracking-tighter mb-8">Users</h1>
      <div className="border border-obsidian/10">
        <table className="w-full text-sm">
          <thead className="bg-obsidian/5 eyebrow">
            <tr><th className="text-left p-3">Name</th><th className="text-left p-3">User ID</th><th className="text-left p-3">Joined</th><th className="text-left p-3">Role</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-obsidian/10">
            {profiles.map((p) => {
              const admin = isAdminUser(p.id);
              return (
                <tr key={p.id}>
                  <td className="p-3 font-medium">{p.full_name || "—"}</td>
                  <td className="p-3 text-xs text-muted-foreground font-mono">{p.id.slice(0, 8)}…</td>
                  <td className="p-3 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-xs">{admin ? "Admin" : "Customer"}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => toggleAdmin(p.id, admin)} className="eyebrow text-cobalt">
                      {admin ? "Revoke Admin" : "Make Admin"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
