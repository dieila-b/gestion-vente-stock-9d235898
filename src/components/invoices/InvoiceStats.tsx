
import { CircleDollarSign, FileLineChart, FileText } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatGNF } from "@/lib/currency";

export const InvoiceStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard
        title="Chiffre d'affaires"
        value={formatGNF(0)}
        icon={CircleDollarSign}
        trend={{ value: 0, isPositive: true }}
      />
      <StatsCard
        title="Factures émises"
        value="0"
        icon={FileLineChart}
      />
      <StatsCard
        title="En attente"
        value="0"
        icon={FileText}
      />
    </div>
  );
};
