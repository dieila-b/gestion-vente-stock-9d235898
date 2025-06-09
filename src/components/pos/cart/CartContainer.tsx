
import { CartItem as CartItemType } from "@/types/pos";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types/client_unified";
import { Button } from "@/components/ui/button";
import { X, Edit } from "lucide-react";
import { ClientSelect } from "@/components/pos/ClientSelect";

import { CartHeader } from "./CartHeader";
import { CartItems } from "./CartItems";
import { CartReceiptView } from "./CartReceiptView";
import { CartValidationAlert } from "./CartValidationAlert";
import { CartSummary } from "./CartSummary";
import { CartActions } from "./CartActions";

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
  const [showClientSelect, setShowClientSelect] = useState(false);
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

  const handleClientChange = (client: Client) => {
    // Cette fonction devrait être fournie par le parent pour mettre à jour le client
    setShowClientSelect(false);
    toast({
      title: "Client modifié",
      description: "Le client a été mis à jour"
    });
  };

  const handleClearClient = () => {
    // Cette fonction devrait être fournie par le parent pour supprimer le client
    toast({
      title: "Client supprimé",
      description: "Le client a été retiré du panier"
    });
  };

  const currentDate = new Date().toLocaleString('fr-GN');
  const invoiceNumber = Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b">
        <CartHeader itemCount={items.length} />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {(showReceipt || showInvoice) ? (
          <div className="flex-1 p-6">
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
          <>
            {/* Section client sélectionné avec options de modification */}
            {selectedClient && (
              <div className="flex-shrink-0 p-4 border-b bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <span className="font-medium text-green-700">Client : </span>
                      <span className="text-green-800">
                        {selectedClient.company_name || selectedClient.contact_name || "Client sans nom"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowClientSelect(true)}
                      className="h-8 px-2 text-green-600 hover:text-green-700"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearClient}
                      className="h-8 px-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
                
                {/* Sélecteur de client en mode modification */}
                {showClientSelect && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <ClientSelect
                      selectedClient={null}
                      onClientSelect={handleClientChange}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowClientSelect(false)}
                      className="mt-2"
                    >
                      Annuler
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Cart Items - Section scrollable */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full p-6">
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
            </div>

            {/* Footer fixe en bas */}
            <div className="flex-shrink-0 border-t bg-background">
              <div className="p-6 space-y-4">
                <CartValidationAlert hasValidationErrors={hasValidationErrors} />
                
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
