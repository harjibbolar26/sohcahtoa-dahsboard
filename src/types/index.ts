// ===== Auth Types =====
export type UserRole = "admin" | "analyst";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ===== Transaction Types =====
export type TransactionStatus = "completed" | "pending" | "failed" | "flagged";

export type TransactionType =
  | "FX"
  | "PTA"
  | "BTA"
  | "Medicals"
  | "transfer"
  | "wallet";

export type TransactionDirection = "inflow" | "outflow";

export interface Transaction {
  id: string;
  reference: string;
  sender: string;
  recipient: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  direction: TransactionDirection;
  description: string;
  date: string;
  cardLast4?: string;
  note?: string;
  flaggedBy?: string;
  flaggedAt?: string;
}

export interface TransactionFilters {
  status?: TransactionStatus;
  dateFrom?: string;
  dateTo?: string;
  type?: TransactionType;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TransactionUpdate {
  note?: string;
  status?: TransactionStatus;
  flaggedBy?: string;
  flaggedAt?: string;
}

// ===== API Types =====
export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// ===== Card Types =====
export interface Card {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  holder: string;
  balance: number;
  brand: string;
}

export interface CardTransaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  direction: TransactionDirection;
}

export interface CardFlow {
  moneyIn: number;
  moneyOut: number;
  total: number;
}
