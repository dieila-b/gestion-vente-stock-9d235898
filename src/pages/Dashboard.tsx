
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ProductsChart } from "@/components/dashboard/ProductsChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { FinancialSituation } from "@/components/dashboard/FinancialSituation";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";
import { useStockStats } from "@/hooks/dashboard/useStockStats";
import { useClientStats } from "@/hooks/dashboard/useClientStats";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const { todayOrderData, catalogProducts, unpaidInvoices, monthlyExpenses } = useDashboardStats();
  const { catalog, totalStock, totalStockPurchaseValue, totalStockSaleValue, globalStockMargin, marginPercentage } = useStockStats();
  const { clientsCount, supplierPayments } = useClientStats();

  // Fetch financial data
  const { data: financialData } = useQuery({
    queryKey: ['financial-situation'],
    queryFn: async () => {
      // Get credit balance (Avoir) - sum of paid amounts
      const { data: creditData, error: creditError } = await supabase
        .from('orders')
        .select('paid_amount')
        .eq('payment_status', 'paid');

      if (creditError) throw creditError;

      // Get debit balance (Devoir) - sum of remaining amounts from unpaid invoices
      const { data: debitData, error: debitError } = await supabase
        .from('orders')
        .select('remaining_amount')
        .in('payment_status', ['pending', 'partial']);

      if (debitError) throw debitError;

      const creditBalance = creditData.reduce((sum, order) => sum + (order.paid_amount || 0), 0);
      const debitBalance = debitData.reduce((sum, order) => sum + (order.remaining_amount || 0), 0);
      const netBalance = creditBalance - debitBalance;

      return {
        creditBalance,
        debitBalance,
        netBalance
      };
    }
  });

  // Calculate daily margin based on actual sales
  const calculateDailyMargin = () => {
    if (!todayOrderData || !catalogProducts) return 0;
    
    let totalMargin = 0;
    
    todayOrderData.forEach(order => {
      if (!order.order_items) return;
      
      order.order_items.forEach(item => {
        const catalogProduct = catalogProducts.find(p => p.id === item.product_id);
        if (!catalogProduct) return;
        
        const salesPrice = catalogProduct.price;
        const purchasePrice = catalogProduct.purchase_price || 0;
        const quantity = item.quantity || 0;
        
        totalMargin += (salesPrice - purchasePrice) * quantity;
      });
    });
    
    return totalMargin;
  };

  // Calculate totals
  const todaySales = todayOrderData?.reduce((sum, order) => sum + (order.final_total || 0), 0) || 0;
  const todayMargin = calculateDailyMargin();
  const unpaidAmount = unpaidInvoices?.reduce((sum, invoice) => sum + (invoice.remaining_amount || 0), 0) || 0;
  const monthlyExpensesTotal = monthlyExpenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;

  const handleUnpaidInvoicesClick = () => {
    navigate('/sales-invoices?filter=unpaid');
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gradient animate-fade-in">
          Tableau de Bord
        </h1>
        <p className="text-muted-foreground animate-fade-in delay-100">
          Bienvenue sur votre tableau de bord MOGA STORE
        </p>
      </div>

      <DashboardMetrics
        todaySales={todaySales}
        todayMargin={todayMargin}
        unpaidAmount={unpaidAmount}
        monthlyExpensesTotal={monthlyExpensesTotal}
        catalogLength={catalog?.length || 0}
        totalStock={totalStock}
        totalStockPurchaseValue={totalStockPurchaseValue}
        totalStockSaleValue={totalStockSaleValue}
        globalStockMargin={globalStockMargin}
        marginPercentage={marginPercentage}
        clientsCount={clientsCount || 0}
        supplierPayments={supplierPayments || 0}
        onUnpaidInvoicesClick={handleUnpaidInvoicesClick}
      />

      <FinancialSituation
        creditBalance={financialData?.creditBalance || 0}
        debitBalance={financialData?.debitBalance || 0}
        netBalance={financialData?.netBalance || 0}
      />

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 animate-fade-in delay-500">
        <SalesChart />
        <ProductsChart />
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 animate-fade-in delay-600">
        <CategoryChart />
        <RecentActivity />
      </div>
    </div>
  );
}

