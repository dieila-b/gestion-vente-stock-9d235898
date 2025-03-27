
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PurchaseOrderReceipt } from "@/components/purchases/PurchaseOrderReceipt";
import { PurchaseOrderHeader } from "@/components/purchases/PurchaseOrderHeader";
import { PurchaseOrderTable } from "@/components/purchases/PurchaseOrderTable";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import type { PurchaseOrder, PurchaseOrderItem } from "@/types/purchaseOrder";
import type { Supplier } from "@/types/supplier";

const PurchaseOrderPage = () => {
  const { orders, isLoading, handleApprove, handleDelete, handleEdit } = usePurchaseOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const filteredOrders = orders?.filter(order => 
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handlePrint = (order: PurchaseOrder) => {
    // Set the selected order and show the receipt dialog
    setSelectedOrder(order);
    setShowReceipt(true);
  };

  return (
    <div className="p-6 space-y-6">
      <PurchaseOrderHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <PurchaseOrderTable
        orders={filteredOrders}
        isLoading={isLoading}
        onApprove={handleApprove}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onPrint={handlePrint}
      />

      {/* Dialog for displaying receipt */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <PurchaseOrderReceipt 
              order={selectedOrder} 
              showPrintButton={true}
              showShareButtons={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrderPage;
