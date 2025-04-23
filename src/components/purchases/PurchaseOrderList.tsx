
import { PurchaseOrderTable } from "./PurchaseOrderTable";
import { PurchaseOrder } from "@/types/purchase-order";

interface PurchaseOrderListProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  processingOrderId: string | null;
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string) => Promise<void>;
  onPrint: (order: PurchaseOrder) => void;
}

export function PurchaseOrderList({
  orders,
  isLoading,
  processingOrderId,
  onApprove,
  onDelete,
  onEdit,
  onPrint
}: PurchaseOrderListProps) {
  // Log for debugging
  console.log("PurchaseOrderList renders with orders:", orders?.length || 0);
  
  return (
    <PurchaseOrderTable
      orders={orders}
      isLoading={isLoading}
      onApprove={onApprove}
      onDelete={onDelete}
      onEdit={onEdit}
      onPrint={onPrint}
      processingOrderId={processingOrderId}
    />
  );
}
