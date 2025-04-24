
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatGNF } from "@/lib/currency";
import { Loader, Trash } from "lucide-react";
import { PurchaseOrderItem } from "@/types/purchase-order";

interface ProductItemProps {
  item: PurchaseOrderItem;
  onQuantityChange: (itemId: string, value: string) => void;
  onPriceChange: (itemId: string, value: string) => void;
  onRemove: (itemId: string) => void;
  isLoading: boolean;
  actionItemId: string | null;
}

export function ProductItem({
  item,
  onQuantityChange,
  onPriceChange,
  onRemove,
  isLoading,
  actionItemId
}: ProductItemProps) {
  return (
    <div className="grid grid-cols-12 gap-4 p-4 items-center rounded-md border border-white/10 bg-black/40 neo-blur">
      <div className="col-span-4">
        <div className="font-medium text-white">{item.product?.name || "Produit inconnu"}</div>
        <div className="text-xs text-white/60">{item.product?.reference || "Sans référence"}</div>
      </div>
      
      <div className="col-span-2">
        <Input
          type="number"
          value={item.quantity}
          min={1}
          onChange={(e) => onQuantityChange(item.id, e.target.value)}
          className="text-center neo-blur"
          disabled={isLoading && actionItemId === item.id}
        />
      </div>
      
      <div className="col-span-2">
        <Input
          type="number"
          value={item.unit_price}
          min={0}
          onChange={(e) => onPriceChange(item.id, e.target.value)}
          className="text-center neo-blur"
          disabled={isLoading && actionItemId === item.id}
        />
      </div>
      
      <div className="col-span-3 text-center font-medium">
        {formatGNF(item.quantity * item.unit_price)}
      </div>
      
      <div className="col-span-1 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onRemove(item.id)}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
          disabled={isLoading && actionItemId === item.id}
        >
          {isLoading && actionItemId === item.id ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Trash className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
