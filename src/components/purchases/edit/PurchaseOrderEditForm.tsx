
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

  // We explicitly assert types here to avoid spreading union type that includes string etc.
  const validPurchase: PurchaseOrder = {
    id: purchase.id,
    order_number: purchase.order_number || '',
    created_at: purchase.created_at,
    updated_at: purchase.updated_at,
    status: ['draft', 'pending', 'delivered', 'approved'].includes(purchase.status) ? purchase.status : 'draft',
    supplier_id: purchase.supplier_id,
    discount: purchase.discount || 0,
    expected_delivery_date: purchase.expected_delivery_date || '',
    notes: purchase.notes || '',
    logistics_cost: purchase.logistics_cost || 0,
    transit_cost: purchase.transit_cost || 0,
    tax_rate: purchase.tax_rate || 0,
    shipping_cost: purchase.shipping_cost || 0,
    subtotal: purchase.subtotal || 0,
    tax_amount: purchase.tax_amount || 0,
    total_ttc: purchase.total_ttc || 0,
    total_amount: purchase.total_amount || 0,
    paid_amount: purchase.paid_amount || 0,
    payment_status: ['pending', 'partial', 'paid'].includes(purchase.payment_status) ? purchase.payment_status : 'pending',
    warehouse_id: purchase.warehouse_id,
    supplier: purchase.supplier,
    warehouse: purchase.warehouse,
    items: purchase.items || [],
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
        items={validPurchase.items}
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

