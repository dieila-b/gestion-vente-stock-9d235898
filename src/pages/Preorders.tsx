
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PreorderCart } from '@/components/preorder/PreorderCart';
import { PreorderClient } from '@/components/preorder/PreorderClient';
import { PreorderProductList } from '@/components/preorder/PreorderProductList';
import { usePreorderCart } from '@/components/preorder/hooks/usePreorderCart';
import { usePreorderActions } from '@/components/preorder/hooks/usePreorderActions';
import { usePreorderPayment } from '@/components/preorder/hooks/usePreorderPayment';
import { PaymentDialog } from '@/components/pos/PaymentDialog';
import { InvoicePreview } from '@/components/preorder/InvoicePreview';

export default function Preorders() {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [currentPreorder, setCurrentPreorder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get preorder cart data (if editing)
  const preorderCartData = usePreorderCart();
  
  // Get preorder actions for cart management 
  const preorderActions = usePreorderActions(preorderCartData.client, preorderCartData.cart);
  
  // Combine the data and actions for use in components
  const combinedPreorderData = {
    ...preorderCartData,
    ...preorderActions
  };

  // Handle payment processing
  const { handleCheckout, handlePayment } = usePreorderPayment(
    combinedPreorderData.client,
    combinedPreorderData.cart,
    combinedPreorderData.clearCart,
    setShowPaymentDialog,
    setCurrentPreorder,
    setShowInvoiceDialog,
    false,
    null,
    setIsLoading
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Précommandes</h1>
          <p className="text-muted-foreground">
            Créez et gérez les précommandes de vos clients
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <PreorderClient client={combinedPreorderData.client} setClient={combinedPreorderData.setClient} />
            <PreorderProductList 
              selectedClient={combinedPreorderData.client}
              addToCart={combinedPreorderData.addToCart}
            />
          </div>

          <div className="lg:col-span-4">
            <PreorderCart 
              cart={combinedPreorderData.cart}
              updateQuantity={combinedPreorderData.updateQuantity}
              removeFromCart={combinedPreorderData.removeFromCart}
              updateDiscount={combinedPreorderData.updateDiscount} 
              calculateTotal={combinedPreorderData.calculateTotal}
              calculateSubtotal={combinedPreorderData.calculateSubtotal}
              calculateTotalDiscount={combinedPreorderData.calculateTotalDiscount}
              onCheckout={() => handleCheckout(combinedPreorderData.validatePreorder)}
              isLoading={isLoading}
            />
          </div>
        </div>

        {showPaymentDialog && (
          <PaymentDialog
            isOpen={showPaymentDialog}
            onClose={() => setShowPaymentDialog(false)}
            totalAmount={combinedPreorderData.calculateTotal()}
            onSubmitPayment={handlePayment}
            items={combinedPreorderData.cart.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity
            }))}
          />
        )}

        {showInvoiceDialog && currentPreorder && (
          <InvoicePreview
            isOpen={showInvoiceDialog}
            onClose={() => setShowInvoiceDialog(false)}
            preorder={currentPreorder}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
