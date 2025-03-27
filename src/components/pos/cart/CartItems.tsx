
import { CartItem as CartItemType } from "@/types/pos";
import { CartItem } from "../CartItem";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartItemsProps {
  items: CartItemType[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
  onSetQuantity?: (productId: string, quantity: number) => void;
}

export function CartItems({
  items,
  onUpdateQuantity,
  onRemove,
  onUpdateDiscount,
  onSetQuantity
}: CartItemsProps) {
  return (
    <>
      {items.length > 0 && (
        <div className="grid grid-cols-12 gap-2 px-2 mb-2 text-xs text-muted-foreground">
          <div className="col-span-4 text-left">Nom d'article</div>
          <div className="col-span-2 text-left">Qté</div>
          <div className="col-span-2 text-left">Remise</div>
          <div className="col-span-2 text-left">PU TTC</div>
          <div className="col-span-2 text-left">Total</div>
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
              onSetQuantity={onSetQuantity ? (quantity) => onSetQuantity(item.id, quantity) : undefined}
            />
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
