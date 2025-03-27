import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { CartItem as CartItemType } from "@/types/pos";
import { CartItem } from "@/components/pos/CartItem";
import { Client } from "@/types/client";
import { formatGNF } from "@/lib/currency";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

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

  const hasOutOfStockItems = items.some(item => !item.stock || item.stock === 0);
  const hasLowStockItems = items.some(item => item.stock && item.stock < item.quantity);

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
    if (onCheckout) {
      onCheckout();
    }
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
          <div className="space-y-2 pr-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={(delta) => onUpdateQuantity(item.id, delta)}
                onUpdateDiscount={(productId, discount) => onUpdateDiscount(item.id, discount)}
                onRemove={() => onRemove(item.id)}
                onSetQuantity={onSetQuantity ? 
                  (quantity) => onSetQuantity(item.id, quantity)
                  : undefined}
              />
            ))}
            {items.length > 0 && (hasOutOfStockItems || hasLowStockItems) && (
              <div className="mt-4 p-3 border border-amber-500/30 rounded-md bg-amber-500/10 text-amber-400 text-sm">
                {hasOutOfStockItems ? (
                  <p>Certains produits sont en rupture de stock et seront précommandés. Vous serez notifié lorsqu'ils seront disponibles.</p>
                ) : (
                  <p>Certains produits n'ont pas suffisamment de stock disponible et seront précommandés. Vous serez notifié lorsqu'ils seront disponibles.</p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="sticky bottom-0 p-4 border-t border-white/10 space-y-4 bg-black/80 backdrop-blur-xl">
        {selectedClient && (
          <div className="text-sm text-muted-foreground">
            Client: {selectedClient.company_name || selectedClient.contact_name}
          </div>
        )}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Sous-total</span>
            <span>{formatGNF(subtotal)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between items-center text-sm text-red-400">
              <span>Remises</span>
              <span>-{formatGNF(totalDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total</span>
            <span className="text-gradient">{formatGNF(total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="destructive"
            className="bg-[#ea384c] hover:bg-[#ea384c]/90"
            onClick={clearCart}
          >
            ANNULER
          </Button>
          <Button 
            className="bg-[#22c55e] hover:bg-[#22c55e]/90 text-white text-xs md:text-sm px-2 h-auto min-h-10 py-2 break-words"
            onClick={handleCheckoutClick}
            disabled={isLoading || items.length === 0 || !selectedClient}
            size="auto"
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </Card>
  );
}
