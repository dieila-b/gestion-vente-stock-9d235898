
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { useDashboardStatsUpdated } from "@/hooks/dashboard/useDashboardStatsUpdated";
import { useStockStats } from "@/hooks/dashboard/useStockStats";
import { useClientStats } from "@/hooks/dashboard/useClientStats";
import { useFinancialData } from "@/hooks/dashboard/useFinancialData";
import { useDashboardCalculations } from "@/hooks/dashboard/useDashboardCalculations";
import { useNavigate } from "react-router-dom";
import { safeNumber } from "@/utils/data-safe/safe-access";

export default function Dashboard() {
  const navigate = useNavigate();
  
  console.log("Dashboard: Début du rendu avec gestion d'erreur ultra-robuste");

  // Utilisation des hooks sécurisés
  const { todayOrderData, catalogProducts, unpaidInvoices, monthlyExpenses } = useDashboardStatsUpdated();
  const { catalog, totalStock, totalStockPurchaseValue, totalStockSaleValue, globalStockMargin, marginPercentage } = useStockStats();
  const { clientsCount, supplierPayments } = useClientStats();
  const { financialData, financialLoading } = useFinancialData();

  // Calculs des métriques du dashboard avec conversion sécurisée
  const { todaySales, todayMargin, unpaidAmount, monthlyExpensesTotal } = useDashboardCalculations(
    todayOrderData,
    catalogProducts,
    unpaidInvoices,
    monthlyExpenses
  );

  const handleUnpaidInvoicesClick = () => {
    navigate('/sales-invoices?filter=unpaid');
  };

  // Affichage de chargement sécurisé
  if (financialLoading) {
    return <DashboardLoading />;
  }

  console.log("Dashboard: Rendu final avec tous les calculs sécurisés");

  return (
    <DashboardLayout>
      <DashboardContent
        todaySales={safeNumber(todaySales)}
        todayMargin={safeNumber(todayMargin)}
        unpaidAmount={safeNumber(unpaidAmount)}
        monthlyExpensesTotal={safeNumber(monthlyExpensesTotal)}
        catalog={catalog}
        totalStock={safeNumber(totalStock)}
        totalStockPurchaseValue={safeNumber(totalStockPurchaseValue)}
        totalStockSaleValue={safeNumber(totalStockSaleValue)}
        globalStockMargin={safeNumber(globalStockMargin)}
        marginPercentage={safeNumber(marginPercentage)}
        clientsCount={safeNumber(clientsCount)}
        supplierPayments={safeNumber(supplierPayments)}
        financialData={financialData}
        onUnpaidInvoicesClick={handleUnpaidInvoicesClick}
      />
    </DashboardLayout>
  );
}
