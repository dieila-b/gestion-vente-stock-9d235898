
import { usePurchaseEdit } from "@/hooks/purchases/use-purchase-edit";
import { 
  GeneralInfoSection,
  StatusSection,
  AdditionalCostsSection,
  NotesSection,
  ProductsSection,
  FormActions
} from "./FormSections";

interface PurchaseOrderEditFormProps {
  orderId: string;
  onClose: () => void;
}

export function PurchaseOrderEditForm({ orderId, onClose }: PurchaseOrderEditFormProps) {
  const { 
    purchase, 
    isLoading, 
    formData,
    updateFormField,
    saveChanges,
    updateItemQuantity,
    updateItemPrice,
    removeItem,
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
  
  // Ensure purchase status is one of the valid enum values
  const validPurchase = {
    ...purchase,
    status: (purchase.status as string in ["draft", "pending", "delivered", "approved"]) 
      ? purchase.status as "draft" | "pending" | "delivered" | "approved"
      : "draft"
  };
  
  return (
    <div className="p-4 space-y-6">
      <h3 className="text-lg font-semibold">Informations générales</h3>
      
      <GeneralInfoSection 
        purchase={validPurchase}
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
        totalAmount={validPurchase.total_amount}
      />
      
      <NotesSection 
        notes={formData.notes || ''}
        updateFormField={updateFormField}
      />
        
      <h3 className="text-lg font-semibold mt-6">Produits</h3>
      
      <ProductsSection 
        items={validPurchase.items || []}
        updateItemQuantity={updateItemQuantity}
        updateItemPrice={updateItemPrice}
        removeItem={removeItem}
      />
      
      <FormActions 
        onSave={handleSave}
        onCancel={onClose}
      />
    </div>
  );
}
