
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  GeneralInfoSection, 
  AdditionalCostsSection, 
  NotesSection, 
  ProductsSection,
  StatusSection
} from "./FormSections";
import { usePurchaseEdit } from "@/hooks/purchases/use-purchase-edit";
import { Loader } from "lucide-react";
import { toast } from "sonner";

interface PurchaseOrderEditFormProps {
  orderId: string;
  onClose: () => void;
}

export function PurchaseOrderEditForm({ orderId, onClose }: PurchaseOrderEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    purchase,
    formData,
    orderItems,
    isLoading,
    updateFormField,
    updateItemQuantity,
    updateItemPrice,
    removeItem,
    addItem,
    saveChanges,
    deliveryStatus,
    paymentStatus,
    updateStatus,
    updatePaymentStatus,
    setFormData
  } = usePurchaseEdit(orderId);
  
  // Calculate order totals from orderItems and formData
  const subtotal = orderItems?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;
  const taxAmount = subtotal * ((formData?.tax_rate || 0) / 100);
  const totalTTC = subtotal + taxAmount;
  const totalAmount = totalTTC + 
    (formData?.shipping_cost || 0) + 
    (formData?.transit_cost || 0) + 
    (formData?.logistics_cost || 0) - 
    (formData?.discount || 0);
  
  useEffect(() => {
    console.log("PurchaseOrderEditForm - orderId:", orderId);
    console.log("PurchaseOrderEditForm - orderItems:", orderItems?.length || 0);
    console.log("PurchaseOrderEditForm - calculated totals:", { subtotal, taxAmount, totalTTC, totalAmount });
    console.log("PurchaseOrderEditForm - formData:", formData);
    
    // Update form data with calculated totals
    if (formData && setFormData) {
      setFormData({
        ...formData,
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_ttc: totalTTC,
        total_amount: totalAmount
      });
    }
  }, [orderId, orderItems, formData?.tax_rate, formData?.shipping_cost, formData?.transit_cost, formData?.logistics_cost, formData?.discount]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      console.log("Saving purchase order with calculated totals:", {
        subtotal,
        taxAmount,
        totalTTC,
        totalAmount
      });
      
      // Make sure form data includes the latest calculated totals
      if (formData && setFormData) {
        setFormData({
          ...formData,
          subtotal: subtotal,
          tax_amount: taxAmount,
          total_ttc: totalTTC,
          total_amount: totalAmount,
          updated_at: new Date().toISOString()
        });
      }
      
      console.log("Form data before save:", formData);
      
      const success = await saveChanges();
      
      if (success) {
        toast.success("Modifications enregistrées avec succès");
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        toast.error("Erreur lors de l'enregistrement des modifications");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8 py-4">
      <GeneralInfoSection 
        purchase={purchase}
        formData={formData}
        updateFormField={updateFormField}
      />

      <ProductsSection
        items={orderItems || []}
        updateItemQuantity={updateItemQuantity}
        updateItemPrice={updateItemPrice}
        removeItem={removeItem}
        addItem={addItem}
      />

      <AdditionalCostsSection 
        formData={formData}
        updateFormField={updateFormField}
        totalAmount={totalAmount}
      />

      <StatusSection
        deliveryStatus={deliveryStatus}
        paymentStatus={paymentStatus}
        updateStatus={updateStatus}
        updatePaymentStatus={updatePaymentStatus}
      />

      <NotesSection
        notes={formData?.notes || ''}
        updateFormField={updateFormField}
      />
      
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isSaving}
        >
          Annuler
        </Button>
        <Button 
          type="submit"
          disabled={isSaving}
          className="neo-gradient"
        >
          {isSaving ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer'
          )}
        </Button>
      </div>
    </form>
  );
}
