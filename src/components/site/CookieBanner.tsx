import { useEffect, useState } from "react";

const KEY = "virtue-cookies-v1";

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = (value: "all" | "essential") => {
    localStorage.setItem(KEY, value);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[60] animate-fade-up">
      <div className="bg-obsidian text-paper p-6 shadow-2xl border border-obsidian">
        <span className="eyebrow text-cobalt block mb-3">Cookies</span>
        <p className="text-xs leading-relaxed text-paper/80 mb-5">
          We use cookies to improve your experience, remember your cart, and analyze site
          performance. You can accept all or stick to essentials.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => accept("all")}
            className="flex-1 bg-paper text-obsidian px-4 py-2.5 eyebrow text-[10px] hover:bg-cobalt hover:text-paper transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={() => accept("essential")}
            className="flex-1 border border-paper/30 px-4 py-2.5 eyebrow text-[10px] hover:bg-paper/10 transition-colors"
          >
            Essentials Only
          </button>
        </div>
      </div>
    </div>
  );
}
