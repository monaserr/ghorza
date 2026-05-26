import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({ meta: [{ title: "Reset Password — Virtue" }, { name: "robots", content: "noindex" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-md mx-auto">
      <h1 className="font-display text-5xl uppercase tracking-tighter mb-3 text-center">Reset Password</h1>
      <p className="text-muted-foreground text-sm mb-10 text-center">
        Enter your email and we'll send you a reset link.
      </p>

      {sent ? (
        <div className="border border-obsidian/10 p-10 text-center">
          <p className="font-display text-3xl uppercase mb-3">Check your inbox.</p>
          <p className="text-sm text-muted-foreground">
            We sent a reset link to <span className="text-obsidian">{email}</span>.
          </p>
          <Link to="/auth" className="eyebrow border-b border-obsidian mt-6 inline-block">Back to Sign In</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="eyebrow block mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-obsidian/15 px-4 py-3 bg-transparent focus:outline-none focus:border-obsidian"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-obsidian text-paper py-4 eyebrow hover:bg-cobalt transition-colors disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-muted-foreground mt-8">
        <Link to="/auth" className="eyebrow text-obsidian border-b border-obsidian">← Back to Sign In</Link>
      </p>
    </div>
  );
}
