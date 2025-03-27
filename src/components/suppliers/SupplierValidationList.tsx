
import { SupplierValidationCard } from "./SupplierValidationCard";
import type { Supplier } from "@/types/supplier";

interface SupplierValidationListProps {
  suppliers: Supplier[];
  onValidate: (supplierId: string) => void;
  onReject: (supplierId: string) => void;
}

export const SupplierValidationList = ({
  suppliers,
  onValidate,
  onReject,
}: SupplierValidationListProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {suppliers.map((supplier) => (
        <SupplierValidationCard
          key={supplier.id}
          supplier={supplier}
          onValidate={onValidate}
          onReject={onReject}
        />
      ))}
    </div>
  );
};
