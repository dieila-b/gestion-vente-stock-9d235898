
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { FinancialSituation } from "@/components/dashboard/FinancialSituation";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ProductsChart } from "@/components/dashboard/ProductsChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { safeNumber, safeArray } from "@/utils/data-safe/safe-access";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardContentProps {
  todaySales: number;
  todayMargin: number;
  unpaidAmount: number;
  monthlyExpensesTotal: number;
  catalog: any[];
  totalStock: number;
  totalStockPurchaseValue: number;
  totalStockSaleValue: number;
  globalStockMargin: number;
  marginPercentage: number;
  clientsCount: number;
  supplierPayments: number;
  financialData: any;
  onUnpaidInvoicesClick: () => void;
}

export function DashboardContent({
  todaySales,
  todayMargin,
  unpaidAmount,
  monthlyExpensesTotal,
  catalog,
  totalStock,
  totalStockPurchaseValue,
  totalStockSaleValue,
  globalStockMargin,
  marginPercentage,
  clientsCount,
  supplierPayments,
  financialData,
  onUnpaidInvoicesClick
}: DashboardContentProps) {
  
  console.log("DashboardContent: Rendu avec les données:", {
    todaySales,
    todayMargin,
    catalogLength: catalog?.length,
    financialData
  });

  return (
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
            todaySales={safeNumber(todaySales)}
            todayMargin={safeNumber(todayMargin)}
            unpaidAmount={safeNumber(unpaidAmount)}
            monthlyExpensesTotal={safeNumber(monthlyExpensesTotal)}
            catalogLength={safeArray(catalog).length}
            totalStock={safeNumber(totalStock)}
            totalStockPurchaseValue={safeNumber(totalStockPurchaseValue)}
            totalStockSaleValue={safeNumber(totalStockSaleValue)}
            globalStockMargin={safeNumber(globalStockMargin)}
            marginPercentage={safeNumber(marginPercentage)}
            clientsCount={safeNumber(clientsCount, 0)}
            supplierPayments={safeNumber(supplierPayments, 0)}
            onUnpaidInvoicesClick={onUnpaidInvoicesClick}
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
  );
}
