
import { PurchaseOrderTable } from "./PurchaseOrderTable";
import { PurchaseOrder } from "@/types/purchase-order";

interface PurchaseOrderListProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string) => Promise<void>;
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
  
  if (orders && orders.length > 0) {
    console.log("First order items:", orders[0].items?.length || 0);
    console.log("First order details:", {
      id: orders[0].id,
      order_number: orders[0].order_number,
      item_count: orders[0].items?.length || 0
    });
  } else {
    console.log("No orders available");
  }
  
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
