
import { TodaySales } from "@/types/cash-register";

/**
 * Calculates the total sales for today
 */
export function calculateTodayTotalSales(todaySales: TodaySales | undefined): number {
  if (!todaySales) return 0;
  
  const orderTotal = todaySales.orders.reduce((sum, order) => sum + (order.final_total || 0), 0);
  const preorderPaymentsTotal = todaySales.preorderPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const invoicePaymentsTotal = todaySales.invoicePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const incomeEntriesTotal = todaySales.incomeEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  const paymentsTotal = todaySales.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  
  return orderTotal + preorderPaymentsTotal + invoicePaymentsTotal + incomeEntriesTotal + paymentsTotal;
}

/**
 * Calculates the expected cash register amount based on the initial amount and all transactions
 */
export function calculateExpectedCashAmount(initialAmount: number, transactions: any[]): number {
  if (!transactions || transactions.length === 0) return initialAmount;

  return transactions.reduce((total, transaction) => {
    if (transaction.type === 'deposit') {
      return total + transaction.amount;
    } else if (transaction.type === 'withdrawal') {
      return total - transaction.amount;
    }
    return total;
  }, initialAmount);
}
