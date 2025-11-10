import { useState, useCallback, useEffect } from 'react';
import type { CarPart, UploadSummary, Transaction } from '../types';

const DB_KEY = 'car_parts_db';
const TX_KEY = 'transactions';
const RECEIPT_KEY = 'receipts';

const getInitialParts = (): CarPart[] => {
  try {
    const item = window.localStorage.getItem(DB_KEY);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return [];
  }
};

const getInitialTransactions = (): Transaction[] => {
  try {
    const item = window.localStorage.getItem(TX_KEY);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error('Error reading transactions from localStorage', error);
    return [];
  }
};

export const usePartsDB = () => {
  const [parts, setParts] = useState<CarPart[]>(getInitialParts);
  const [transactions, setTransactions] = useState<Transaction[]>(getInitialTransactions);
  const [receipts, setReceipts] = useState<any[]>(() => {
    try { return JSON.parse(window.localStorage.getItem(RECEIPT_KEY) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(DB_KEY, JSON.stringify(parts));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [parts]);

  useEffect(() => {
    try {
      window.localStorage.setItem(TX_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error writing transactions to localStorage', error);
    }
  }, [transactions]);

  useEffect(() => {
    try { window.localStorage.setItem(RECEIPT_KEY, JSON.stringify(receipts)); } catch { }
  }, [receipts]);

  const addOrUpdateParts = useCallback((newParts: CarPart[], ownerId?: string): UploadSummary => {
    const summary: UploadSummary = {
      successCount: 0,
      failedCount: 0,
      errors: [],
    };

    const updatedPartsMap = new Map(parts.map(p => [p.partNumber, p]));

    newParts.forEach((part, index) => {
      // Basic validation for presence of required fields
      if (!part.partNumber || !part.partName || !part.make || !part.model || part.year == null || part.price == null || part.stock == null) {
        summary.failedCount++;
        summary.errors.push({ row: index + 2, message: 'Missing required fields.', data: part });
        return;
      }

      // Sanitize and convert potentially stringified or currency-formatted numbers
      const priceStr = String(part.price).replace(/[^0-9.]+/g, "");
      const cleanPrice = Number(priceStr);
      const cleanYear = Number(part.year);
      const cleanStock = Number(part.stock);

      if (isNaN(cleanYear) || isNaN(cleanPrice) || isNaN(cleanStock)) {
        summary.failedCount++;
        summary.errors.push({ row: index + 2, message: 'Year, Price, and Stock must be valid numbers.', data: part });
        return;
      }
      
      const validatedPart: CarPart = {
        ...part,
        year: cleanYear,
        price: cleanPrice,
        stock: cleanStock,
        ownerId: ownerId || part.ownerId,
      };

      updatedPartsMap.set(validatedPart.partNumber, validatedPart);
      summary.successCount++;
    });

    setParts(Array.from(updatedPartsMap.values()));
    return summary;
  }, [parts]);

  const searchParts = useCallback((query: string): CarPart[] => {
    if (!query) {
      return parts;
    }
    const lowercasedQuery = query.toLowerCase();
    return parts.filter(part =>
      part.partName.toLowerCase().includes(lowercasedQuery) ||
      part.partNumber.toLowerCase().includes(lowercasedQuery) ||
      part.make.toLowerCase().includes(lowercasedQuery) ||
      part.model.toLowerCase().includes(lowercasedQuery) ||
      String(part.year).includes(lowercasedQuery)
    );
  }, [parts]);
  
  const getAllParts = useCallback(() => {
    return parts;
  }, [parts]);

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions(prev => {
      const next = [tx, ...prev];
      return next;
    });
  }, []);

  const getTransactions = useCallback(() => {
    return transactions;
  }, [transactions]);

  const buyPart = useCallback((partNumber: string, qty: number, buyerId: string, receiptId?: string) => {
    const idx = parts.findIndex(p => p.partNumber === partNumber);
    if (idx === -1) throw new Error('Part not found');
    const part = parts[idx];
    const available = Number(part.stock || 0);
    if (qty <= 0 || qty > available) throw new Error('Invalid quantity');

    const updatedPart = { ...part, stock: available - qty };
    const nextParts = [...parts];
    nextParts[idx] = updatedPart;
    setParts(nextParts);

    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      buyerId,
      ownerId: part.ownerId,
      partNumber: part.partNumber,
      price: part.price,
      qty,
      date: new Date().toISOString(),
      receiptId: receiptId,
    };
    setTransactions(prev => [tx, ...prev]);
    return tx;
  }, [parts]);

  const addReceipt = useCallback((receipt: { id: string; buyerId: string; items: any[]; total: number; date: string }) => {
    setReceipts(prev => [receipt, ...prev]);
  }, []);

  const getReceipts = useCallback(() => receipts, [receipts]);

  return { addOrUpdateParts, searchParts, getAllParts, buyPart, getTransactions, addTransaction, addReceipt, getReceipts };
};
