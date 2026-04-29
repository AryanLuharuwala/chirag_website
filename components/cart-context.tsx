"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type CartItem = {
  id: string;
  productId: string;
  size: string;
  colorKey: string;
  quantity: number;
  product: {
    name: string;
    price: string;
    slug: string;
    tone: string;
    category: string;
  };
};

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (productId: string, size: string, colorKey: string, qty?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = async (productId: string, size: string, colorKey: string, qty = 1) => {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, size, colorKey, quantity: qty }),
    });
    setDrawerOpen(true);
    refresh();
  };

  const removeItem = async (id: string) => {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refresh();
  };

  const updateQty = async (id: string, quantity: number) => {
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, quantity }),
    });
    refresh();
  };

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + parseFloat(i.product.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, total, loading, drawerOpen, openDrawer, closeDrawer, addItem, removeItem, updateQty, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart outside CartProvider");
  return ctx;
}
