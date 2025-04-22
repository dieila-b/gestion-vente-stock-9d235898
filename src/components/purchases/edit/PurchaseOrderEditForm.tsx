
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { usePurchaseEdit } from "@/hooks/purchases/use-purchase-edit";
import { 
  GeneralInfoSection,
  StatusSection,
  AdditionalCostsSection,
  NotesSection,
  ProductsSection,
  FormActions
} from "./FormSections";
import { PurchaseOrder } from "@/types/purchase-order";

interface PurchaseOrderEditFormProps {
  orderId: string;
  onClose: () => void;
}

export function PurchaseOrderEditForm({ orderId, onClose }: PurchaseOrderEditFormProps) {
  console.log("Editing purchase order with ID:", orderId);
  
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
  
  const handleSave = async () => {
    const success = await saveChanges();
    if (success) {
      onClose();
    }
  };
  
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogTitle>Modifier Bon de Commande</DialogTitle>
      
      {isLoading ? (
        <div className="p-6 text-center">Chargement...</div>
      ) : !purchase ? (
        <div className="p-6 text-center">Bon de commande non trouvé</div>
      ) : (
        <div className="p-4 space-y-6">
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
          />
        </div>
      )}
    </DialogContent>
  );
}
