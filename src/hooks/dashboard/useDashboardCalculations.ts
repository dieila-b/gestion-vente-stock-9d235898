
import { safeArray, safeNumber, safeOrder } from "@/utils/data-safe/safe-access";
import { useDailyMarginCalculation } from "./useDailyMarginCalculation";

export function useDashboardCalculations(
  todayOrderData: any[],
  catalogProducts: any[],
  unpaidInvoices: any[],
  monthlyExpenses: any[]
) {
  const { calculateDailyMargin } = useDailyMarginCalculation(todayOrderData, catalogProducts);

  // Calculs sécurisés avec vérifications
  const todaySales = safeArray(todayOrderData).reduce((sum: number, orderData) => {
    const order = safeOrder(orderData);
    const finalTotal = safeNumber(order?.final_total || 0);
    return sum + finalTotal;
  }, 0);
    
  const todayMargin = calculateDailyMargin();
  
  const unpaidAmount = safeArray(unpaidInvoices).reduce((sum: number, invoice) => {
    const remainingAmount = safeNumber((invoice as any)?.remaining_amount || 0);
    return sum + remainingAmount;
  }, 0);
    
  const monthlyExpensesTotal = safeArray(monthlyExpenses).reduce((sum: number, expense) => {
    const amount = safeNumber((expense as any)?.amount || 0);
    return sum + amount;
  }, 0);

  return {
    todaySales,
    todayMargin,
    unpaidAmount,
    monthlyExpensesTotal
  };
}
