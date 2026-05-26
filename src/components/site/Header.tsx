import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/shop/drop-04", label: "Collections" },
  { to: "/about", label: "Journal" },
];

export function Header() {
  const { count } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  const textColor = scrolled || mobileOpen ? "text-obsidian" : "text-paper";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled || mobileOpen
          ? "bg-paper/95 backdrop-blur-md border-b border-obsidian/5"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-10 py-5">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className={`font-display text-2xl font-extrabold uppercase tracking-tighter ${textColor}`}
        >
          Virtue
        </Link>

        {/* Desktop nav */}
        <nav className={`hidden md:flex gap-8 eyebrow ${textColor}`}>
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="hover:text-cobalt transition-colors"
              activeProps={{ className: "text-cobalt" }}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="hover:text-cobalt transition-colors text-cobalt">
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop right */}
        <div className={`hidden md:flex items-center gap-6 eyebrow ${textColor}`}>
          {user ? (
            <>
              <Link to="/account" className="hover:text-cobalt transition-colors">Account</Link>
              <button onClick={() => signOut()} className="hover:text-cobalt transition-colors">Sign Out</button>
            </>
          ) : (
            <Link to="/auth" className="hover:text-cobalt transition-colors">Sign In</Link>
          )}
          <Link to="/cart" className="hover:text-cobalt transition-colors">
            Cart ({count})
          </Link>
        </div>

        {/* Mobile right */}
        <div className={`flex md:hidden items-center gap-4 eyebrow ${textColor}`}>
          <Link to="/cart" className="hover:text-cobalt transition-colors">
            Cart ({count})
          </Link>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="p-1"
            aria-label="Toggle menu"
          >
            <span className="block w-5 h-px bg-current mb-1.5" />
            <span className="block w-5 h-px bg-current mb-1.5" />
            <span className="block w-5 h-px bg-current" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-paper border-t border-obsidian/10 px-6 py-6 space-y-4">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="block eyebrow text-obsidian hover:text-cobalt transition-colors py-1"
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileOpen(false)} className="block eyebrow text-cobalt py-1">
              Admin
            </Link>
          )}
          <div className="border-t border-obsidian/10 pt-4">
            {user ? (
              <>
                <Link to="/account" onClick={() => setMobileOpen(false)} className="block eyebrow text-obsidian hover:text-cobalt py-1">Account</Link>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="block eyebrow text-obsidian hover:text-cobalt py-1">Sign Out</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="block eyebrow text-obsidian hover:text-cobalt py-1">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
