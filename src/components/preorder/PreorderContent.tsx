
import { useState } from "react";
import { ClientSelect } from "@/components/pos/ClientSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CartItem, Product } from "@/types/pos";
import { Client } from "@/types/client";
import { PreorderInvoiceView } from "./PreorderInvoiceView";
import { ProductSelector } from "../pos/ProductSelector";

interface PreorderContentProps {
  cart: CartItem[];
  client: Client | null;
  onClientSelect: (client: Client) => void;
  onAddToCart: (product: Product) => void;
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRequestPayment: () => void;
  isLoading: boolean;
  isInvoiceOpen: boolean;
  setIsInvoiceOpen: (open: boolean) => void;
  calculateTotal: () => number;
  calculateSubtotal: () => number;
  calculateTotalDiscount: () => number;
  onUpdateDiscount: (id: string, discount: number) => void;
  notes: string;
  onUpdateNotes: (notes: string) => void;
}

export function PreorderContent({
  cart,
  client,
  onClientSelect,
  onAddToCart,
  onRemoveItem,
  onUpdateQuantity,
  onRequestPayment,
  isLoading,
  isInvoiceOpen,
  setIsInvoiceOpen,
  calculateTotal,
  calculateSubtotal,
  calculateTotalDiscount,
  onUpdateDiscount,
  notes,
  onUpdateNotes
}: PreorderContentProps) {
  const [showProductSelector, setShowProductSelector] = useState(false);
  
  return (
    <div className="container py-6 max-w-5xl">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Selection */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Client</h2>
          <ClientSelect
            selectedClient={client}
            onClientSelect={onClientSelect}
          />
        </Card>

        {/* Product Selection */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Produits</h2>
          {showProductSelector ? (
            <div className="space-y-4">
              <ProductSelector 
                onProductSelect={(product) => {
                  onAddToCart(product);
                  setShowProductSelector(false);
                }}
                showOutOfStock={true}
              />
              <Button 
                variant="outline" 
                onClick={() => setShowProductSelector(false)}
                className="w-full"
              >
                Annuler
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setShowProductSelector(true)}
              className="w-full"
            >
              Ajouter des produits
            </Button>
          )}
        </Card>
      </div>

      {/* Cart/Invoice View */}
      <div className="mt-6">
        <PreorderInvoiceView
          cart={cart}
          client={client}
          onRemoveItem={onRemoveItem}
          onUpdateQuantity={onUpdateQuantity}
          onRequestPayment={onRequestPayment}
          isLoading={isLoading}
          isInvoiceOpen={isInvoiceOpen}
          setIsInvoiceOpen={setIsInvoiceOpen}
          calculateTotal={calculateTotal}
          calculateSubtotal={calculateSubtotal}
          calculateTotalDiscount={calculateTotalDiscount}
          onUpdateDiscount={onUpdateDiscount}
          notes={notes}
          onUpdateNotes={onUpdateNotes}
        />
      </div>
    </div>
  );
}
