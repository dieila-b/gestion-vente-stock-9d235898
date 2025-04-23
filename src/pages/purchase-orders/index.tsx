
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
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
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

  // Wrapper functions to ensure Promise<void> return and manage processing state
  const handleApproveWrapper = async (id: string): Promise<void> => {
    try {
      setProcessingOrderId(id);
      console.log("Calling handleApprove with ID:", id);
      await handleApprove(id);
      console.log("Approve completed for ID:", id);
      
      // Refresh the list to show updated state
      await refreshOrders();
    } catch (error) {
      console.error("Error in approval wrapper:", error);
      toast.error("Erreur lors de l'approbation");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleDeleteWrapper = async (id: string): Promise<void> => {
    try {
      setProcessingOrderId(id);
      await handleDelete(id);
      await refreshOrders();
    } catch (error) {
      console.error("Error in delete wrapper:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleEditWrapper = async (id: string): Promise<void> => {
    try {
      setProcessingOrderId(id);
      console.log("Calling edit wrapper with ID:", id);
      await handleEdit(id);
    } catch (error) {
      console.error("Error in edit wrapper:", error);
      toast.error("Erreur lors de l'édition");
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Handle purchase order printing
  const handlePrint = (order: PurchaseOrder) => {
    console.log("Printing order:", order.id, order.order_number);
    try {
      printPurchaseOrder(order);
    } catch (error) {
      console.error("Error printing purchase order:", error);
      toast.error("Erreur lors de l'impression");
    }
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
              isLoading={isLoading || !initialLoadDone}
              onApprove={handleApproveWrapper}
              onDelete={handleDeleteWrapper}
              onEdit={handleEditWrapper}
              onPrint={handlePrint}
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
