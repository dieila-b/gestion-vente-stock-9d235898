import { Card } from "@/components/ui/card";
import { InvoiceForm } from "./InvoiceForm";
import { useInvoiceForm } from "@/hooks/use-invoice-form";
import { DynamicInvoice } from "./dynamic/DynamicInvoice";
import { useState } from "react";
import { InvoicePaymentDialog } from "./payments/InvoicePaymentDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const InvoiceFormWrapper = ({ onClose }: { onClose: () => void }) => {
  const {
    form,
    isSubmitting,
    selectedProducts,
    selectedClient,
    productSearchQuery,
    showProductsModal,
    paymentStatus,
    paidAmount,
    addProduct,
    removeProduct,
    updateProductQuantity,
    updateProductPrice,
    calculateSubtotal,
    calculateTotal,
    handleSubmit: submitInvoice
  } = useInvoiceForm();

  const [showPreview, setShowPreview] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);

  const { data: invoice, refetch: refetchInvoice } = useQuery({
    queryKey: ['invoice', currentInvoiceId],
    queryFn: async () => {
      if (!currentInvoiceId) return null;
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', currentInvoiceId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentInvoiceId
  });

  // Calcul du sous-total des produits
  const subtotal = selectedProducts.reduce((total, product) => {
    return total + (product.price * product.quantity);
  }, 0);

  // Calcul de la remise totale
  const totalDiscount = selectedProducts.reduce((total, product) => {
    return total + (product.discount || 0);
  }, 0);

  // Calcul du total final
  const finalTotal = subtotal - totalDiscount;

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  const handleAddPayment = () => {
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = () => {
    refetchInvoice();
  };

  const handleSubmit = async () => {
    const formValues = form.getValues();
    const newInvoice = await submitInvoice(formValues);
    if (newInvoice?.id) {
      setCurrentInvoiceId(newInvoice.id);
      setShowPreview(true);
    }
  };

  // Create a custom formData object for the InvoiceForm component
  const formData = {
    invoiceNumber: form.getValues("issue_date") ? new Date().toISOString() : generateInvoiceNumber(),
    clientName: selectedClient?.company_name || selectedClient?.contact_name || "",
    clientEmail: selectedClient?.email || "",
    amount: calculateTotal().toString(),
    description: form.getValues("notes") || "",
    vatRate: "20",
    signature: "",
    discount: totalDiscount.toString()
  };

  // Helper functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "clientName" && selectedClient) {
      // Do nothing, client is selected from dropdown
    } else if (name === "description") {
      form.setValue("notes", value);
    } else {
      // Other form fields can be handled here
    }
  };

  // Handle product-related actions
  const handleAddProduct = (product: any) => {
    addProduct(product);
  };

  const handleRemoveProduct = (productId: string) => {
    removeProduct(productId);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateProductQuantity(productId, quantity);
  };

  const handleUpdateDiscount = (productId: string, discount: number) => {
    // Handle discount update
    const product = selectedProducts.find(p => p.product_id === productId);
    if (product) {
      updateProductPrice(productId, product.price, discount);
    }
  };

  // Ensure payment_status is one of the allowed values
  const paymentStatusTyped = invoice?.payment_status as 'paid' | 'partial' | 'pending' || 'pending';

  return (
    <div className="space-y-6">
      <Card className="enhanced-glass p-8 rounded-xl space-y-6 animate-fade-in">
        <InvoiceForm
          formData={formData}
          onClose={onClose}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          selectedProducts={selectedProducts}
          onAddProduct={handleAddProduct}
          onRemoveProduct={handleRemoveProduct}
          onUpdateQuantity={handleUpdateQuantity}
          onUpdateDiscount={handleUpdateDiscount}
          onPreviewToggle={handlePreviewToggle}
        />
      </Card>

      {showPreview && (
        <DynamicInvoice
          invoiceNumber={formData.invoiceNumber}
          items={selectedProducts}
          date={new Date().toLocaleDateString()}
          subtotal={subtotal}
          discount={totalDiscount}
          total={finalTotal}
          onDownload={() => setShowPreview(false)}
          paymentStatus={paymentStatusTyped}
          paidAmount={invoice?.paid_amount}
          remainingAmount={invoice?.remaining_amount}
          onAddPayment={handleAddPayment}
          clientName={formData.clientName}
        />
      )}

      {showPaymentDialog && currentInvoiceId && (
        <InvoicePaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          invoiceId={currentInvoiceId}
          remainingAmount={invoice?.remaining_amount || 0}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

// Helper function to generate invoice number
function generateInvoiceNumber() {
  const prefix = "INV";
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}${month}-${random}`;
}
