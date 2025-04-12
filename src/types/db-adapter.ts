
/**
 * Type definitions for the DatabaseAdapter
 */

export interface SelectOptions {
  head?: boolean;
  count?: 'exact' | 'planned' | 'estimated';
}

export interface DatabaseQueryResult<T> {
  data: T;
  error: any;
}

export interface DatabaseQueryBuilder {
  select: (columns: string, options?: SelectOptions) => DatabaseQueryBuilder;
  insert: (values: any, options?: any) => Promise<DatabaseQueryResult<any>>;
  update: (values: any, options?: any) => Promise<DatabaseQueryResult<any>>;
  delete: (options?: any) => Promise<DatabaseQueryResult<any>>;
  eq: (column: string, value: any) => DatabaseQueryBuilder;
  neq: (column: string, value: any) => DatabaseQueryBuilder;
  gt: (column: string, value: any) => DatabaseQueryBuilder;
  gte: (column: string, value: any) => DatabaseQueryBuilder;
  lt: (column: string, value: any) => DatabaseQueryBuilder;
  lte: (column: string, value: any) => DatabaseQueryBuilder;
  like: (column: string, value: string) => DatabaseQueryBuilder;
  ilike: (column: string, value: string) => DatabaseQueryBuilder;
  is: (column: string, value: any) => DatabaseQueryBuilder;
  in: (column: string, values: any[]) => DatabaseQueryBuilder;
  contains: (column: string, value: any) => DatabaseQueryBuilder;
  containedBy: (column: string, value: any) => DatabaseQueryBuilder;
  filter: (column: string, operator: string, value: any) => DatabaseQueryBuilder;
  not: (column: string, operator: string, value: any) => DatabaseQueryBuilder;
  or: (filters: string, options?: any) => DatabaseQueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => DatabaseQueryBuilder;
  limit: (count: number) => DatabaseQueryBuilder;
  offset: (count: number) => DatabaseQueryBuilder;
  range: (from: number, to: number) => DatabaseQueryBuilder;
  single: () => Promise<any>;
  maybeSingle: () => Promise<any>;
  execute: () => Promise<any>;
  then: (onfulfilled?: ((value: any) => any) | undefined | null, onrejected?: ((reason: any) => never) | undefined | null) => Promise<any>;
}

export interface DatabaseTable {
  select: (columns: string, options?: SelectOptions) => DatabaseQueryBuilder;
  insert: (values: any, options?: any) => Promise<DatabaseQueryResult<any>>;
  update: (values: any, options?: any) => Promise<DatabaseQueryResult<any>>;
  delete: (options?: any) => Promise<DatabaseQueryResult<any>>;
  call: (params: any) => Promise<any>;
}

export interface DatabaseAdapter {
  table: (tableName: string) => DatabaseTable;
  query: <T>(tableName: string, queryFn: (queryBuilder: any) => any, fallbackData?: T) => Promise<T>;
  insert: <T>(tableName: string, data: any) => Promise<T | null>;
  update: <T>(tableName: string, data: any, matchColumn: string, matchValue: any) => Promise<T | null>;
  delete: (tableName: string, matchColumn: string, matchValue: any) => Promise<boolean>;
}

// Define interfaces for the common tables
export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  status?: string;
  category?: string;
  payment_terms?: string;
  credit_limit?: number;
  account_number?: string;
  bank_name?: string;
  bank_account?: string;
  bank_routing?: string;
  deleted?: boolean;
}

export interface BankAccount {
  id: string;
  name: string;
  bank_name: string;
  account_type: string;
  account_number?: string;
  routing_number?: string;
  swift_code?: string;
  iban?: string;
  current_balance: number;
  initial_balance: number;
  description?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  updated_at?: string;
  is_active?: boolean;
  currency?: string;
}

export interface DeliveryNote {
  id: string;
  delivery_number: string;
  purchase_order_id?: string;
  supplier_id?: string;
  warehouse_id?: string;
  status: string;
  delivery_date?: string;
  created_at: string;
  updated_at?: string;
  notes?: string;
  received_by?: string;
  shipped_by?: string;
  shipping_method?: string;
  tracking_number?: string;
  purchase_order?: {
    order_number: string;
    total_amount: number;
  };
  supplier?: Supplier;
  items?: any[];
  deleted?: boolean;
}

export interface ResultOne {
  id: string;
  [key: string]: any;
}

export interface OutcomeEntry {
  id: string;
  date: string;
  amount: number;
  description?: string;
  category?: any;
  receipt_number?: string;
  payment_method: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  [key: string]: any;
}

export interface POSLocation {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  manager?: string;
  status?: string;
  is_active?: boolean;
  capacity?: number;
  occupied?: number;
  surface?: number;
  created_at?: string;
  updated_at?: string;
}

// SelectQueryError type
export interface SelectQueryError<T = string> {
  error: true;
  message?: T;
  details?: string;
  hint?: string;
  code?: string;
}
