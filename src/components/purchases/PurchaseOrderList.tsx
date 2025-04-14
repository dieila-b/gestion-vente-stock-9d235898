
import { PurchaseOrderTable } from "@/components/purchases/PurchaseOrderTable";
import type { PurchaseOrder } from "@/types/purchaseOrder";

interface PurchaseOrderListProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onPrint: (order: PurchaseOrder) => void;
}

export function PurchaseOrderList({
  orders,
  isLoading,
  onApprove,
  onDelete,
  onEdit,
  onPrint
}: PurchaseOrderListProps) {
  return (
    <div className="space-y-4">
      <PurchaseOrderTable
        orders={orders}
        isLoading={isLoading}
        onApprove={onApprove}
        onDelete={onDelete}
        onEdit={onEdit}
        onPrint={onPrint}
      />
    </div>
  );
}
