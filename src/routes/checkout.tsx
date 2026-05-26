import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Virtue" }, { name: "robots", content: "noindex" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { detailed, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: user?.email ?? "",
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
    country: "EG",
    notes: "",
  });

  const shipping = subtotal > 0 && subtotal < 200 ? 15 : 0;
  const total = subtotal + shipping;

  const onField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (detailed.length === 0) { toast.error("Cart is empty."); return; }
    setLoading(true);
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: user?.id ?? null,
        email: form.email,
        full_name: form.full_name,
        phone: form.phone || null,
        address_line1: form.address_line1,
        address_line2: form.address_line2 || null,
        city: form.city,
        postal_code: form.postal_code || null,
        country: form.country,
        subtotal,
        shipping,
        total,
        notes: form.notes || null,
      }).select().single();
      if (error) throw error;

      const items = detailed.map((it) => ({
        order_id: order.id,
        product_id: it.productId,
        product_name: it.name,
        product_slug: it.slug,
        image_url: it.image,
        size: it.size,
        color: it.color ?? null,
        unit_price: it.price,
        quantity: it.quantity,
        line_total: it.lineTotal,
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) throw itemsError;

      clear();
      navigate({ to: "/order-confirmation/$id", params: { id: order.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  if (detailed.length === 0) {
    return (
      <div className="pt-32 pb-24 px-6 md:px-10 max-w-3xl mx-auto text-center">
        <h1 className="font-display text-6xl uppercase tracking-tighter mb-6">Checkout</h1>
        <p className="text-muted-foreground text-sm mb-10">Your bag is empty.</p>
        <Link to="/shop" className="inline-block bg-obsidian text-paper px-10 py-4 eyebrow hover:bg-cobalt transition-colors">Start Shopping</Link>
      </div>
    );
  }

  const Field = (k: keyof typeof form, label: string, required = true, type = "text") => (
    <div>
      <label className="eyebrow block mb-2">{label}{required && " *"}</label>
      <input type={type} required={required} value={form[k]} onChange={onField(k)}
        className="w-full border border-obsidian/15 px-4 py-3 bg-transparent focus:outline-none focus:border-obsidian" />
    </div>
  );

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-6xl mx-auto">
      <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tighter mb-12">Checkout</h1>
      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
        <div className="space-y-4">
          <h2 className="eyebrow mb-2">Contact & Shipping</h2>
          {Field("email", "Email", true, "email")}
          {Field("full_name", "Full Name")}
          {Field("phone", "Phone", false)}
          {Field("address_line1", "Address")}
          {Field("address_line2", "Apartment / Suite", false)}
          <div className="grid grid-cols-2 gap-4">
            {Field("city", "City")}
            {Field("postal_code", "Postal Code", false)}
          </div>
          {Field("country", "Country")}
          <div>
            <label className="eyebrow block mb-2">Notes (optional)</label>
            <textarea value={form.notes} onChange={onField("notes")}
              className="w-full border border-obsidian/15 px-4 py-3 bg-transparent min-h-24 focus:outline-none focus:border-obsidian" />
          </div>
        </div>
        <aside className="bg-stone-soft p-6 md:p-8 h-fit lg:sticky lg:top-28">
          <h2 className="eyebrow mb-6">Order Summary</h2>
          <div className="space-y-2 text-sm mb-6">
            {detailed.map((it) => (
              <div key={`${it.productId}-${it.size}`} className="flex justify-between text-xs">
                <span>{it.name} × {it.quantity}</span>
                <span className="tabular-nums">${it.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-obsidian/10 pt-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="tabular-nums">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
          </div>
          <div className="border-t border-obsidian/10 mt-4 pt-4 flex justify-between text-base font-semibold">
            <span>Total</span><span className="tabular-nums">${total.toFixed(2)}</span>
          </div>
          <button type="submit" disabled={loading} className="mt-6 w-full bg-obsidian text-paper py-4 eyebrow hover:bg-cobalt transition-colors disabled:opacity-50">
            {loading ? "Placing Order…" : "Place Order"}
          </button>
          <p className="text-[11px] text-muted-foreground mt-3 text-center">Cash on delivery — payment collected upon receipt.</p>
        </aside>
      </form>
    </div>
  );
}
