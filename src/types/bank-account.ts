
export interface BankAccount {
  id: string;
  name: string;
  bank_name?: string;
  account_number?: string;
  account_type?: string;
  initial_balance?: number;
  current_balance?: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}
