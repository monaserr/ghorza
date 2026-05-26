import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Virtue" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/account" });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/account`,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: "/account" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/account`,
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed.");
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-md mx-auto">
      <h1 className="font-display text-5xl uppercase tracking-tighter mb-3 text-center">
        {mode === "signin" ? "Sign In" : "Create Account"}
      </h1>
      <p className="text-muted-foreground text-sm mb-10 text-center">
        {mode === "signin" ? "Welcome back." : "Join the Virtue circle."}
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full border border-obsidian/15 py-4 eyebrow hover:bg-obsidian hover:text-paper transition-colors disabled:opacity-50 mb-6"
      >
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-6 text-xs text-muted-foreground">
        <div className="flex-1 h-px bg-obsidian/10" />
        <span>OR</span>
        <div className="flex-1 h-px bg-obsidian/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="eyebrow block mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-obsidian/15 px-4 py-3 bg-transparent focus:outline-none focus:border-obsidian"
            />
          </div>
        )}
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
        <div>
          <label className="eyebrow block mb-2">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-obsidian/15 px-4 py-3 bg-transparent focus:outline-none focus:border-obsidian"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-obsidian text-paper py-4 eyebrow hover:bg-cobalt transition-colors disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-8">
        {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="eyebrow text-obsidian border-b border-obsidian"
        >
          {mode === "signin" ? "Create one" : "Sign in"}
        </button>
      </p>

      {mode === "signin" && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          <Link to="/auth/forgot-password" className="hover:text-obsidian">Forgot your password?</Link>
        </p>
      )}

      <p className="text-center text-xs text-muted-foreground mt-10">
        <Link to="/">← Back to Home</Link>
      </p>
    </div>
  );
}
