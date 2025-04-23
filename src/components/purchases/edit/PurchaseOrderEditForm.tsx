
import React, { useState } from 'react';
import { usePurchaseEdit } from '@/hooks/purchases/use-purchase-edit';
import { 
  GeneralInfoSection,
  StatusSection,
  AdditionalCostsSection,
  NotesSection,
  ProductsSection,
  FormActions
} from "./FormSections";
import { PurchaseOrder } from "@/types/purchase-order";
import { Loader, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PurchaseOrderEditFormProps {
  orderId: string;
  onClose: () => void;
}

export function PurchaseOrderEditForm({ orderId, onClose }: PurchaseOrderEditFormProps) {
  console.log("Editing purchase order with ID:", orderId);
  const [isSaving, setIsSaving] = useState(false);
  
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
    orderItems
  } = usePurchaseEdit(orderId);
  
  console.log("Order items in form:", orderItems?.length || 0);
  console.log("Purchase data available:", purchase ? "yes" : "no");
  console.log("Form data:", formData);
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log("Saving changes with form data:", formData);
      
      const success = await saveChanges();
      
      if (success) {
        toast.success("Modifications enregistrées avec succès");
        console.log("Save successful, closing form...");
        
        // Use a slightly longer timeout to ensure everything is processed before closing
        setTimeout(() => {
          console.log("Executing dialog close callback");
          // Force close the dialog
          onClose();
        }, 1000);
      } else {
        toast.error("Échec de l'enregistrement des modifications");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Erreur lors de l'enregistrement des modifications");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="p-4 space-y-6">
      {isLoading ? (
        <div className="p-6 text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement...</p>
        </div>
      ) : !purchase ? (
        <div className="p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-lg">Bon de commande non trouvé</p>
          <p className="text-sm text-gray-400">Le bon de commande que vous essayez de modifier n'existe pas ou n'est pas accessible.</p>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-semibold">Informations générales</h3>
          
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

          <h3 className="text-lg font-semibold mt-6">Coûts additionnels</h3>
          
          <AdditionalCostsSection 
            formData={formData}
            updateFormField={updateFormField}
            totalAmount={purchase.total_amount}
          />
          
          <NotesSection 
            notes={formData.notes || ''}
            updateFormField={updateFormField}
          />
            
          <h3 className="text-lg font-semibold mt-6">Produits</h3>
          
          <ProductsSection 
            items={orderItems || []}
            updateItemQuantity={updateItemQuantity}
            updateItemPrice={updateItemPrice}
            removeItem={removeItem}
            addItem={addItem}
          />
          
          <FormActions 
            onSave={handleSave}
            onCancel={onClose}
            isSaving={isSaving}
          />
        </>
      )}
    </div>
  );
}
