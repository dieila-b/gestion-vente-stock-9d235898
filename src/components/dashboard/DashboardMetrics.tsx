import { StatsCard } from "@/components/dashboard/StatsCard";
import { Package, Wallet, Receipt, TrendingUp, Users, CreditCard, ShoppingBag, LineChart, Boxes, PiggyBank, BaggageClaim, ArrowUpCircle, ArrowDownCircle, ScaleIcon } from "lucide-react";
import { formatGNF } from "@/lib/currency";
import { useNavigate } from "react-router-dom";

interface DashboardMetricsProps {
  todaySales: number;
  todayMargin: number;
  unpaidAmount: number;
  monthlyExpensesTotal: number;
  catalogLength: number;
  totalStock: number;
  totalStockPurchaseValue: number;
  totalStockSaleValue: number;
  globalStockMargin: number;
  marginPercentage: number;
  clientsCount: number;
  supplierPayments: number;
  onUnpaidInvoicesClick?: () => void;
}

export function DashboardMetrics({
  todaySales,
  todayMargin,
  unpaidAmount,
  monthlyExpensesTotal,
  catalogLength,
  totalStock,
  totalStockPurchaseValue,
  totalStockSaleValue,
  globalStockMargin,
  marginPercentage,
  clientsCount,
  supplierPayments,
  onUnpaidInvoicesClick
}: DashboardMetricsProps) {
  const navigate = useNavigate();

  return (
    <>
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 animate-fade-in delay-200">
        <StatsCard
          title="Ventes du Jour"
          value={formatGNF(todaySales)}
          icon={CreditCard}
          trend={{ value: 0, isPositive: true }}
          onClick={() => {}}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/10"
        />
        <StatsCard
          title="Marge du Jour"
          value={formatGNF(todayMargin)}
          icon={TrendingUp}
          trend={{ value: 0, isPositive: true }}
          onClick={() => {}}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10"
        />
        <StatsCard
          title="Factures Impayées"
          value={formatGNF(unpaidAmount)}
          icon={Receipt}
          trend={{ value: 0, isPositive: false }}
          onClick={onUnpaidInvoicesClick}
          className="bg-gradient-to-br from-red-500/10 to-red-600/10 cursor-pointer hover:from-red-500/20 hover:to-red-600/20 transition-all duration-300 transform hover:-translate-y-1"
        />
        <StatsCard
          title="Dépenses du Mois"
          value={formatGNF(monthlyExpensesTotal)}
          icon={Wallet}
          trend={{ value: 0, isPositive: false }}
          onClick={() => navigate('/expenses')}
          className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 cursor-pointer hover:from-orange-500/20 hover:to-orange-600/20 transition-all duration-300 transform hover:-translate-y-1"
        />
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 animate-fade-in delay-300">
        <StatsCard
          title="Articles en Catalogue"
          value={catalogLength?.toString() || "0"}
          icon={Package}
          onClick={() => navigate('/catalog')}
          className="bg-gradient-to-br from-green-500/10 to-green-600/10 py-1 h-[80px] max-w-[180px]"
        />
        <StatsCard
          title="Stock Global"
          value={totalStock.toString()}
          icon={Boxes}
          onClick={() => navigate('/inventory')}
          className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 py-1 h-[80px] max-w-[180px]"
        />
        <StatsCard
          title="Valeur Stock (Achat)"
          value={formatGNF(totalStockPurchaseValue)}
          icon={ShoppingBag}
          onClick={() => navigate('/purchase-order')}
          className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 py-1 h-[80px]"
        />
        <StatsCard
          title="Valeur Stock (Vente)"
          value={formatGNF(totalStockSaleValue)}
          icon={BaggageClaim}
          onClick={() => navigate('/stock-status')}
          className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 py-1 h-[80px]"
        />
        <StatsCard
          title="Marge Globale Stock"
          value={formatGNF(globalStockMargin)}
          icon={PiggyBank}
          trend={{ value: marginPercentage, isPositive: marginPercentage > 0 }}
          onClick={() => navigate('/stock-status')}
          className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 py-1 h-[80px]"
        />
        <StatsCard
          title="Règlements Fournisseurs"
          value={formatGNF(supplierPayments)}
          icon={LineChart}
          onClick={() => navigate('/suppliers')}
          className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 py-1 h-[80px]"
        />
      </div>
    </>
  );
}
