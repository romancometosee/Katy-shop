"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ProductArt } from "@/lib/types";

export type CartLine = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  brandName: string;
  variantLabel: string;
  price: number;
  oldPrice?: number;
  image?: string;
  art: ProductArt;
  qty: number;
};

type Ctx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
};

const CartContext = createContext<Ctx | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setLines(load("katy-cart", []));
    setFavorites(load("katy-fav", []));
    setReady(true);
  }, []);
  useEffect(() => { if (ready) save("katy-cart", lines); }, [lines, ready]);
  useEffect(() => { if (ready) save("katy-fav", favorites); }, [favorites, ready]);

  const value = useMemo<Ctx>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: lines.reduce((s, l) => s + l.qty * l.price, 0),
      add: (line, qty = 1) => {
        setLines((prev) => {
          const found = prev.find((l) => l.variantId === line.variantId);
          if (found) return prev.map((l) => (l.variantId === line.variantId ? { ...l, ...line, qty: l.qty + qty } : l));
          return [...prev, { ...line, qty }];
        });
        setDrawerOpen(true);
      },
      setQty: (variantId, qty) =>
        setLines((prev) => (qty <= 0 ? prev.filter((l) => l.variantId !== variantId) : prev.map((l) => (l.variantId === variantId ? { ...l, qty } : l)))),
      remove: (variantId) => setLines((prev) => prev.filter((l) => l.variantId !== variantId)),
      clear: () => setLines([]),
      favorites,
      toggleFavorite: (id) => setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      drawerOpen,
      setDrawerOpen,
    }),
    [lines, favorites, drawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart outside CartProvider");
  return ctx;
}
