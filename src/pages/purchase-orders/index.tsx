
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PurchaseOrderHeader } from "@/components/purchases/PurchaseOrderHeader";
import { PurchaseOrderList } from "@/components/purchases/PurchaseOrderList";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { usePurchasePrint } from "@/hooks/purchases/use-purchase-print";
import { EditPurchaseOrderDialog } from "@/components/purchases/edit/EditPurchaseOrderDialog";
import type { PurchaseOrder } from "@/types/purchase-order";
import { isSelectQueryError } from "@/utils/type-utils";
import { toast } from "sonner";

export default function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const location = useLocation();
  
  const { 
    orders: rawOrders, 
    isLoading,
    handleApprove,
    handleDelete,
    handleEdit
  } = usePurchaseOrders();
  
  const { printPurchaseOrder } = usePurchasePrint();

  // Check for order ID in location state (when redirected from edit button)
  useEffect(() => {
    const state = location.state as { editOrderId?: string } | null;
    if (state?.editOrderId) {
      setSelectedOrderId(state.editOrderId);
      setEditDialogOpen(true);
      
      // Clear the state so we don't reopen the dialog on navigation
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  // Process and filter orders
  useEffect(() => {
    console.log("Raw orders for processing:", rawOrders);
    
    if (!rawOrders || rawOrders.length === 0) {
      console.log("No orders to process");
      setFilteredOrders([]);
      return;
    }
    
    try {
      const processedOrders = rawOrders.map(order => {
        // Ensure supplier object is valid
        let supplier = order.supplier;
        if (!supplier || isSelectQueryError(supplier)) {
          supplier = { 
            id: order.supplier_id || '',
            name: 'Fournisseur inconnu', 
            phone: '', 
            email: '' 
          };
        }
        
        // Ensure all necessary properties are present
        return {
          ...order,
          supplier,
          deleted: false,
          items: Array.isArray(order.items) ? order.items : [],
          // Add defaults for required fields
          payment_status: order.payment_status || 'pending',
          status: order.status || 'draft',
          total_amount: order.total_amount || 0,
          order_number: order.order_number || `PO-${order.id.slice(0, 8)}`
        } as PurchaseOrder;
      });
      
      console.log("Processed orders:", processedOrders);
      
      // Apply search filter
      const filtered = processedOrders.filter(order => 
        order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      console.log("Filtered orders:", filtered);
      setFilteredOrders(filtered);
    } catch (error) {
      console.error("Error processing orders:", error);
      toast.error("Erreur lors du traitement des bons de commande");
      setFilteredOrders([]);
    }
  }, [rawOrders, searchQuery]);

  // Handle print action
  const handlePrint = (order: PurchaseOrder) => {
    printPurchaseOrder(order);
  };
  
  // Handle closing edit dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedOrderId(null);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <PurchaseOrderHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <Card className="mt-6">
          <CardContent className="pt-6">
            <PurchaseOrderList 
              orders={filteredOrders}
              isLoading={isLoading}
              onApprove={handleApprove}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onPrint={handlePrint}
            />
          </CardContent>
        </Card>
        
        <EditPurchaseOrderDialog 
          open={editDialogOpen} 
          onClose={handleCloseEditDialog} 
          orderId={selectedOrderId} 
        />
      </div>
    </DashboardLayout>
  );
}
