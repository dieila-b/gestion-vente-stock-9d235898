
import { Card } from "@/components/ui/card";
import { CartItem as CartItemType } from "@/types/pos";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types/client";

import { CartHeader } from "./cart/CartHeader";
import { CartItems } from "./cart/CartItems";
import { CartReceiptView } from "./cart/CartReceiptView";
import { CartSummary } from "./cart/CartSummary";
import { CartActions } from "./cart/CartActions";

interface CartProps {
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
}

export function Cart({ 
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
  onSetQuantity
}: CartProps) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
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
    <Card className="w-full glass-panel flex flex-col h-full">
      <CartHeader itemCount={items.length} />

      <div className="flex-1 p-4">
        {(showReceipt || showInvoice) ? (
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
        ) : (
          <CartItems
            items={items}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
            onUpdateDiscount={onUpdateDiscount}
            onSetQuantity={onSetQuantity}
          />
        )}
      </div>

      <div className="sticky bottom-0 p-4 border-t border-white/10 space-y-4 bg-black/80 backdrop-blur-xl">
        <CartSummary
          subtotal={subtotal}
          totalDiscount={totalDiscount}
          total={total}
          selectedClient={selectedClient}
        />

        <div className="grid grid-cols-4 gap-2">
          <CartActions
            showReceipt={showReceipt}
            showInvoice={showInvoice}
            onBack={handleBack}
            onClear={handleClear}
            onCheckout={handleCheckout}
            onPending={handlePending}
            onRestore={handleRestore}
            isLoading={isLoading}
            itemCount={items.length}
            selectedClient={!!selectedClient}
          />
        </div>
      </div>
    </Card>
  );
}
