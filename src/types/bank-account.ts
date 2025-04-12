
export interface BankAccount {
  id: string;
  name: string;
  account_number: string;
  account_type: string;
  bank_name: string;
  current_balance: number;
  initial_balance: number;
  created_at: string;
  updated_at: string;
  currency?: string;
}
