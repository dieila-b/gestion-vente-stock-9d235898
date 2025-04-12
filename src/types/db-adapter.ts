
/**
 * Type for SelectQueryError to match what Supabase returns when queries fail
 */
export interface SelectQueryError<T = string> {
  error: true;
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface DatabaseQueryBuilder {
  select: (columns: string) => any;
  eq: (column: string, value: any) => any;
  order: (column: string, options?: { ascending: boolean }) => any;
}

export interface DeliveryNote {
  // Base properties
  id: string;
  delivery_number: string;
  created_at: string;
  updated_at: string;
  notes: string;
  status: string;
}

export interface BankAccount {
  id: string;
  name: string;
  account_number: string;
  current_balance: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}
