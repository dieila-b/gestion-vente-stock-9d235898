
import { formatGNF } from "@/lib/currency";
import { CartItemDisplayProps } from "./CartItemTypes";

export function CartItemDisplay({
  item,
  unitPriceAfterDiscount,
  itemTotal,
  onRemove,
}: CartItemDisplayProps) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">
        PU: {formatGNF(unitPriceAfterDiscount)}
      </div>
      <div className="text-sm font-medium text-primary">
        {formatGNF(itemTotal)}
      </div>
    </div>
  );
}
