import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Virtue" },
      { name: "description", content: "Get in touch with the Virtue team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name,
        email: form.email,
        message: form.message,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-2xl mx-auto">
      <span className="eyebrow text-muted-foreground">Contact</span>
      <h1 className="font-display text-6xl uppercase tracking-tighter mt-4 mb-10">Get in Touch</h1>

      {sent ? (
        <div className="border border-obsidian/10 p-10 text-center">
          <p className="font-display text-3xl uppercase mb-3">Thanks.</p>
          <p className="text-sm text-muted-foreground">We'll get back to you within 48 hours.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="eyebrow block mb-2">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-obsidian"
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-obsidian"
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">Message</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-obsidian"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-obsidian text-paper px-10 py-4 eyebrow hover:bg-cobalt transition-colors disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}
