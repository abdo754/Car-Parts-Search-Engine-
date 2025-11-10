export enum Role {
  Admin,
  Customer,
  StoreOwner,
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: Role;
}

export interface CarPart {
  partNumber: string;
  partName: string;
  make: string;
  model: string;
  year: number;
  price: number;
  stock: number;
  description: string;
  ownerId?: string;
}

export interface Transaction {
  id: string;
  buyerId: string;
  ownerId?: string;
  partNumber: string;
  price: number;
  qty: number;
  date: string;
}

export interface UploadSummary {
  successCount: number;
  failedCount: number;
  errors: { row: number; message: string; data: any }[];
}

export type Page = 'login' | 'signup';
