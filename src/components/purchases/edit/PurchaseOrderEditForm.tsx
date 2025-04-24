
import React, { useState, useEffect } from 'react';
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
  
  useEffect(() => {
    if (orderItems) {
      console.log("Order items updated in form:", orderItems.length);
    }
  }, [orderItems]);

  useEffect(() => {
    if (purchase) {
      console.log("Purchase data loaded:", purchase.id);
    } else if (!isLoading) {
      console.log("No purchase data available after loading");
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
      console.log("Saving changes with form data:", formData);
      
      // Toujours appeler onClose après une tentative de sauvegarde, qu'elle réussisse ou échoue
      const savePromise = saveChanges();
      
      // Définissons un délai maximum pour éviter de bloquer l'interface
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), 3000);
      });
      
      // Utilisons Promise.race pour éviter de bloquer l'interface trop longtemps
      const success = await Promise.race([savePromise, timeoutPromise]);
      
      if (success) {
        console.log("Save successful, closing dialog...");
        toast.success("Modifications enregistrées avec succès");
      } else {
        console.error("Save failed or timed out");
        toast.error("Échec de l'enregistrement des modifications");
      }
      
      // Appeler onClose de toute façon pour fermer le dialogue
      console.log("Forcing dialog close regardless of save result");
      onClose();
      
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Erreur lors de l'enregistrement des modifications");
      
      // Même en cas d'erreur, fermer le dialogue
      console.log("Closing dialog due to error");
      onClose();
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
