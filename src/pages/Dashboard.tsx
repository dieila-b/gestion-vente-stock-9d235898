
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
import { db } from "@/utils/db-core";
import { safeArray, safeNumber, safeOrder, safeOrderItem, safeCatalogProduct } from "@/utils/data-safe/safe-access";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();
  
  console.log("Dashboard: Début du rendu avec gestion d'erreur ultra-robuste");

  // Utilisation des hooks sécurisés
  const { todayOrderData, catalogProducts, unpaidInvoices, monthlyExpenses } = useDashboardStatsUpdated();
  const { catalog, totalStock, totalStockPurchaseValue, totalStockSaleValue, globalStockMargin, marginPercentage } = useStockStats();
  const { clientsCount, supplierPayments } = useClientStats();

  // Données financières avec gestion d'erreur ultra-robuste
  const { data: financialData, error: financialError, isLoading: financialLoading } = useQuery({
    queryKey: ['financial-situation-ultra-safe'],
    queryFn: async () => {
      try {
        console.log("Dashboard: Récupération des données financières ultra-sécurisées");
        
        // Récupération des commandes payées
        const paidOrders = await db.query(
          'orders',
          q => q.select('paid_amount').eq('payment_status', 'paid'),
          []
        );

        // Récupération des commandes impayées
        const unpaidOrders = await db.query(
          'orders',
          q => q.select('remaining_amount').in('payment_status', ['pending', 'partial']),
          []
        );

        // Calculs sécurisés
        const creditBalance = safeArray(paidOrders).reduce((sum, item) => {
          return sum + safeNumber(item?.paid_amount, 0);
        }, 0);
          
        const debitBalance = safeArray(unpaidOrders).reduce((sum, item) => {
          return sum + safeNumber(item?.remaining_amount, 0);
        }, 0);
          
        const netBalance = creditBalance - debitBalance;

        console.log("Dashboard: Données financières calculées en sécurité", {
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

  // Calcul de la marge quotidienne sécurisée
  const calculateDailyMargin = () => {
    try {
      const safeOrders = safeArray(todayOrderData);
      const safeProducts = safeArray(catalogProducts);
      
      if (safeOrders.length === 0 || safeProducts.length === 0) return 0;
      
      let totalMargin = 0;
      
      safeOrders.forEach(orderData => {
        const order = safeOrder(orderData);
        if (!order) return;
        
        const orderItems = safeArray(order.order_items);
        
        orderItems.forEach(itemData => {
          const item = safeOrderItem(itemData);
          if (!item) return;
          
          const catalogProductData = safeProducts.find(p => p?.id === item.product_id);
          const catalogProduct = safeCatalogProduct(catalogProductData);
          if (!catalogProduct) return;
          
          const salesPrice = catalogProduct.price;
          const purchasePrice = catalogProduct.purchase_price;
          const quantity = item.quantity;
          
          totalMargin += (salesPrice - purchasePrice) * quantity;
        });
      });
      
      return totalMargin;
    } catch (error) {
      console.error("Erreur dans calculateDailyMargin:", error);
      return 0;
    }
  };

  // Calculs sécurisés avec vérifications
  const todaySales = safeArray(todayOrderData).reduce((sum, orderData) => {
    const order = safeOrder(orderData);
    return sum + (order ? order.final_total : 0);
  }, 0);
    
  const todayMargin = calculateDailyMargin();
  
  const unpaidAmount = safeArray(unpaidInvoices).reduce((sum, invoice) => {
    return sum + safeNumber(invoice?.remaining_amount, 0);
  }, 0);
    
  const monthlyExpensesTotal = safeArray(monthlyExpenses).reduce((sum, expense) => {
    return sum + safeNumber(expense?.amount, 0);
  }, 0);

  const handleUnpaidInvoicesClick = () => {
    navigate('/sales-invoices?filter=unpaid');
  };

  // Affichage de chargement sécurisé
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

  console.log("Dashboard: Rendu final avec tous les calculs sécurisés");

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
              catalogLength={safeArray(catalog).length}
              totalStock={totalStock}
              totalStockPurchaseValue={totalStockPurchaseValue}
              totalStockSaleValue={totalStockSaleValue}
              globalStockMargin={globalStockMargin}
              marginPercentage={marginPercentage}
              clientsCount={safeNumber(clientsCount, 0)}
              supplierPayments={safeNumber(supplierPayments, 0)}
              onUnpaidInvoicesClick={handleUnpaidInvoicesClick}
            />
          </ErrorBoundary>

          <ErrorBoundary>
            <FinancialSituation
              creditBalance={safeNumber(financialData?.creditBalance, 0)}
              debitBalance={safeNumber(financialData?.debitBalance, 0)}
              netBalance={safeNumber(financialData?.netBalance, 0)}
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
