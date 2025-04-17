
import { BankAccount } from "@/types/db-adapter";
import { isSelectQueryError } from '../safe-access';

/**
 * Safely handle bank account properties
 */
export function safeBankAccount(account: any): BankAccount {
  if (isSelectQueryError(account)) {
    return {
      id: '',
      name: 'Compte inconnu',
      account_number: '',
      current_balance: 0
    };
  }
  return account || { 
    id: '', 
    name: 'Compte inconnu', 
    account_number: '', 
    current_balance: 0
  };
}
