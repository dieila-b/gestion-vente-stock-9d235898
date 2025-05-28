
import React, { useState, useEffect } from 'react';
import { usePurchaseEdit } from '@/hooks/purchases/use-purchase-edit';
import { 
  GeneralInfoSection,
  StatusSection,
  AdditionalCostsSection,
  NotesSection,
  ProductsSection,
  FormActions
} from "@/components/purchases/edit/FormSections";
import { PurchaseOrder } from "@/types/purchase-order";
import { Loader, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PurchaseOrderEditFormProps {
  orderId: string;
  onClose: () => void;
}

export function PurchaseOrderEditForm({ orderId, onClose }: PurchaseOrderEditFormProps) {
  console.log("Editing purchase order with ID:", orderId);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  
  const { 
    purchase, 
    isLoading, 
    formData,
    updateFormField,
    saveChanges,
    updateItemQuantity,
    updateItemPrice,
    removeItem,
    addItem,
    deliveryStatus, 
    paymentStatus, 
    updateStatus, 
    updatePaymentStatus,
    orderItems,
    refreshTotals
  } = usePurchaseEdit(orderId);
  
  // Fetch latest totals when items change
  useEffect(() => {
    if (orderId && orderItems && orderItems.length > 0) {
      console.log("Items changed, refreshing totals...");
      refreshTotals();
    }
  }, [orderItems, refreshTotals, orderId]);

  // Log orderItems for debugging
  useEffect(() => {
    console.log("Effect: orderItems updated in form:", orderItems?.length || 0);
    if (orderItems && orderItems.length > 0) {
      console.log("First item:", orderItems[0]);
    }
  }, [orderItems]);

  useEffect(() => {
    if (purchase) {
      console.log("Effect: Purchase data loaded:", purchase.id);
    } else if (!isLoading) {
      console.log("Effect: No purchase data available after loading");
    }
  }, [purchase, isLoading]);

  console.log("Form render - Order items in form:", orderItems?.length || 0);
  console.log("Form render - Purchase data available:", purchase ? "yes" : "no");
  console.log("Form render - Form data:", formData);
  
  const handleSave = async () => {
    if (isSaving) {
      console.log("Already saving, ignoring duplicate save request");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Force refresh totals before saving
      await refreshTotals();
      
      console.log("Saving changes with form data:", formData);
      
      const success = await saveChanges();
      
      console.log("Save result:", success ? "successful" : "failed");
      
      if (success) {
        // Force refresh purchase orders list
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        await queryClient.invalidateQueries({ queryKey: ['purchase', orderId] });
        toast.success("Bon de commande mis à jour avec succès");
      }
      
      // Always close the dialog, regardless of success
      onClose();
      
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Erreur lors de l'enregistrement des modifications");
      
      // Close dialog even on error
      onClose();
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      {isLoading ? (
        <div className="p-6 text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement du bon de commande...</p>
        </div>
      ) : !purchase ? (
        <div className="p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-lg">Bon de commande non trouvé</p>
          <p className="text-sm text-gray-400">Le bon de commande que vous essayez de modifier n'existe pas ou n'est pas accessible.</p>
        </div>
      ) : (
        <>
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-semibold text-white">Modifier le bon de commande</h2>
            <p className="text-white/60">Commande #{purchase.order_number}</p>
          </div>
          
          <GeneralInfoSection 
            purchase={purchase as PurchaseOrder}
            formData={formData}
            updateFormField={updateFormField}
          />
          
          <StatusSection 
            deliveryStatus={deliveryStatus}
            paymentStatus={paymentStatus}
            updateStatus={updateStatus}
            updatePaymentStatus={updatePaymentStatus}
          />

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Coûts additionnels</h3>
            <AdditionalCostsSection 
              formData={formData}
              updateFormField={updateFormField}
              totalAmount={purchase.total_amount}
            />
          </div>
          
          <div className="border-t border-white/10 pt-6">
            <NotesSection 
              notes={formData.notes || ''}
              updateFormField={updateFormField}
            />
          </div>
            
          <div className="border-t border-white/10 pt-6">
            <ProductsSection 
              items={orderItems || []}
              updateItemQuantity={updateItemQuantity}
              updateItemPrice={updateItemPrice}
              removeItem={removeItem}
              addItem={addItem}
            />
          </div>
          
          <div className="border-t border-white/10 pt-6">
            <FormActions 
              onSave={handleSave}
              onCancel={onClose}
              isSaving={isSaving}
            />
          </div>
        </>
      )}
    </div>
  );
}
