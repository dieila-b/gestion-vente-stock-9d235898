
import { Card } from "@/components/ui/card";
import { CartItem as CartItemType } from "@/types/pos";
import { Client } from "@/types/client";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { CartHeader } from "./cart/CartHeader";
import { CartItems } from "./cart/CartItems";
import { CartSummary } from "./cart/CartSummary";
import { CartActions } from "./cart/CartActions";

interface PreorderCartProps {
  items: CartItemType[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
  onCheckout: () => void;
  isLoading: boolean;
  selectedClient: Client | null;
  clearCart: () => void;
  onSetQuantity?: (productId: string, quantity: number) => void;
}

export function PreorderCart({
  items,
  onUpdateQuantity,
  onRemove,
  onUpdateDiscount,
  onCheckout,
  isLoading,
  selectedClient,
  clearCart,
  onSetQuantity
}: PreorderCartProps) {
  const [subtotal, setSubtotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchParams] = useSearchParams();
  const isEditing = !!searchParams.get('edit');

  // Recalculate totals whenever items array changes
  useEffect(() => {
    const newSubtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const newTotalDiscount = items.reduce((total, item) => total + ((item.discount || 0) * item.quantity), 0);
    const newTotal = newSubtotal - newTotalDiscount;
    
    setSubtotal(newSubtotal);
    setTotalDiscount(newTotalDiscount);
    setTotal(newTotal);

    console.log("Recalculating totals:", { newSubtotal, newTotalDiscount, newTotal, items });
  }, [items]);

  const hasOutOfStockItems = items.some(item => !item.stock || item.stock === 0);
  const hasLowStockItems = items.some(item => item.stock && item.stock < item.quantity);

  console.log("PreorderCart state:", { 
    itemsLength: items.length, 
    isLoading, 
    hasSelectedClient: !!selectedClient,
    buttonDisabled: isLoading || items.length === 0 || !selectedClient,
    subtotal,
    totalDiscount,
    total
  });

  const handleCheckoutClick = () => {
    console.log("PreorderCart: handleCheckoutClick called");
    if (onCheckout) {
      onCheckout();
    }
  };

  return (
    <Card className="w-full glass-panel flex flex-col h-full">
      <CartHeader itemCount={items.length} />

      <div className="flex-1 p-4">
        <CartItems
          items={items}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
          onUpdateDiscount={onUpdateDiscount}
          onSetQuantity={onSetQuantity}
          hasOutOfStockItems={hasOutOfStockItems}
          hasLowStockItems={hasLowStockItems}
        />
      </div>

      <div className="sticky bottom-0 p-4 border-t border-white/10 space-y-4 bg-black/80 backdrop-blur-xl">
        <CartSummary
          subtotal={subtotal}
          totalDiscount={totalDiscount}
          total={total}
          selectedClient={selectedClient}
        />

        <CartActions
          onClear={clearCart}
          onCheckout={handleCheckoutClick}
          isLoading={isLoading}
          itemCount={items.length}
          selectedClient={!!selectedClient}
          isEditing={isEditing}
        />
      </div>
    </Card>
  );
}
