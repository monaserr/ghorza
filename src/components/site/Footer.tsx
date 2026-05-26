import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="py-16 px-6 md:px-10 border-t border-obsidian/5 bg-paper">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <span className="font-display text-2xl font-extrabold uppercase">Virtue</span>
          <p className="text-xs text-muted-foreground mt-3 max-w-[28ch] leading-relaxed">
            Modern staples engineered for the contemporary wardrobe.
          </p>
        </div>
        <FooterCol
          title="Shop"
          links={[
            { to: "/shop", label: "All Products" },
            { to: "/shop/drop-04", label: "Drop 04" },
            { to: "/shop/essentials", label: "Essentials" },
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            { to: "/policies/shipping", label: "Shipping" },
            { to: "/policies/returns", label: "Returns" },
            { to: "/contact", label: "Contact" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { to: "/about", label: "About" },
            { to: "/policies/privacy", label: "Privacy" },
            { to: "/policies/cookies", label: "Cookies" },
          ]}
        />
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-obsidian/5 flex flex-col md:flex-row justify-between items-center gap-3 eyebrow text-muted-foreground">
        <span>© {new Date().getFullYear()} Virtue Collective.</span>
        <span>Made for the modern wardrobe.</span>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="eyebrow">{title}</span>
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="text-xs text-muted-foreground hover:text-obsidian transition-colors"
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
