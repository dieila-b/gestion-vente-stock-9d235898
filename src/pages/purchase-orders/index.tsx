
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PurchaseOrderHeader } from "@/components/purchases/PurchaseOrderHeader";
import { PurchaseOrderList } from "@/components/purchases/PurchaseOrderList";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { toast } from "sonner";
import { type PurchaseOrder } from "@/types/purchase-order";

export default function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const { 
    orders: rawOrders, 
    isLoading,
    processingOrderId,
    handleApprove,
    handleDelete,
    handleEdit,
    handlePrint,
    handleCreateDeliveryNote,
    EditDialog,
    isDialogOpen,
    refreshOrders
  } = usePurchaseOrders();

  // Initial data loading
  useEffect(() => {
    if (!initialLoadDone) {
      console.log("Purchase orders page mounted, refreshing orders");
      refreshOrders()
        .then(() => {
          console.log("Initial orders load complete");
          setInitialLoadDone(true);
        })
        .catch(error => {
          console.error("Error refreshing orders on mount:", error);
          toast.error("Erreur lors du chargement initial des bons de commande");
        });
    }
  }, [initialLoadDone, refreshOrders]);

  // After dialog close, refresh orders
  useEffect(() => {
    const refreshAfterEdit = async () => {
      try {
        console.log("Refreshing orders after dialog interaction");
        await refreshOrders();
      } catch (error) {
        console.error("Error refreshing orders after edit:", error);
      }
    };
    
    // We need to refresh when the dialog closes (isDialogOpen changes from true to false)
    if (!isDialogOpen) {
      console.log("Dialog is closed, refreshing orders");
      refreshAfterEdit();
    }
  }, [isDialogOpen, refreshOrders]);

  // Filter purchase orders
  useEffect(() => {
    console.log("Raw orders available for processing:", rawOrders?.length || 0);
    
    if (!rawOrders) {
      console.log("No orders to process - rawOrders is undefined");
      setFilteredOrders([]);
      return;
    }
    
    try {
      // Apply search filter
      const filtered = searchQuery.trim() 
        ? rawOrders.filter(order => 
            (order.order_number?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (order.supplier?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
          )
        : [...rawOrders]; // Copy all purchase orders
      
      console.log("Filtered orders:", filtered.length);
      
      setFilteredOrders(filtered);
    } catch (error) {
      console.error("Error processing orders:", error);
      toast.error("Erreur lors du traitement des bons de commande");
      setFilteredOrders([]);
    }
  }, [rawOrders, searchQuery]);

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
              isLoading={isLoading || !initialLoadDone}
              onApprove={handleApprove}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onPrint={handlePrint}
              onCreateDeliveryNote={handleCreateDeliveryNote}
              processingOrderId={processingOrderId}
            />
          </CardContent>
        </Card>
        
        {/* Render EditDialog component */}
        <EditDialog />
      </div>
    </DashboardLayout>
  );
}
