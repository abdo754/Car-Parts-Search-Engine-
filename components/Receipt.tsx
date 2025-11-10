import React from 'react';
import type { Receipt } from '../types';

const ReceiptView: React.FC<{ receipt: Receipt | null; onClose?: () => void }> = ({ receipt, onClose }) => {
  if (!receipt) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded shadow-lg max-w-xl w-full p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">Receipt #{receipt.id}</h2>
          <div className="text-sm text-gray-500">{new Date(receipt.date).toLocaleString()}</div>
        </div>
        <div className="mt-4">
          <ul className="divide-y">
            {receipt.items.map((it, idx) => (
              <li key={idx} className="py-2 flex justify-between">
                <div>
                  <div className="font-medium">{it.partName}</div>
                  <div className="text-xs text-gray-500">{it.partNumber} — Owner: {it.ownerId}</div>
                </div>
                <div className="text-right">
                  <div>{it.qty} × ${it.price.toFixed(2)}</div>
                  <div className="font-semibold">${(it.qty * it.price).toFixed(2)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-lg font-bold">Total: ${receipt.total.toFixed(2)}</div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-gray-200 px-3 py-1 rounded">Print</button>
            <button onClick={onClose} className="bg-indigo-600 text-white px-3 py-1 rounded">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;
