import React, { useState, useCallback } from 'react';
import type { CarPart, UploadSummary } from '../types';
import Button from './common/Button';

interface AdminDashboardProps {
  username: string;
  onUpload: (parts: CarPart[]) => UploadSummary;
  isAdmin?: boolean;
}

// Define the type for the XLSX library from the CDN
declare const XLSX: any;

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21 21H3" />
    </svg>
);


const AdminDashboard: React.FC<AdminDashboardProps> = ({ username, onUpload, isAdmin }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<UploadSummary | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setSummary(null);
    }
  };

  const handleUpload = useCallback(() => {
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet) as any[];

        // Map Excel headers (e.g., "Part Number") to the CarPart interface keys (e.g., "partNumber")
        const mappedParts: CarPart[] = rawJson.map(row => ({
          partNumber: row['Part Number'],
          partName: row['Part Name'],
          make: row['Make'],
          model: row['Model'],
          year: row['Year'],
          price: row['Price'],
          stock: row['Stock'],
          description: row['Description'],
        }));

        const uploadResult = onUpload(mappedParts);
        setSummary(uploadResult);
      } catch (error) {
        console.error("Error parsing file:", error);
        setSummary({ successCount: 0, failedCount: 0, errors: [{ row: 0, message: "Failed to parse the file. Please ensure it's a valid .xlsx file.", data: {} }] });
      } finally {
        setIsLoading(false);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  }, [file, onUpload]);

  // Admin-only helpers
  const [users, setUsers] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('users') || '[]');
    } catch { return []; }
  });

  const [transactions, setTransactions] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('transactions') || '[]');
    } catch { return []; }
  });

  const refreshAdminData = () => {
    try { setUsers(JSON.parse(localStorage.getItem('users') || '[]')); } catch { setUsers([]); }
    try { setTransactions(JSON.parse(localStorage.getItem('transactions') || '[]')); } catch { setTransactions([]); }
  };

  const removeUser = (id: string) => {
    // remove user
    const nextUsers = (JSON.parse(localStorage.getItem('users') || '[]') as any[]).filter(u => u.id !== id);
    localStorage.setItem('users', JSON.stringify(nextUsers));
    // remove parts owned by this user
    try {
      const parts = JSON.parse(localStorage.getItem('car_parts_db') || '[]') as any[];
      const remaining = parts.filter(p => p.ownerId !== id);
      localStorage.setItem('car_parts_db', JSON.stringify(remaining));
    } catch (e) { console.error(e); }
    refreshAdminData();
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Welcome, {username}!</p>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Upload Car Parts Data</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Upload an Excel (.xlsx) file with part data. The file should have headers: Part Number, Part Name, Make, Model, Year, Price, Stock, Description.</p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label htmlFor="file-upload" className="w-full sm:w-auto cursor-pointer bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-150 ease-in-out flex items-center justify-center">
            <UploadIcon className="w-5 h-5 mr-2"/>
            <span>{file ? 'File Selected' : 'Choose File'}</span>
          </label>
          <input id="file-upload" type="file" className="hidden" accept=".xlsx" onChange={handleFileChange} />
          {file && <span className="text-gray-600 dark:text-gray-400 truncate">{file.name}</span>}
          <div className="w-full sm:w-auto sm:ml-auto">
            <Button onClick={handleUpload} disabled={!file || isLoading} isLoading={isLoading}>
              Upload File
            </Button>
          </div>
        </div>
      </div>

      {summary && (
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Upload Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg">
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">{summary.successCount}</p>
              <p className="text-sm text-green-600 dark:text-green-400">Rows Processed Successfully</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">{summary.failedCount}</p>
              <p className="text-sm text-red-600 dark:text-red-400">Rows Failed</p>
            </div>
          </div>
          {summary.errors.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Error Details</h4>
              <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {summary.errors.map((error, index) => (
                    <li key={index} className="p-3">
                      <p className="font-semibold text-red-600 dark:text-red-400">Row {error.row}: <span className="font-normal">{error.message}</span></p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">Data: {JSON.stringify(error.data)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Admin: Users</h3>
          <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md mb-4">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(u => (
                <li key={u.id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{u.name || u.email} <span className="text-xs text-gray-500">({u.email})</span></p>
                    <p className="text-xs text-gray-500">{u.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-sm text-red-600" onClick={() => removeUser(u.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Admin: Transactions</h3>
          <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((t, i) => (
                <li key={i} className="p-3">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{t.partNumber} — {t.qty} × ${t.price.toFixed?.(2) ?? t.price}</p>
                  <p className="text-xs text-gray-500">Buyer: {t.buyerId} Owner: {t.ownerId} Date: {new Date(t.date).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;