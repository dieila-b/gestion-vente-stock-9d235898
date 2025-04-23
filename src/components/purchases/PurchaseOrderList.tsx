
import { PurchaseOrderTable } from "./PurchaseOrderTable";
import { PurchaseOrder } from "@/types/purchase-order";

interface PurchaseOrderListProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
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
  // Log for debugging
  console.log("Orders in PurchaseOrderList:", orders);
  console.log("First order items:", orders && orders.length > 0 ? orders[0].items : "No orders");
  
  return (
    <PurchaseOrderTable
      orders={orders}
      isLoading={isLoading}
      onApprove={onApprove}
      onDelete={onDelete}
      onEdit={onEdit}
      onPrint={onPrint}
    />
  );
}
