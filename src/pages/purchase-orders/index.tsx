
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PurchaseOrderHeader } from "@/components/purchases/PurchaseOrderHeader";
import { PurchaseOrderList } from "@/components/purchases/PurchaseOrderList";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { usePurchasePrint } from "@/hooks/purchases/use-purchase-print";
import { PurchaseOrder } from "@/types/purchase-order";
import { toast } from "sonner";

export default function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  
  const { 
    orders: rawOrders, 
    isLoading,
    handleApprove,
    handleDelete,
    handleEdit,
    EditDialog,
    refreshOrders
  } = usePurchaseOrders();
  
  const { printPurchaseOrder } = usePurchasePrint();

  // Initial data load
  useEffect(() => {
    refreshOrders();
  }, []);

  // Process and filter orders
  useEffect(() => {
    console.log("Raw orders available for processing:", rawOrders?.length || 0);
    
    if (!rawOrders || rawOrders.length === 0) {
      console.log("No orders to process");
      setFilteredOrders([]);
      return;
    }
    
    try {
      // Apply search filter
      const filtered = rawOrders.filter(order => 
        order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      console.log("Filtered orders:", filtered.length);
      
      // Check if items are properly loaded
      filtered.forEach((order, index) => {
        if (index < 3) { // Only log first 3 orders to avoid console spam
          console.log(`Order ${index} (${order.order_number}) has ${order.items?.length || 0} items`);
          if (order.items && order.items.length > 0) {
            console.log(`First item: ${order.items[0].product?.name || 'No product name'}`);
          }
        }
      });
      
      setFilteredOrders(filtered);
    } catch (error) {
      console.error("Error processing orders:", error);
      toast.error("Erreur lors du traitement des bons de commande");
      setFilteredOrders([]);
    }
  }, [rawOrders, searchQuery]);

  // Handle print action
  const handlePrint = (order: PurchaseOrder) => {
    console.log("Printing order:", order.id, order.order_number);
    console.log("Printing order with items:", order.items?.length || 0);
    
    // If order doesn't have items, try to find the complete order from rawOrders
    if (!order.items || order.items.length === 0) {
      console.log("Order has no items, searching for complete order...");
      const completeOrder = rawOrders.find(o => o.id === order.id);
      if (completeOrder && completeOrder.items && completeOrder.items.length > 0) {
        console.log("Found complete order with items:", completeOrder.items.length);
        printPurchaseOrder(completeOrder);
      } else {
        console.log("Could not find items for order, printing as is");
        printPurchaseOrder(order);
      }
    } else {
      printPurchaseOrder(order);
    }
  };

  // Wrapping the callbacks in promises to match the expected type
  const handleApprovePromise = async (id: string): Promise<void> => {
    return handleApprove(id);
  };

  const handleDeletePromise = async (id: string): Promise<void> => {
    return handleDelete(id);
  };

  const handleEditPromise = async (id: string): Promise<void> => {
    handleEdit(id);
    return Promise.resolve();
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
              onApprove={handleApprovePromise}
              onDelete={handleDeletePromise}
              onEdit={handleEditPromise}
              onPrint={handlePrint}
            />
          </CardContent>
        </Card>
        
        {/* Render the EditDialog component */}
        <EditDialog />
      </div>
    </DashboardLayout>
  );
}
