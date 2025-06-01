
import { Card } from "@/components/ui/card";
import { InvoiceForm } from "./InvoiceForm";
import { useInvoiceForm } from "@/hooks/use-invoice-form";
import { DynamicInvoice } from "./dynamic/DynamicInvoice";
import { useState } from "react";
import { InvoicePaymentDialog } from "./payments/InvoicePaymentDialog";
import { useInvoiceOperations } from "@/hooks/invoices/useInvoiceOperations";
import { safeInvoice } from "@/utils/supabase-safe-query";

export const InvoiceFormWrapper = ({ onClose }: { onClose: () => void }) => {
  const {
    formData,
    selectedProducts,
    handleInputChange,
    handleAddProduct,
    handleRemoveProduct,
    handleUpdateQuantity,
    handleUpdateDiscount,
    handleSubmitInvoice,
  } = useInvoiceForm();

  const { createInvoice, isCreating } = useInvoiceOperations();
  const [showPreview, setShowPreview] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);

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
    // Rafraîchir les données de la facture après paiement
    setShowPaymentDialog(false);
  };

  const handleSubmit = async () => {
    try {
      const invoiceData = {
        invoice_number: formData.invoiceNumber,
        client_id: formData.clientId,
        total_amount: finalTotal,
        status: 'pending'
      };

      const items = selectedProducts.map(product => ({
        product_id: product.id,
        quantity: product.quantity,
        unit_price: product.price,
        discount: product.discount || 0,
        total_price: (product.price * product.quantity) - (product.discount || 0)
      }));

      createInvoice({ invoice: invoiceData, items }, {
        onSuccess: (newInvoice) => {
          setCurrentInvoiceId(newInvoice.id);
          setCurrentInvoice(newInvoice);
          setShowPreview(true);
        }
      });
    } catch (error) {
      console.error("Erreur lors de la création de la facture:", error);
    }
  };

  // Make sure invoice object has all required properties
  const invoiceData = safeInvoice(currentInvoice);
  
  // Ensure payment_status is one of the allowed values
  const paymentStatus = invoiceData.payment_status as 'paid' | 'partial' | 'pending';

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
          isLoading={isCreating}
        />
      </Card>

      {showPreview && currentInvoice && (
        <DynamicInvoice
          invoiceNumber={formData.invoiceNumber}
          items={selectedProducts}
          date={new Date().toLocaleDateString()}
          subtotal={subtotal}
          discount={totalDiscount}
          total={finalTotal}
          onDownload={() => setShowPreview(false)}
          paymentStatus={paymentStatus}
          paidAmount={invoiceData.paid_amount}
          remainingAmount={invoiceData.remaining_amount}
          onAddPayment={handleAddPayment}
          clientName={formData.clientName}
        />
      )}

      {showPaymentDialog && currentInvoiceId && (
        <InvoicePaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          invoiceId={currentInvoiceId}
          remainingAmount={invoiceData.remaining_amount || 0}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};
