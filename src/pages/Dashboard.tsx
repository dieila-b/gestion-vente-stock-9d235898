
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ProductsChart } from "@/components/dashboard/ProductsChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { FinancialSituation } from "@/components/dashboard/FinancialSituation";
import { useDashboardStatsUpdated } from "@/hooks/dashboard/useDashboardStatsUpdated";
import { useStockStats } from "@/hooks/dashboard/useStockStats";
import { useClientStats } from "@/hooks/dashboard/useClientStats";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const navigate = useNavigate();
  
  console.log("Dashboard: Début du rendu avec nouvelle synchronisation");

  const { todayOrderData, catalogProducts, unpaidInvoices, monthlyExpenses } = useDashboardStatsUpdated();
  const { catalog, totalStock, totalStockPurchaseValue, totalStockSaleValue, globalStockMargin, marginPercentage } = useStockStats();
  const { clientsCount, supplierPayments } = useClientStats();

  console.log("Dashboard: Données récupérées avec synchronisation mise à jour", {
    todayOrderData: todayOrderData?.length || 0,
    catalogProducts: catalogProducts?.length || 0,
    unpaidInvoices: unpaidInvoices?.length || 0,
    monthlyExpenses: monthlyExpenses?.length || 0,
    catalog: catalog?.length || 0,
    clientsCount,
    supplierPayments
  });

  // Fetch financial data avec la nouvelle structure des tables
  const { data: financialData, error: financialError, isLoading: financialLoading } = useQuery({
    queryKey: ['financial-situation-updated'],
    queryFn: async () => {
      try {
        console.log("Dashboard: Récupération des données financières mises à jour");
        
        // Get credit balance from multiple sources
        const { data: paidOrders, error: creditError1 } = await supabase
          .from('orders')
          .select('paid_amount')
          .eq('payment_status', 'paid');

        const { data: paidInvoices, error: creditError2 } = await supabase
          .from('invoices')
          .select('paid_amount')
          .eq('payment_status', 'paid');

        const { data: paidSalesInvoices, error: creditError3 } = await supabase
          .from('sales_invoices')
          .select('paid_amount')
          .eq('payment_status', 'paid');

        if (creditError1) console.error("Erreur orders:", creditError1);
        if (creditError2) console.error("Erreur invoices:", creditError2);
        if (creditError3) console.error("Erreur sales_invoices:", creditError3);

        // Get debit balance from multiple sources
        const { data: unpaidOrders, error: debitError1 } = await supabase
          .from('orders')
          .select('remaining_amount')
          .in('payment_status', ['pending', 'partial']);

        const { data: unpaidInvoicesData, error: debitError2 } = await supabase
          .from('invoices')
          .select('remaining_amount')
          .in('payment_status', ['pending', 'partial']);

        const { data: unpaidSalesInvoicesData, error: debitError3 } = await supabase
          .from('sales_invoices')
          .select('remaining_amount')
          .in('payment_status', ['pending', 'partial']);

        if (debitError1) console.error("Erreur unpaid orders:", debitError1);
        if (debitError2) console.error("Erreur unpaid invoices:", debitError2);
        if (debitError3) console.error("Erreur unpaid sales_invoices:", debitError3);

        // Calculate totals
        const creditBalance = [
          ...(Array.isArray(paidOrders) ? paidOrders : []),
          ...(Array.isArray(paidInvoices) ? paidInvoices : []),
          ...(Array.isArray(paidSalesInvoices) ? paidSalesInvoices : [])
        ].reduce((sum, item) => sum + (item.paid_amount || 0), 0);
          
        const debitBalance = [
          ...(Array.isArray(unpaidOrders) ? unpaidOrders : []),
          ...(Array.isArray(unpaidInvoicesData) ? unpaidInvoicesData : []),
          ...(Array.isArray(unpaidSalesInvoicesData) ? unpaidSalesInvoicesData : [])
        ].reduce((sum, item) => sum + (item.remaining_amount || 0), 0);
          
        const netBalance = creditBalance - debitBalance;

        console.log("Dashboard: Données financières calculées avec nouvelle structure", {
          creditBalance,
          debitBalance,
          netBalance
        });

        return {
          creditBalance,
          debitBalance,
          netBalance
        };
      } catch (error) {
        console.error("Erreur dans la requête financière mise à jour:", error);
        throw error;
      }
    },
    retry: 1
  });

  if (financialError) {
    console.error("Erreur financière mise à jour:", financialError);
  }

  // Calculate daily margin based on actual sales
  const calculateDailyMargin = () => {
    if (!Array.isArray(todayOrderData) || !Array.isArray(catalogProducts)) return 0;
    
    let totalMargin = 0;
    
    todayOrderData.forEach(order => {
      if (!order.order_items || !Array.isArray(order.order_items)) return;
      
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

  // Calculate totals with proper array checks
  const todaySales = Array.isArray(todayOrderData) 
    ? todayOrderData.reduce((sum, order) => sum + (order.final_total || 0), 0) 
    : 0;
    
  const todayMargin = calculateDailyMargin();
  
  const unpaidAmount = Array.isArray(unpaidInvoices)
    ? unpaidInvoices.reduce((sum, invoice) => sum + (invoice.remaining_amount || 0), 0) 
    : 0;
    
  const monthlyExpensesTotal = Array.isArray(monthlyExpenses)
    ? monthlyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0) 
    : 0;

  const handleUnpaidInvoicesClick = () => {
    navigate('/sales-invoices?filter=unpaid');
  };

  console.log("Dashboard: Calculs terminés avec nouvelle synchronisation", {
    todaySales,
    todayMargin,
    unpaidAmount,
    monthlyExpensesTotal
  });

  if (financialLoading) {
    console.log("Dashboard: Chargement des données financières mises à jour");
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Chargement du tableau de bord synchronisé...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  console.log("Dashboard: Rendu final avec synchronisation complète");

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gradient animate-fade-in">
            Tableau de Bord
          </h1>
          <p className="text-muted-foreground animate-fade-in delay-100">
            Bienvenue sur votre tableau de bord Ets AICHA BUSINESS ALPHAYA (Synchronisé ✓)
          </p>
        </div>

        <DashboardMetrics
          todaySales={todaySales}
          todayMargin={todayMargin}
          unpaidAmount={unpaidAmount}
          monthlyExpensesTotal={monthlyExpensesTotal}
          catalogLength={Array.isArray(catalog) ? catalog.length : 0}
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

        <div className="grid gap-4 md:gap-6 grid-cols-1 xl:grid-cols-2 w-full animate-fade-in delay-500">
          <SalesChart />
          <ProductsChart />
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 xl:grid-cols-2 w-full animate-fade-in delay-600">
          <CategoryChart />
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  );
}
