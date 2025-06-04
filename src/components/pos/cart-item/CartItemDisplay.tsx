
import { Trash2 } from "lucide-react";
import { formatGNF } from "@/lib/currency";
import { CartItemDisplayProps } from "./CartItemTypes";

export function CartItemDisplay({
  item,
  unitPriceAfterDiscount,
  itemTotal,
  onRemove,
}: CartItemDisplayProps) {
  return (
    <>
      <div className="col-span-4 truncate text-left" title={item.name}>
        {item.name}
      </div>
      
      <div className="col-span-2 text-left">
        {formatGNF(unitPriceAfterDiscount)}
      </div>
      
      <div className="col-span-1 text-left">
        {formatGNF(itemTotal)}
      </div>
      
      <div className="col-span-1 flex justify-end">
        <button
          onClick={onRemove}
          className="text-destructive hover:text-destructive/80"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
