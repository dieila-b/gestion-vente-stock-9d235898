
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; 
import { usePurchaseEdit } from "@/hooks/purchases/use-purchase-edit";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogTitle>Modifier Bon de Commande</DialogTitle>
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
  const { 
    purchase, 
    isLoading, 
    formData,
    updateFormField,
    saveChanges,
    deliveryStatus, 
    paymentStatus, 
    updateStatus, 
    updatePaymentStatus 
  } = usePurchaseEdit(orderId);
  
  const handleSave = async () => {
    const success = await saveChanges();
    if (success) {
      onClose();
    }
  };
  
  if (isLoading) {
    return <div className="p-6 text-center">Chargement...</div>;
  }
  
  if (!purchase) {
    return <div className="p-6 text-center">Bon de commande non trouvé</div>;
  }
  
  return (
    <div className="p-4 space-y-6">
      <h3 className="text-lg font-semibold">Informations générales</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Numéro de commande</Label>
          <Input 
            value={formData.order_number || ''}
            onChange={(e) => updateFormField('order_number', e.target.value)}
          />
        </div>
        
        <div>
          <Label>Fournisseur</Label>
          <Input value={purchase.supplier?.name} readOnly />
        </div>
        
        <div>
          <Label>Date de création</Label>
          <Input value={formatDate(purchase.created_at)} readOnly />
        </div>
        
        <div>
          <Label>Date de livraison prévue</Label>
          <Input 
            type="date"
            value={formData.expected_delivery_date ? formData.expected_delivery_date.split('T')[0] : ''}
            onChange={(e) => updateFormField('expected_delivery_date', e.target.value)}
          />
        </div>
        
        <div>
          <Label>Statut</Label>
          <Select 
            value={deliveryStatus}
            onValueChange={(value) => updateStatus(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="delivered">Livré</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Statut de paiement</Label>
          <Select 
            value={paymentStatus}
            onValueChange={(value) => updatePaymentStatus(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="partial">Partiel</SelectItem>
              <SelectItem value="paid">Payé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6">Coûts additionnels</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Remise</Label>
          <Input 
            type="number"
            value={formData.discount || 0}
            onChange={(e) => updateFormField('discount', Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label>Frais de livraison</Label>
          <Input 
            type="number"
            value={formData.shipping_cost || 0}
            onChange={(e) => updateFormField('shipping_cost', Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label>Frais de transit</Label>
          <Input 
            type="number"
            value={formData.transit_cost || 0}
            onChange={(e) => updateFormField('transit_cost', Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label>Frais logistiques</Label>
          <Input 
            type="number"
            value={formData.logistics_cost || 0}
            onChange={(e) => updateFormField('logistics_cost', Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label>Taux TVA (%)</Label>
          <Input 
            type="number"
            value={formData.tax_rate || 0}
            onChange={(e) => updateFormField('tax_rate', Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label>Montant total</Label>
          <Input value={`${purchase.total_amount?.toLocaleString('fr-FR')} GNF`} readOnly />
        </div>
      </div>
      
      <div>
        <Label>Notes</Label>
        <Textarea 
          value={formData.notes || ''}
          onChange={(e) => updateFormField('notes', e.target.value)}
          rows={3}
        />
      </div>
        
      <h3 className="text-lg font-semibold mt-6">Produits</h3>
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Produit</th>
              <th className="p-2 text-right">Quantité</th>
              <th className="p-2 text-right">Prix unitaire</th>
              <th className="p-2 text-right">Prix vente</th>
              <th className="p-2 text-right">Prix total</th>
            </tr>
          </thead>
          <tbody>
            {purchase.items?.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.product?.name || `Produit #${item.product_id}`}</td>
                <td className="p-2 text-right">
                  <Input
                    type="number"
                    value={item.quantity}
                    className="w-20 text-right"
                    min={1}
                    disabled
                  />
                </td>
                <td className="p-2 text-right">
                  <Input
                    type="number"
                    value={item.unit_price}
                    className="w-28 text-right"
                    min={0}
                    disabled
                  />
                </td>
                <td className="p-2 text-right">
                  <Input
                    type="number"
                    value={item.selling_price || 0}
                    className="w-28 text-right"
                    min={0}
                    disabled
                  />
                </td>
                <td className="p-2 text-right">{item.total_price?.toLocaleString('fr-FR')} GNF</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <Button 
          variant="outline"
          onClick={onClose}
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSave}
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
