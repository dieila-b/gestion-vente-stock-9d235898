import React from 'react';
import { ClientSelect } from "@/components/pos/ClientSelect";
import { ProductSelector } from "@/components/pos/ProductSelector";
import { PreorderCart } from "@/components/sales/PreorderCart";
import { Client } from "@/types/client";

interface PreorderContentProps {
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  cart: any[];
  onUpdateQuantity: (id: string, change: number) => void;
  onRemove: (id: string) => void;
  onUpdateDiscount: (id: string, discount: number) => void;
  onCheckout: () => void;
  isLoading: boolean;
  clearCart: () => void;
  onSetQuantity: (id: string, quantity: number) => void;
  onAddToCart: (product: any, quantity?: number) => void;
}

export const PreorderContent = ({ 
  selectedClient, 
  onSelectClient,
  cart,
  onUpdateQuantity,
  onRemove,
  onUpdateDiscount,
  onCheckout,
  isLoading,
  clearCart,
  onSetQuantity,
  onAddToCart
}: PreorderContentProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-8">
        <ClientSelect 
          value={selectedClient} 
          onChange={onSelectClient}
        />
        <ProductSelector 
          onProductSelect={onAddToCart}
          onAddToCart={onAddToCart}
          showOutOfStock
        />
      </div>

      <div className="flex flex-col gap-4">
        <PreorderCart 
          items={cart}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
          onUpdateDiscount={onUpdateDiscount}
          onCheckout={onCheckout}
          isLoading={isLoading}
          selectedClient={selectedClient}
          clearCart={clearCart}
          onSetQuantity={onSetQuantity}
        />
      </div>
    </div>
  );
};
