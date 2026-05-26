import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/messages")({ component: AdminMessages });

function AdminMessages() {
  const qc = useQueryClient();
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const deleteMsg = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted.");
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  };

  return (
    <div>
      <h1 className="font-display text-4xl uppercase tracking-tighter mb-8">Messages</h1>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
        messages.length === 0 ? <p className="text-sm text-muted-foreground">No messages yet.</p> : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="border border-obsidian/10 p-5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email} · {new Date(m.created_at).toLocaleString()}</p>
                  </div>
                  <button onClick={() => deleteMsg(m.id)} className="eyebrow text-destructive text-xs">Delete</button>
                </div>
                <p className="text-sm mt-3 text-muted-foreground leading-relaxed">{m.message}</p>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
