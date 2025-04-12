
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
  supplier_id?: string;
  purchase_order_id?: string;
  
  // Relations - these are optional to handle errors
  supplier?: {
    name: string;
    phone?: string;
    email?: string;
    error?: boolean;
  };
  purchase_order?: {
    order_number: string;
    total_amount: number;
    error?: boolean;
  };
  items?: any[];
}

export interface BankAccount {
  id: string;
  name: string;
  bank_name?: string;
  account_number: string;
  current_balance: number;
  initial_balance?: number;
  account_type?: string;
  created_at?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  created_at?: string;
}
