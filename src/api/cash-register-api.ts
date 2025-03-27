import { supabase } from "@/integrations/supabase/client";
import { CashRegister, Transaction, TodaySales } from "@/types/cash-register";

/**
 * Fetches the latest cash register
 */
export async function fetchLatestCashRegister(): Promise<CashRegister | null> {
  const { data, error } = await supabase
    .from('cash_registers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Fetches all transactions for a cash register
 */
export async function fetchCashRegisterTransactions(registerId: string): Promise<Transaction[]> {
  if (!registerId) return [];

  const { data, error } = await supabase
    .from('cash_register_transactions')
    .select('*')
    .eq('cash_register_id', registerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Transaction[];
}

/**
 * Fetches cash register transactions by date filter
 */
export async function fetchCashRegisterTransactionsByDate(
  registerId: string, 
  year: string, 
  month: string
): Promise<Transaction[]> {
  if (!registerId) return [];

  // Create date range for the selected month
  const startDate = new Date(`${year}-${month}-01`);
  
  // Calculate the end date (last day of the month)
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0); // Last day of the month
  endDate.setHours(23, 59, 59, 999); // End of the day
  
  console.log('Fetching transactions for date range:', {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    registerId
  });

  const { data, error } = await supabase
    .from('cash_register_transactions')
    .select('*')
    .eq('cash_register_id', registerId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching transactions by date:', error);
    throw error;
  }
  
  return data as Transaction[];
}

/**
 * Fetches today's sales data
 */
export async function fetchTodaySalesData(): Promise<TodaySales> {
  // Get today's date at 00:00:00
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // First, try to get completed orders from today
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('id, final_total')
    .gte('created_at', today.toISOString())
    .eq('status', 'completed');
  
  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
    throw ordersError;
  }
  
  // Then, get preorder payments from today
  const { data: preorderPaymentsData, error: preorderPaymentsError } = await supabase
    .from('payments')
    .select('amount')
    .gte('created_at', today.toISOString());
  
  if (preorderPaymentsError) {
    console.error('Error fetching preorder payments:', preorderPaymentsError);
    throw preorderPaymentsError;
  }
  
  // Get invoice payments from today
  const { data: invoicePaymentsData, error: invoicePaymentsError } = await supabase
    .from('order_payments')
    .select('amount')
    .gte('created_at', today.toISOString());
  
  if (invoicePaymentsError) {
    console.error('Error fetching invoice payments:', invoicePaymentsError);
    throw invoicePaymentsError;
  }
  
  // Get income entries from today (non-payment related income)
  const { data: incomeEntriesData, error: incomeEntriesError } = await supabase
    .from('income_entries')
    .select('amount')
    .gte('created_at', today.toISOString());
  
  if (incomeEntriesError) {
    console.error('Error fetching income entries:', incomeEntriesError);
    throw incomeEntriesError;
  }
  
  // Also get cash register deposit transactions from today
  const { data: depositTransactionsData, error: depositTransactionsError } = await supabase
    .from('cash_register_transactions')
    .select('amount')
    .eq('type', 'deposit')
    .gte('created_at', today.toISOString());
  
  if (depositTransactionsError) {
    console.error('Error fetching deposit transactions:', depositTransactionsError);
    throw depositTransactionsError;
  }
  
  return {
    orders: ordersData || [],
    preorderPayments: preorderPaymentsData || [],
    invoicePayments: invoicePaymentsData || [],
    incomeEntries: incomeEntriesData || [],
    depositTransactions: depositTransactionsData || [],
    payments: preorderPaymentsData || [] // Include preorder payments in the result
  };
}

/**
 * Adds a transaction to the cash register
 */
export async function addCashRegisterTransaction(
  registerId: string, 
  type: 'deposit' | 'withdrawal', 
  amount: number, 
  description: string
): Promise<void> {
  console.log('Adding transaction to cash register:', {
    registerId, type, amount, description
  });
  
  try {
    // First, add the transaction
    const { error } = await supabase
      .from('cash_register_transactions')
      .insert([
        {
          cash_register_id: registerId,
          type: type,
          amount: amount,
          description: description || (type === 'deposit' ? 'Dépôt' : 'Retrait'),
        }
      ]);
      
    if (error) {
      console.error('Error adding transaction to cash register:', error);
      throw error;
    }
    
    // Then, update the cash register amount
    const { data: cashRegister, error: getError } = await supabase
      .from('cash_registers')
      .select('current_amount')
      .eq('id', registerId)
      .single();
      
    if (getError) {
      console.error('Error fetching cash register:', getError);
      throw getError;
    }
    
    const newAmount = type === 'deposit' 
      ? (cashRegister.current_amount + amount)
      : (cashRegister.current_amount - amount);
      
    const { error: updateError } = await supabase
      .from('cash_registers')
      .update({ current_amount: newAmount })
      .eq('id', registerId);
      
    if (updateError) {
      console.error('Error updating cash register amount:', updateError);
      throw updateError;
    }
    
    console.log('Transaction added successfully and cash register amount updated');
  } catch (error) {
    console.error('Error in addCashRegisterTransaction:', error);
    throw error;
  }
}
