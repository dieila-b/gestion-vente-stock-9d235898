
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatGNF } from "@/lib/currency";

interface StockItem {
  id: string;
  product?: {
    reference?: string;
    name?: string;
    category?: string;
  };
  warehouse?: {
    id?: string;
    name: string;
  };
  pos_location?: {
    id?: string;
    name: string;
  };
  quantity: number;
  unit_price: number;
  total_value: number;
}

interface StockItemRowProps {
  item: StockItem;
}

export function StockItemRow({ item }: StockItemRowProps) {
  return (
    <TableRow key={item.id}>
      <TableCell>{item.product?.reference}</TableCell>
      <TableCell>{item.product?.category}</TableCell>
      <TableCell className="font-medium">
        {item.product?.name}
      </TableCell>
      <TableCell>{item.pos_location?.name || "Non assigné"}</TableCell>
      <TableCell className="text-right">{item.quantity}</TableCell>
      <TableCell className="text-right">
        {formatGNF(item.unit_price)}
      </TableCell>
      <TableCell className="text-right">
        {formatGNF(item.total_value)}
      </TableCell>
    </TableRow>
  );
}
