
import { formatGNF } from "@/lib/currency";
import { Trash2 } from "lucide-react";

interface ItemDisplayProps {
  name: string;
  unitPriceAfterDiscount: number;
  itemTotal: number;
  onRemove: () => void;
}

export function ItemDisplay({
  name,
  unitPriceAfterDiscount,
  itemTotal,
  onRemove,
}: ItemDisplayProps) {
  return (
    <>
      <div className="col-span-4 truncate text-left" title={name}>
        {name}
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
