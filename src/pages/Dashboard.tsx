
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ProductsChart } from "@/components/dashboard/ProductsChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { FinancialSituation } from "@/components/dashboard/FinancialSituation";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useDashboardStatsUpdated } from "@/hooks/dashboard/useDashboardStatsUpdated";
import { useStockStats } from "@/hooks/dashboard/useStockStats";
import { useClientStats } from "@/hooks/dashboard/useClientStats";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();
  
  console.log("Dashboard: Début du rendu avec gestion d'erreur améliorée");

  const { todayOrderData, catalogProducts, unpaidInvoices, monthlyExpenses } = useDashboardStatsUpdated();
  const { catalog, totalStock, totalStockPurchaseValue, totalStockSaleValue, globalStockMargin, marginPercentage } = useStockStats();
  const { clientsCount, supplierPayments } = useClientStats();

  console.log("Dashboard: Données récupérées", {
    todayOrderData: todayOrderData?.length || 0,
    catalogProducts: catalogProducts?.length || 0,
    unpaidInvoices: unpaidInvoices?.length || 0,
    monthlyExpenses: monthlyExpenses?.length || 0,
    catalog: catalog?.length || 0,
    clientsCount,
    supplierPayments
  });

  // Fetch financial data avec gestion d'erreur robuste
  const { data: financialData, error: financialError, isLoading: financialLoading } = useQuery({
    queryKey: ['financial-situation-safe'],
    queryFn: async () => {
      try {
        console.log("Dashboard: Récupération des données financières sécurisées");
        
        // Get credit balance from orders
        const { data: paidOrders, error: creditError1 } = await supabase
          .from('orders')
          .select('paid_amount')
          .eq('payment_status', 'paid');

        // Get debit balance from orders
        const { data: unpaidOrders, error: debitError1 } = await supabase
          .from('orders')
          .select('remaining_amount')
          .in('payment_status', ['pending', 'partial']);

        if (creditError1) console.error("Erreur orders payées:", creditError1);
        if (debitError1) console.error("Erreur orders impayées:", debitError1);

        // Calculate totals with safe fallbacks
        const creditBalance = Array.isArray(paidOrders) 
          ? paidOrders.reduce((sum, item) => sum + (item.paid_amount || 0), 0)
          : 0;
          
        const debitBalance = Array.isArray(unpaidOrders)
          ? unpaidOrders.reduce((sum, item) => sum + (item.remaining_amount || 0), 0)
          : 0;
          
        const netBalance = creditBalance - debitBalance;

        console.log("Dashboard: Données financières calculées", {
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
        console.error("Erreur dans la requête financière:", error);
        return {
          creditBalance: 0,
          debitBalance: 0,
          netBalance: 0
        };
      }
    },
    retry: 2,
    staleTime: 30000
  });

  if (financialError) {
    console.error("Erreur financière:", financialError);
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
        
        const salesPrice = catalogProduct.price || 0;
        const purchasePrice = catalogProduct.purchase_price || 0;
        const quantity = item.quantity || 0;
        
        totalMargin += (salesPrice - purchasePrice) * quantity;
      });
    });
    
    return totalMargin;
  };

  // Calculate totals with proper array checks and safe fallbacks
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

  console.log("Dashboard: Calculs terminés", {
    todaySales,
    todayMargin,
    unpaidAmount,
    monthlyExpensesTotal
  });

  if (financialLoading) {
    console.log("Dashboard: Chargement des données financières");
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Chargement du tableau de bord...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  console.log("Dashboard: Rendu final");

  return (
    <DashboardLayout>
      <ErrorBoundary fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold">Erreur de chargement du tableau de bord</h2>
            <p className="text-muted-foreground">Une erreur s'est produite lors du chargement des données</p>
            <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </div>
      }>
        <div className="space-y-6 w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gradient animate-fade-in">
              Tableau de Bord
            </h1>
            <p className="text-muted-foreground animate-fade-in delay-100">
              Bienvenue sur votre tableau de bord Ets AICHA BUSINESS ALPHAYA
            </p>
          </div>

          <ErrorBoundary>
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
          </ErrorBoundary>

          <ErrorBoundary>
            <FinancialSituation
              creditBalance={financialData?.creditBalance || 0}
              debitBalance={financialData?.debitBalance || 0}
              netBalance={financialData?.netBalance || 0}
            />
          </ErrorBoundary>

          <div className="grid gap-4 md:gap-6 grid-cols-1 xl:grid-cols-2 w-full animate-fade-in delay-500">
            <ErrorBoundary>
              <SalesChart />
            </ErrorBoundary>
            <ErrorBoundary>
              <ProductsChart />
            </ErrorBoundary>
          </div>

          <div className="grid gap-4 md:gap-6 grid-cols-1 xl:grid-cols-2 w-full animate-fade-in delay-600">
            <ErrorBoundary>
              <CategoryChart />
            </ErrorBoundary>
            <ErrorBoundary>
              <RecentActivity />
            </ErrorBoundary>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
}
