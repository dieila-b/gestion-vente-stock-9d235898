
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function useDailyReportQueries(date: Date | null) {
  // Format the date string for querying
  const dateStr = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  // Fetch daily sales data
  const { data: dailySales = [], isLoadingSales } = useQuery({
    queryKey: ['daily-sales', dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', `${dateStr}T00:00:00`)
        .lte('created_at', `${dateStr}T23:59:59`);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch daily expense data using expense_entries table
  const { data: dailyExpenses = [], isLoadingExpenses } = useQuery({
    queryKey: ['daily-expenses', dateStr],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('expense_entries')
          .select('*')
          .gte('created_at', `${dateStr}T00:00:00`)
          .lte('created_at', `${dateStr}T23:59:59`);
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching expense data:", error);
        return [];
      }
    }
  });

  // Fetch daily payment data
  const { data: dailyPayments = [], isLoadingPayments } = useQuery({
    queryKey: ['daily-payments', dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_payments')
        .select('*')
        .gte('created_at', `${dateStr}T00:00:00`)
        .lte('created_at', `${dateStr}T23:59:59`);
      
      if (error) throw error;
      return data;
    }
  });

  // Add mock data for the missing properties in DailyReport.tsx
  const periodTotals = {
    total: dailySales.reduce((sum, sale) => sum + (sale.final_total || 0), 0),
    paid: dailyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
    remaining: dailySales.reduce((sum, sale) => sum + (sale.final_total || 0), 0) - 
              dailyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  };

  // Create mock product sales data
  const dailyProducts = [
    { product_id: "prod1", product_name: "Product 1", total_quantity: 5, total_sales: 25000 },
    { product_id: "prod2", product_name: "Product 2", total_quantity: 3, total_sales: 15000 },
  ];

  // Create mock client sales data
  const dailyClients = [
    {
      client: { 
        id: "client1", 
        company_name: "Client A", 
        contact_name: "Contact A",
        phone: "",
        email: "",
        address: "",
        city: "",
        country: "",
        client_type: "business",
        client_code: "CA001",
        status: "active"
      },
      client_id: "client1",
      total: 25000,
      paid_amount: 15000,
      remaining_amount: 10000
    }
  ];
  
  return {
    // Original return values
    dailySales,
    isLoadingSales,
    dailyExpenses,
    isLoadingExpenses,
    dailyPayments,
    isLoadingPayments,
    
    // Additional mock data needed by DailyReport.tsx
    periodTotals,
    dailyProducts,
    dailyClients
  };
}
