'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export type CartItem = {
  id: string;           // unique key: listing_id + vendor_id
  listingId: string;
  vendorId: string;
  vendorName: string;
  name: string;
  originalPrice: number;
  price: number;        // after Pro discount
  discountPct: number;  // e.g. 15 for 15%
  type: 'tiffin' | 'service';
  suffix: string;       // '/mo', '/meal', '/hr'
  qty: number;
  image?: string;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  totalSaved: number;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  hasItem: (id: string) => boolean;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = 'handout_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  // persist to localStorage whenever items change
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, 'qty'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) { removeItem(id); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);
  const hasItem = useCallback((id: string) => items.some(i => i.id === id), [items]);

  const count = items.reduce((a, i) => a + i.qty, 0);
  const total = items.reduce((a, i) => a + i.price * i.qty, 0);
  const totalSaved = items.reduce((a, i) => a + (i.originalPrice - i.price) * i.qty, 0);

  return (
    <Ctx.Provider value={{ items, count, total, totalSaved, addItem, removeItem, updateQty, clearCart, hasItem }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
