
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
    // Create a supplier object with required properties
    let supplierWithContacts: Supplier = {
      ...order.supplier,
      id: order.supplier_id,
      // Check if supplier.phone exists in the type before accessing it
      phone: null,
      email: null,
      contact: null,
      address: null,
      website: null,
      products_count: null,
      orders_count: null,
      reliability: null,
      status: "Actif",
      rating: null,
      last_delivery: null,
      product_categories: null,
      performance_score: null,
      quality_score: null,
      delivery_score: null,
      pending_orders: null,
      total_revenue: null,
      verified: null,
      created_at: null,
      updated_at: null
    };
    
    // Create enhanced order object with supplier contact info
    const enhancedOrder = {
      ...order,
      supplier: supplierWithContacts
    };
    
    // Set the selected order and show the receipt dialog
    setSelectedOrder(enhancedOrder);
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
