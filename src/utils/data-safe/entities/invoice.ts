
import { isSelectQueryError } from '../safe-access';

/**
 * Safely handle invoice properties
 */
export function safeInvoice(invoice: any): {
  id: string;
  payment_status: string;
  paid_amount: number;
  remaining_amount: number;
} {
  if (isSelectQueryError(invoice)) {
    return {
      id: '',
      payment_status: 'pending',
      paid_amount: 0,
      remaining_amount: 0
    };
  }
  return invoice || { id: '', payment_status: 'pending', paid_amount: 0, remaining_amount: 0 };
}
