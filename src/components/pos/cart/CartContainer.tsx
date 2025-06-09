
import { Card } from "@/components/ui/card";
import { CartItem as CartItemType } from "@/types/pos";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types/client_unified";

import { CartHeader } from "./CartHeader";
import { CartItems } from "./CartItems";
import { CartReceiptView } from "./CartReceiptView";
import { CartValidationAlert } from "./CartValidationAlert";
import { CartFooter } from "./CartFooter";

interface CartContainerProps {
  items: CartItemType[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
  subtotal: number;
  total: number;
  totalDiscount: number;
  onCheckout: () => void;
  isLoading: boolean;
  selectedClient: Client | null;
  clearCart?: () => void;
  onSetQuantity?: (productId: string, quantity: number) => void;
  availableStock?: Record<string, number>;
}

export function CartContainer({ 
  items, 
  onUpdateQuantity, 
  onRemove,
  onUpdateDiscount,
  subtotal,
  total,
  totalDiscount,
  onCheckout,
  isLoading,
  selectedClient,
  clearCart,
  onSetQuantity,
  availableStock = {}
}: CartContainerProps) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);
  const { toast } = useToast();

  const handlePrint = () => {
    setShowReceipt(false);
    toast({
      title: "Impression réussie",
      description: "Le ticket a été envoyé à l'imprimante"
    });
  };

  const handleClear = () => {
    if (clearCart) {
      clearCart();
      setHasValidationErrors(false);
      toast({
        title: "Panier annulé",
        description: "Le panier a été vidé"
      });
    }
  };

  const handlePending = () => {
    toast({
      title: "Commande en attente",
      description: "La commande a été mise en attente"
    });
  };

  const handleRestore = () => {
    toast({
      title: "Commande restaurée",
      description: "La dernière commande a été restaurée"
    });
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Erreur",
        description: "Le panier est vide",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedClient) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client",
        variant: "destructive"
      });
      return;
    }

    if (hasValidationErrors) {
      toast({
        title: "Erreur",
        description: "Veuillez corriger les erreurs de quantité avant de procéder au paiement",
        variant: "destructive"
      });
      return;
    }
    
    await onCheckout();
    setShowReceipt(true);
  };

  const handleBack = () => {
    setShowReceipt(false);
    setShowInvoice(false);
  };

  const currentDate = new Date().toLocaleString('fr-GN');
  const invoiceNumber = Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="flex flex-col h-full w-full">
      <Card className="flex flex-col h-full w-full glass-panel">
        {/* Header - toujours visible */}
        <div className="flex-shrink-0">
          <CartHeader itemCount={items.length} />
        </div>

        {/* Zone de contenu principal - flexible et scrollable */}
        <div className="flex-1 min-h-0 flex flex-col">
          {(showReceipt || showInvoice) ? (
            <div className="flex-1 overflow-y-auto">
              <CartReceiptView
                showReceipt={showReceipt}
                showInvoice={showInvoice}
                items={items}
                subtotal={subtotal}
                totalDiscount={totalDiscount}
                total={total}
                onPrint={handlePrint}
                selectedClient={selectedClient}
                invoiceNumber={invoiceNumber}
                currentDate={currentDate}
              />
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-hidden">
              <CartItems
                items={items}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
                onUpdateDiscount={onUpdateDiscount}
                onSetQuantity={onSetQuantity}
                hasOutOfStockItems={false}
                hasLowStockItems={false}
                availableStock={availableStock}
                onValidationChange={setHasValidationErrors}
              />
            </div>
          )}
        </div>

        {/* Footer ABSOLUMENT FIXE - toujours visible en bas */}
        <CartFooter
          hasValidationErrors={hasValidationErrors}
          subtotal={subtotal}
          totalDiscount={totalDiscount}
          total={total}
          selectedClient={selectedClient}
          showReceipt={showReceipt}
          showInvoice={showInvoice}
          onBack={handleBack}
          onClear={handleClear}
          onCheckout={handleCheckout}
          onPending={handlePending}
          onRestore={handleRestore}
          isLoading={isLoading}
          itemCount={items.length}
        />
      </Card>
    </div>
  );
}
