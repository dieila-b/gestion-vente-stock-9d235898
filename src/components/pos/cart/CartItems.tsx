
import { CartItem as CartItemType } from "@/types/pos";
import { CartItem } from "@/components/pos/CartItem";
import { useState, useCallback } from "react";

interface CartItemsProps {
  items: CartItemType[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
  onSetQuantity?: (productId: string, quantity: number) => void;
  hasOutOfStockItems: boolean;
  hasLowStockItems: boolean;
  availableStock?: Record<string, number>;
  onValidationChange?: (hasErrors: boolean) => void;
}

export function CartItems({
  items,
  onUpdateQuantity,
  onRemove,
  onUpdateDiscount,
  onSetQuantity,
  hasOutOfStockItems,
  hasLowStockItems,
  availableStock = {},
  onValidationChange
}: CartItemsProps) {
  const [itemErrors, setItemErrors] = useState<Record<string, boolean>>({});

  const handleItemValidationError = useCallback((itemId: string, hasError: boolean) => {
    setItemErrors(prev => {
      const newErrors = { ...prev, [itemId]: hasError };
      
      const hasAnyErrors = Object.values(newErrors).some(error => error);
      if (onValidationChange) {
        onValidationChange(hasAnyErrors);
      }
      
      return newErrors;
    });
  }, [onValidationChange]);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground h-full">
        <div className="text-center">
          <p className="text-lg mb-2">Panier vide</p>
          <p className="text-sm">Ajoutez des produits pour commencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header des colonnes - fixe */}
      <div className="flex-shrink-0 p-3 bg-muted/30 rounded-lg border mb-4">
        <div className="grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground">
          <div className="col-span-4">Nom d'article</div>
          <div className="col-span-3 text-center">Quantité</div>
          <div className="col-span-2 text-center">Remise</div>
          <div className="col-span-2 text-center">Prix / Total</div>
          <div className="col-span-1 text-center">Action</div>
        </div>
      </div>
      
      {/* Liste des items - zone scrollable qui occupe tout l'espace restant */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-2">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={(delta) => onUpdateQuantity(item.id, delta)}
            onUpdateDiscount={(productId, discount) => onUpdateDiscount(item.id, discount)}
            onRemove={() => onRemove(item.id)}
            onSetQuantity={onSetQuantity ? (quantity) => onSetQuantity(item.id, quantity) : undefined}
            availableStock={availableStock[item.id] || 0}
            onValidationError={(hasError) => handleItemValidationError(item.id, hasError)}
          />
        ))}
        
        {(hasOutOfStockItems || hasLowStockItems) && (
          <div className="mt-4 p-3 border border-amber-500/30 rounded-lg bg-amber-500/10 text-amber-400 text-sm">
            {hasOutOfStockItems ? (
              <p>⚠️ Certains produits sont en rupture de stock et seront précommandés. Vous serez notifié lorsqu'ils seront disponibles.</p>
            ) : (
              <p>⚠️ Certains produits n'ont pas suffisamment de stock disponible et seront précommandés. Vous serez notifié lorsqu'ils seront disponibles.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
