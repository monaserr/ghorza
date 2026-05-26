import { createFileRoute, Link, notFound } from "@tanstack/react-router";

const POLICIES: Record<string, { title: string; body: string[] }> = {
  shipping: {
    title: "Shipping",
    body: [
      "We ship worldwide via tracked courier services.",
      "Orders over $200 receive complimentary standard shipping.",
      "Standard shipping: 3–6 business days. Express: 1–3 business days.",
      "Orders are processed within 24 hours, Monday through Friday.",
    ],
  },
  returns: {
    title: "Returns",
    body: [
      "We offer a 30-day return window from the date of delivery.",
      "Items must be unworn, unwashed, and have all original tags attached.",
      "Initiate returns through your account or by contacting our team.",
      "Refunds are processed within 7 business days of receiving the return.",
    ],
  },
  privacy: {
    title: "Privacy",
    body: [
      "We collect only the data needed to process orders and improve your experience.",
      "We never sell personal information to third parties.",
      "You may request data deletion at any time by contacting us.",
    ],
  },
  cookies: {
    title: "Cookies",
    body: [
      "We use essential cookies to operate the site and remember your cart.",
      "Optional analytics cookies help us understand site usage.",
      "You can manage preferences through the cookie banner on first visit.",
    ],
  },
};

export const Route = createFileRoute("/policies/$slug")({
  loader: ({ params }) => {
    const policy = POLICIES[params.slug];
    if (!policy) throw notFound();
    return { policy };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.policy.title ?? "Policy"} — Virtue` },
      { name: "description", content: loaderData?.policy.body[0] ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-display text-5xl uppercase mb-4">Policy not found</h1>
        <Link to="/" className="eyebrow border-b border-obsidian pb-1">Back to Home</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center px-6">
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: PolicyPage,
});

function PolicyPage() {
  const { policy } = Route.useLoaderData();
  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-2xl mx-auto">
      <span className="eyebrow text-muted-foreground">Policies</span>
      <h1 className="font-display text-6xl uppercase tracking-tighter mt-4 mb-10">
        {policy.title}
      </h1>
      <div className="space-y-4 text-base leading-relaxed text-foreground/80">
        {policy.body.map((p: string, i: number) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
