
// Cash register and transaction types
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  created_at: string;
}

export interface CashRegister {
  id: string;
  current_amount: number;
  initial_amount: number; // Adding this field to match the database schema
  created_at: string;
  updated_at: string;
}

export interface TodaySales {
  orders: Array<{ id: string; final_total: number }>;
  preorderPayments: Array<{ amount: number }>;
  invoicePayments: Array<{ amount: number }>;
  incomeEntries: Array<{ amount: number }>;
  depositTransactions: Array<{ amount: number }>;
  payments: Array<{ amount: number }>; // Added payments (for preorder payments)
}
