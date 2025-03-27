
import { SupplierPerformanceCard } from "./SupplierPerformanceCard";
import type { Supplier } from "@/types/supplier";

interface SupplierPerformanceListProps {
  suppliers: Supplier[];
}

export const SupplierPerformanceList = ({ suppliers }: SupplierPerformanceListProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {suppliers.map((supplier) => (
        <SupplierPerformanceCard key={supplier.id} supplier={supplier} />
      ))}
    </div>
  );
};
