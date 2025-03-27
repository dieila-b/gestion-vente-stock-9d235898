
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CartItem } from "@/types/pos";

interface EnhancedCartItem extends CartItem {
  total: number;
}

interface PurchaseOrderReceiptItemsProps {
  items: EnhancedCartItem[];
  formatGNF: (amount: number) => string;
}

export function PurchaseOrderReceiptItems({ items, formatGNF }: PurchaseOrderReceiptItemsProps) {
  return (
    <div className="mb-4">
      <Table>
        <TableHeader>
          <TableRow className="bg-red-900 text-white">
            <TableHead className="w-16 text-white">Code</TableHead>
            <TableHead className="text-white">Désignation</TableHead>
            <TableHead className="text-center text-white w-16">Qté</TableHead>
            <TableHead className="text-right text-white w-24">PU</TableHead>
            <TableHead className="text-right text-white w-24">Remise</TableHead>
            <TableHead className="text-right text-white w-24">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id} className="border-b">
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell className="text-center">{item.quantity}</TableCell>
              <TableCell className="text-right">{formatGNF(item.price)}</TableCell>
              <TableCell className="text-right">0</TableCell>
              <TableCell className="text-right">{formatGNF(item.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
