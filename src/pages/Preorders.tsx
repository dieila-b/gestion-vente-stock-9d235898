
import { PaymentDialog } from "@/components/pos/PaymentDialog";
import { usePreorderState } from "@/components/preorder/hooks/usePreorderState";
import { usePreorderCart } from "@/components/preorder/hooks/usePreorderCart";
import { usePreorderPayment } from "@/components/preorder/hooks/usePreorderPayment";
import { usePreorderPrinting } from "@/components/preorder/hooks/usePreorderPrinting";
import { PreorderHeader } from "@/components/preorder/PreorderHeader";
import { PreorderContent } from "@/components/preorder/PreorderContent";
import { PreorderInvoiceView } from "@/components/preorder/PreorderInvoiceView";

export default function Preorders() {
  // State management
  const {
    selectedClient,
    setSelectedClient,
    isLoading,
    setIsLoading,
    showPaymentDialog,
    setShowPaymentDialog,
    showInvoiceDialog,
    setShowInvoiceDialog,
    currentPreorder,
    setCurrentPreorder,
    editId,
    isEditing,
    setIsEditing,
    handleCancel,
    handleCloseInvoice,
  } = usePreorderState();

  // Cart management
  const {
    cart,
    updateQuantity,
    removeFromCart,
    updateDiscount,
    clearCart,
    addToCart,
    setCartItemQuantity,
    validatePreorder
  } = usePreorderCart(
    editId,
    setIsEditing,
    setSelectedClient,
    setIsLoading
  );

  // Payment handling
  const {
    handleCheckout,
    handlePayment
  } = usePreorderPayment(
    selectedClient,
    cart,
    clearCart,
    setShowPaymentDialog,
    setCurrentPreorder,
    setShowInvoiceDialog,
    isEditing,
    editId,
    setIsLoading
  );

  // Printing functionality
  const { handlePrintInvoice } = usePreorderPrinting();

  return (
    <div className="p-8">
      <PreorderHeader isEditing={isEditing} />

      <PreorderContent
        selectedClient={selectedClient}
        onSelectClient={setSelectedClient}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onUpdateDiscount={updateDiscount}
        onCheckout={() => handleCheckout(validatePreorder)}
        isLoading={isLoading}
        clearCart={handleCancel}
        onSetQuantity={setCartItemQuantity}
        onAddToCart={addToCart}
      />

      <PaymentDialog 
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        totalAmount={cart.reduce((acc, item) => acc + ((item.price - (item.discount || 0)) * item.quantity), 0)}
        onSubmitPayment={handlePayment}
        items={cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity
        }))}
      />

      {currentPreorder && (
        <PreorderInvoiceView
          showInvoiceDialog={showInvoiceDialog}
          handleCloseInvoice={handleCloseInvoice}
          currentPreorder={currentPreorder}
          handlePrintInvoice={handlePrintInvoice}
        />
      )}
    </div>
  );
}
