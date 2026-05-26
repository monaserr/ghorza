import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (productId: string, size: string) => void;
  setQuantity: (productId: string, size: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  detailed: Array<CartItem & { lineTotal: number }>;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "virtue-cart-v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const detailed = items.map((it) => ({ ...it, lineTotal: it.price * it.quantity }));
    const count = detailed.reduce((acc, it) => acc + it.quantity, 0);
    const subtotal = detailed.reduce((acc, it) => acc + it.lineTotal, 0);

    return {
      items,
      detailed,
      count,
      subtotal,
      add: (item) =>
        setItems((prev) => {
          const existing = prev.find((p) => p.productId === item.productId && p.size === item.size);
          if (existing) {
            return prev.map((p) =>
              p.productId === item.productId && p.size === item.size
                ? { ...p, quantity: p.quantity + item.quantity }
                : p,
            );
          }
          return [...prev, item];
        }),
      remove: (productId, size) =>
        setItems((prev) => prev.filter((p) => !(p.productId === productId && p.size === size))),
      setQuantity: (productId, size, qty) => {
        if (qty <= 0) {
          setItems((prev) => prev.filter((p) => !(p.productId === productId && p.size === size)));
          return;
        }
        setItems((prev) =>
          prev.map((p) =>
            p.productId === productId && p.size === size ? { ...p, quantity: qty } : p,
          ),
        );
      },
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
