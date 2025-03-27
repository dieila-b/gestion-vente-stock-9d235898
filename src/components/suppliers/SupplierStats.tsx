
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, Check, AlertTriangle, Package } from "lucide-react";
import type { Supplier } from "@/types/supplier";

interface SupplierStatsProps {
  suppliers: Supplier[];
}

export const SupplierStats = ({ suppliers }: SupplierStatsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <StatsCard
        title="Total Fournisseurs"
        value={suppliers.length.toString()}
        icon={Users}
        trend={{ value: 0, isPositive: true }}
      />
      <StatsCard
        title="Fournisseurs Actifs"
        value={suppliers.filter((s) => s.status === "Actif").length.toString()}
        icon={Check}
        trend={{ value: 0, isPositive: true }}
      />
      <StatsCard
        title="En Attente"
        value={suppliers.filter((s) => s.status === "En attente").length.toString()}
        icon={AlertTriangle}
        trend={{ value: 0, isPositive: false }}
      />
      <StatsCard
        title="Commandes en Cours"
        value={suppliers.reduce((acc, s) => acc + (s.pending_orders || 0), 0).toString()}
        icon={Package}
        trend={{ value: 0, isPositive: true }}
      />
    </div>
  );
};

