
import { formatGNF } from "@/lib/currency";
import { useOrderStatus } from "./hooks/useOrderStatus";

interface OrderItemRowProps {
  item: any;
}

export function OrderItemRow({ item }: OrderItemRowProps) {
  const { getItemStatusIcon, getItemStatusText } = useOrderStatus();

  return (
    <li className="flex justify-between items-center py-2 border-b border-white/10">
      <div className="flex items-center gap-2">
        {getItemStatusIcon(item.status)}
        <span>
          {item.product?.name} 
          <span className="text-muted-foreground ml-2 text-sm">
            ({item.quantity} × {formatGNF(item.unit_price)})
          </span>
        </span>
      </div>
      <div className="text-right">
        <div>{formatGNF(item.total_price)}</div>
        <div className="text-xs text-muted-foreground">
          Stock: {item.product?.stock || 0} • {getItemStatusText(item.status)}
        </div>
      </div>
    </li>
  );
}
