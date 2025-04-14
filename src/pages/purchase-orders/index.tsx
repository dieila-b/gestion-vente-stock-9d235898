
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PurchaseOrderHeader } from "@/components/purchases/PurchaseOrderHeader";
import { PurchaseOrderList } from "@/components/purchases/PurchaseOrderList";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { usePurchasePrint } from "@/hooks/purchases/use-purchase-print";
import { isSelectQueryError } from "@/utils/type-utils";
import type { PurchaseOrder } from "@/types/purchaseOrder";
import { Dialog, DialogContent } from "@/components/ui/dialog"; 
import { usePurchaseEdit } from "@/hooks/purchases/use-purchase-edit";

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

  // Check if we have an order ID to edit from the location state
  useEffect(() => {
    const state = location.state as { editOrderId?: string } | null;
    if (state?.editOrderId) {
      setSelectedOrderId(state.editOrderId);
      setEditDialogOpen(true);
      
      // Clear the state to avoid reopening the dialog on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  // Process orders to ensure they match the PurchaseOrder type
  useEffect(() => {
    const processedOrders = rawOrders.map(order => {
      // Create properly typed supplier
      let supplier;
      if (isSelectQueryError(order.supplier)) {
        supplier = { 
          id: '',
          name: 'Fournisseur inconnu', 
          phone: '', 
          email: '' 
        };
      } else if (!order.supplier) {
        supplier = {
          id: order.supplier_id || '',
          name: 'Fournisseur non spécifié', 
          phone: '', 
          email: '' 
        };
      } else {
        // Since TypeScript thinks order.supplier might be 'never', we need to use type casting
        const supplierData = order.supplier as any;
        supplier = {
          id: order.supplier_id || (supplierData.id || ''),
          name: supplierData.name || 'Fournisseur non spécifié',
          phone: supplierData.phone || '',
          email: supplierData.email || ''
        };
      }
      
      // Cast the raw order to any type first to avoid TypeScript errors
      const rawOrderAny = order as any;
      
      // Return a complete PurchaseOrder object with required properties
      return {
        ...order,
        supplier,
        deleted: false,
        // Add empty items array if not present using optional chaining
        items: rawOrderAny.items ? rawOrderAny.items : []
      } as unknown as PurchaseOrder;
    });
    
    // Filter processed orders based on search query
    const filtered = processedOrders.filter(order => 
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredOrders(filtered);
  }, [rawOrders, searchQuery]);

  // Handler for printing a purchase order
  const handlePrint = (order: PurchaseOrder) => {
    printPurchaseOrder(order);
  };
  
  // Handler for closing the edit dialog
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
        
        {/* Edit Purchase Order Dialog */}
        {selectedOrderId && (
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-4xl">
              <PurchaseOrderEditForm 
                orderId={selectedOrderId} 
                onClose={handleCloseEditDialog} 
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}

// Purchase Order Edit Form Component
function PurchaseOrderEditForm({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { purchase, isLoading, handleUpdate } = usePurchaseEdit();
  
  if (isLoading) {
    return <div className="p-6 text-center">Chargement...</div>;
  }
  
  if (!purchase) {
    return <div className="p-6 text-center">Bon de commande non trouvé</div>;
  }
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Modifier Bon de Commande #{purchase.order_number}</h2>
      
      {/* We'll implement a simple form for now, you can expand this later */}
      <div className="space-y-4">
        <div>
          <p>Fournisseur: {purchase.supplier?.name}</p>
          <p>Date de création: {new Date(purchase.created_at).toLocaleDateString()}</p>
          <p>Statut: {purchase.status}</p>
          <p>Montant total: {purchase.total_amount?.toLocaleString('fr-FR')} GNF</p>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <button 
            className="px-4 py-2 bg-gray-200 rounded-md"
            onClick={onClose}
          >
            Annuler
          </button>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={onClose}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
