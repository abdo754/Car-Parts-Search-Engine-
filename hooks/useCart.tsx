import { useState, useEffect, useCallback } from 'react';
import type { CartItem } from '../types';

export const useCart = (userId?: string) => {
  const key = userId ? `cart_${userId}` : 'cart_guest';
  const getInitial = (): CartItem[] => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const [items, setItems] = useState<CartItem[]>(getInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(items));
    } catch { }
  }, [items, key]);

  const addToCart = useCallback((item: CartItem, qty = 1) => {
    setItems(prev => {
      const map = new Map(prev.map(i => [i.partNumber, i]));
      const existing = map.get(item.partNumber);
      if (existing) {
        existing.qty = Math.max(1, existing.qty + qty);
        map.set(item.partNumber, existing);
      } else {
        map.set(item.partNumber, { ...item, qty });
      }
      return Array.from(map.values());
    });
  }, []);

  const updateQty = useCallback((partNumber: string, qty: number) => {
    setItems(prev => prev.map(i => i.partNumber === partNumber ? { ...i, qty: Math.max(0, qty) } : i).filter(i => i.qty > 0));
  }, []);

  const removeFromCart = useCallback((partNumber: string) => {
    setItems(prev => prev.filter(i => i.partNumber !== partNumber));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((s, i) => s + i.price * i.qty, 0);
  }, [items]);

  return { items, addToCart, updateQty, removeFromCart, clearCart, getTotal };
};
