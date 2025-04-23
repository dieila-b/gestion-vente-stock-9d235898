
import { PurchaseOrderTable } from "./PurchaseOrderTable";
import { Loader } from "lucide-react";
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
  console.log("PurchaseOrderList renders with orders:", orders?.length || 0, "processingId:", processingOrderId);
  
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Chargement des bons de commande...</span>
      </div>
    );
  }
  
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-gray-500">Aucun bon de commande trouvé</p>
      </div>
    );
  }
  
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
