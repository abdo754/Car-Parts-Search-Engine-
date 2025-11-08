import { useState, useCallback, useEffect } from 'react';
import type { CarPart, UploadSummary } from '../types';

const DB_KEY = 'car_parts_db';

const getInitialParts = (): CarPart[] => {
  try {
    const item = window.localStorage.getItem(DB_KEY);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return [];
  }
};

export const usePartsDB = () => {
  const [parts, setParts] = useState<CarPart[]>(getInitialParts);

  useEffect(() => {
    try {
      window.localStorage.setItem(DB_KEY, JSON.stringify(parts));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [parts]);

  const addOrUpdateParts = useCallback((newParts: CarPart[]): UploadSummary => {
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

  return { addOrUpdateParts, searchParts, getAllParts };
};
