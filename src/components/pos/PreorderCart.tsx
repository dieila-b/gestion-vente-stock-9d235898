import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { CartItem as CartItemType } from "@/types/CartState";
import { CartItem } from "@/components/pos/CartItem";
import { Client } from "@/types/client_unified";
import { formatGNF } from "@/lib/currency";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

interface PreorderCartProps {
  items: CartItemType[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
  selectedClient: Client | null;
  clearCart: () => void;
  onSetQuantity?: (productId: string, quantity: number) => void;
  onNotesChange?: (notes: string) => void;
  notes?: string;
}

export function PreorderCart({
  items,
  onUpdateQuantity,
  onRemove,
  onUpdateDiscount,
  onSubmit,
  isLoading,
  selectedClient,
  clearCart,
  onSetQuantity,
  onNotesChange,
  notes = ""
}: PreorderCartProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const calculateTotals = () => {
      const newSubtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const newTotalDiscount = items.reduce((total, item) => total + (item.discount || 0), 0);
      const newTotal = newSubtotal - newTotalDiscount;

      setSubtotal(newSubtotal);
      setTotalDiscount(newTotalDiscount);
      setTotal(newTotal);
    };

    calculateTotals();
  }, [items]);

  const hasOutOfStockItems = false;
  const hasLowStockItems = false;

  const getButtonText = () => {
    if (isLoading) return "Traitement...";
    return isEditing ? "MODIFIER" : "PRÉCOMMANDER";
  };

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
    if (onSubmit) {
      onSubmit();
    }
  };

  const handleDiscountChange = (id: string, value: number) => {
    onUpdateDiscount(id, value);
  };

  return (
    <Card className="w-full glass-panel flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <ShoppingCart className="h-5 w-5" />
          Précommande ({items.length})
        </div>
      </div>

      <div className="flex-1 p-4">
        {items.length > 0 && (
          <div className="grid grid-cols-12 gap-2 px-2 mb-2 text-xs text-muted-foreground">
            <div className="col-span-4">Nom d'article</div>
            <div className="col-span-2 text-center">Qté</div>
            <div className="col-span-2 text-center">Remise</div>
            <div className="col-span-2 text-right">PU TTC</div>
            <div className="col-span-2 text-right pr-8">Total</div>
          </div>
        )}
        <ScrollArea className="h-[calc(100vh-26rem)]">
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mb-2 opacity-50" />
                <p>Votre panier est vide</p>
                <p className="text-sm">Ajoutez des produits pour créer une précommande</p>
              </div>
            ) : (
              items.map((item) => (
                <CartItem
                  key={item.id}
                  item={{
                    ...item,
                    discount: item.discount || 0,
                    category: item.category || "Uncategorized"
                  }}
                  onUpdateQuantity={(delta) => onUpdateQuantity(item.id, delta)}
                  onRemove={() => onRemove(item.id)}
                  onUpdateDiscount={(discount) => handleDiscountChange(item.id, Number(discount))}
                  onSetQuantity={onSetQuantity ? (qty) => onSetQuantity(item.id, qty) : undefined}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="sticky bottom-0 p-4 border-t border-white/10 space-y-4 bg-black/80 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Sous-total:</span>
            <span>{formatGNF(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Remise:</span>
            <span>-{formatGNF(totalDiscount)}</span>
          </div>
          <div className="flex justify-between font-bold pt-1 border-t border-white/10">
            <span>Total:</span>
            <span>{formatGNF(total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={clearCart}
            disabled={isLoading || items.length === 0}
          >
            Annuler
          </Button>
          <Button
            className="w-full"
            onClick={handleCheckoutClick}
            disabled={isLoading || items.length === 0 || !selectedClient}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </Card>
  );
}
